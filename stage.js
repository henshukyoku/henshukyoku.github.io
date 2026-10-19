(() => {
  const slider = document.querySelector('.logo-slider');
  if (!slider) return;
  const viewport = slider.querySelector('.logo-viewport');
  const slides = [...slider.querySelectorAll('.logo-slide')];
  const controls = slider.querySelector('.logo-controls');
  const dots = slider.querySelector('.logo-dots');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let hovered = false;
  let visible = true;
  let pointerStart = null;
  let dragged = false;

  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', slide.querySelector('img').alt + 'を表示');
    button.addEventListener('click', () => show(index));
    dots.append(button);
    return button;
  });

  const schedule = () => {
    clearTimeout(timer);
    if (!motionQuery.matches && visible && !hovered && !document.hidden && !slider.contains(document.activeElement)) {
      timer = setTimeout(() => show(current + 1), 4200);
    }
  };

  function show(index) {
    const transferFocus = slides.includes(document.activeElement);
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const distance = ((i - current + slides.length + slides.length / 2) % slides.length) - slides.length / 2;
      const depth = Math.abs(distance);
      slide.style.setProperty('--offset', `${distance * 91}%`);
      slide.style.setProperty('--scale', depth === 0 ? '1' : depth === 1 ? '.7' : '.45');
      slide.style.setProperty('--turn', `${distance === 0 ? 0 : -Math.sign(distance) * 17}deg`);
      slide.style.setProperty('--opacity', depth === 0 ? '1' : depth === 1 ? '.8' : depth === 2 ? '.3' : '0');
      slide.style.setProperty('--layer', String(slides.length - depth));
      slide.style.pointerEvents = depth > 2 ? 'none' : 'auto';
      slide.classList.toggle('is-active', i === current);
      slide.tabIndex = i === current ? 0 : -1;
      slide.setAttribute('aria-hidden', String(i !== current));
      buttons[i].setAttribute('aria-current', String(i === current));
    });
    if (transferFocus) slides[current].focus({preventScroll: true});
    schedule();
  }

  slides.forEach((slide, i) => slide.addEventListener('click', event => {
    if (dragged) { event.preventDefault(); dragged = false; return; }
    if (i !== current) { event.preventDefault(); show(i); }
  }));
  slider.querySelector('.logo-prev').addEventListener('click', () => show(current - 1));
  slider.querySelector('.logo-next').addEventListener('click', () => show(current + 1));
  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  slider.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
  slider.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  slider.addEventListener('focusin', schedule);
  slider.addEventListener('focusout', () => setTimeout(schedule, 0));
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointerStart = {x: event.clientX, y: event.clientY};
    dragged = false;
    clearTimeout(timer);
  });
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dragged = true;
      show(current + (dx < 0 ? 1 : -1));
    } else schedule();
  });
  viewport.addEventListener('pointercancel', () => { pointerStart = null; schedule(); });
  motionQuery.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(slider);
  slider.classList.add('is-ready');
  controls.hidden = false;
  show(0);

  // Each circle enters once as its introduction scrolls into view.
  // Paused Web Animations leave the static HTML visible when JS is unavailable.
  if (!motionQuery.matches && typeof Element.prototype.animate === 'function') {
    const entrances = new Map();
    document.querySelectorAll('.performer').forEach((performer, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      const visual = performer.querySelector('.performer__visual');
      const body = performer.querySelector('.performer__body');
      const animations = [
        visual.animate([
          { transform: `translateX(${direction * 95}px) skewX(${direction * -5}deg) scale(.97)`, opacity: 0 },
          { transform: 'translateX(0) skewX(0deg) scale(1)', opacity: 1 }
        ], { duration: 950, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }),
        body.animate([
          { transform: `translateX(${direction * -36}px) translateY(16px)`, opacity: 0 },
          { transform: 'translateX(0) translateY(0)', opacity: 1 }
        ], { duration: 750, delay: 160, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' })
      ];
      animations.forEach(animation => animation.pause());
      entrances.set(performer, animations);
    });
    const performerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entrances.get(entry.target).forEach(animation => animation.play());
        performerObserver.unobserve(entry.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    entrances.forEach((animations, performer) => performerObserver.observe(performer));
    motionQuery.addEventListener('change', event => {
      if (event.matches) {
        performerObserver.disconnect();
        entrances.forEach(animations => animations.forEach(animation => animation.cancel()));
      }
    });
  }

  // Extend the shared menu with keyboard state without changing other pages.
  const container = document.querySelector('#global-container');
  const button = document.querySelector('.mobile-menu__btn');
  const menu = document.querySelector('#stage-menu');
  const syncMenu = () => {
    const open = container.classList.contains('menu-open');
    button.setAttribute('aria-expanded', String(open));
    menu.inert = !open;
  };
  new MutationObserver(syncMenu).observe(container, {attributes: true, attributeFilter: ['class']});
  syncMenu();
  button.addEventListener('keydown', (event) => {
    if (('ontouchstart' in window) && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      button.dispatchEvent(new Event('touchstart'));
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && container.classList.contains('menu-open')) {
      container.classList.remove('menu-open');
      button.focus();
    }
  });
})();
