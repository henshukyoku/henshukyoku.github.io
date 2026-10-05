(() => {
  const page = document.querySelector('.program-main');
  if (!page) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const banners = [...page.querySelectorAll('.event-banner')];
  const wheel = page.querySelector('.program-wheel');
  const reveals = new Map();

  // CSSで隠さず、アニメーション中だけ透明にする。JSが使えなくても内容は表示される。
  const reveal = (element, delay = 0) => {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    if (wheel.classList.contains('is-windmill') && element.matches('.program-grid > li')) return;

    const animation = element.animate(
      [
        { opacity: 0, transform: 'translateY(-32px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: 1100, delay, easing: 'cubic-bezier(0.22, 0.65, 0.3, 1)', fill: 'backwards' }
    );
    reveals.set(element, animation);
    animation.onfinish = animation.oncancel = () => reveals.delete(element);
  };

  page.querySelectorAll('.program-heading > *').forEach((element, index) => {
    reveal(element, index * 150);
  });

  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        // 外側のliを動かし、リンク自体のホバー・タップ動作と重ならないようにする。
        reveal(entry.target, index * 160);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

    page.querySelectorAll('.program-grid > li, .program-note').forEach(element => {
      observer.observe(element);
    });
  }

  const resetBanners = banners.map(banner => {
    let frame = 0;
    let pointer;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      banner.style.removeProperty('--banner-rotate-x');
      banner.style.removeProperty('--banner-rotate-y');
      banner.classList.remove('is-pressed');
    };

    banner.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      if (wheel.classList.contains('is-windmill')) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;
        // 傾かない外枠を基準にして、画像の端でも動きがぶれないようにする。
        const rect = banner.parentElement.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (pointer.x - rect.left) / rect.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (pointer.y - rect.top) / rect.height * 2 - 1));
        banner.style.setProperty('--banner-rotate-x', `${-y * 3}deg`);
        banner.style.setProperty('--banner-rotate-y', `${x * 3}deg`);
      });
    }, { passive: true });

    banner.addEventListener('pointerdown', event => {
      if (!reducedMotion.matches && event.isPrimary && event.button === 0) {
        banner.classList.add('is-pressed');
      }
    }, { passive: true });

    ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture', 'blur'].forEach(type => {
      banner.addEventListener(type, reset);
    });

    // Tabで移動したときは、登場アニメーションを待たずにリンクを見せる。
    banner.addEventListener('focus', () => {
      const item = banner.parentElement;
      observer?.unobserve(item);
      reveals.get(item)?.cancel();
      reveals.delete(item);
    });

    return reset;
  });

  const resetInteractions = () => resetBanners.forEach(reset => reset());
  const finishReveals = () => {
    reveals.forEach(animation => animation.cancel());
    reveals.clear();
  };

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      finishReveals();
      resetInteractions();
    }
  });
  finePointer.addEventListener('change', resetInteractions);
  window.addEventListener('blur', resetInteractions);
  window.addEventListener('pagehide', () => {
    finishReveals();
    resetInteractions();
  });

  setupMobileOrbit();
  setupWindmill();

  function setupMobileOrbit() {
    if (typeof wheel.animate !== 'function') return;
    const mobile = window.matchMedia('(max-width: 599px)');
    const section = document.createElement('section');
    section.className = 'program-mobile-orbit';
    section.setAttribute('aria-label', 'とこみどりと企画めぐり');
    const scene = document.createElement('div');
    scene.className = 'program-mobile-orbit__scene';
    scene.setAttribute('aria-hidden', 'true');

    // 一覧と同じ画像・企画名を使い、動く装飾にはリンクを重複させない。
    const wind = wheel.querySelector('.program-wheel__wind').cloneNode(true);
    wind.querySelector('defs').remove();
    wind.removeAttribute('class');
    wind.classList.add('program-mobile-orbit__wind');
    scene.append(wind);
    const mascot = wheel.querySelector('.program-wheel__mascot img').cloneNode(true);
    mascot.className = 'program-mobile-orbit__mascot';
    mascot.alt = '';
    scene.append(mascot);
    const cards = banners.map(banner => {
      const card = document.createElement('div');
      card.className = 'program-mobile-orbit__card';
      card.classList.toggle('program-item--ai', banner.classList.contains('event-banner--ai'));
      const visual = banner.querySelector('.event-banner__visual').cloneNode(true);
      visual.querySelector('img').alt = '';
      const title = document.createElement('span');
      title.textContent = banner.querySelector('.event-banner__title').textContent;
      card.append(visual, title);
      scene.append(card);
      return card;
    });
    const jump = document.createElement('a');
    jump.className = 'program-mobile-orbit__jump';
    jump.href = '#program-list';
    jump.textContent = '気になる企画を見つけよう ↓';
    section.append(scene, jump);
    wheel.before(section);

    let animations = [];
    let visible = true;
    let elapsed = 0;
    const globalContainer = document.querySelector('#global-container');
    const playback = () => {
      const paused = !mobile.matches || !visible || reducedMotion.matches ||
        document.hidden || globalContainer.classList.contains('menu-open');
      section.classList.toggle('is-wind-paused', paused);
      animations.forEach(animation => paused ? animation.pause() : animation.play());
    };
    const layout = () => {
      if (animations.length) elapsed = animations[0].currentTime || 0;
      animations.forEach(animation => animation.cancel());
      animations = [];
      if (!mobile.matches) return;
      const radiusX = Math.max(0, (scene.clientWidth - 122) / 2);
      cards.forEach((card, index) => {
        // 横幅に合わせた楕円。カード自体はほぼ正面を保つ。
        const frames = Array.from({ length: 97 }, (_, step) => {
          const angle = (index / cards.length + step / 96) * Math.PI * 2;
          return { transform: `translate(-50%, -50%) translate(${Math.sin(angle) * radiusX}px, ${-Math.cos(angle) * 196}px) rotate(${Math.sin(angle) * 7}deg)` };
        });
        const animation = card.animate(frames, { duration: 90000, iterations: Infinity, easing: 'linear' });
        animation.pause();
        animation.currentTime = elapsed;
        animations.push(animation);
      });
      playback();
    };
    new ResizeObserver(layout).observe(scene);
    mobile.addEventListener('change', layout);
    reducedMotion.addEventListener('change', playback);
    document.addEventListener('visibilitychange', playback);
    window.addEventListener('pageshow', playback);
    window.addEventListener('pagehide', () => animations.forEach(animation => animation.pause()));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        playback();
      }).observe(section);
    }
    new MutationObserver(playback).observe(globalContainer, { attributes: true, attributeFilter: ['class'] });
    layout();
  }

  function setupWindmill() {
    if (typeof wheel.animate !== 'function') return;

    const desktop = window.matchMedia('(min-width: 1200px) and (hover: hover) and (pointer: fine)');
    const grid = wheel.querySelector('.program-grid');
    const blades = [...grid.children];
    const controls = page.querySelector('.program-wheel-tools');
    const viewButton = controls.querySelector('.program-wheel-view');
    const globalContainer = document.querySelector('#global-container');
    const duration = 120000;
    let rotations = [];
    let enabled = false;
    let listView = false;
    let visible = true;
    let elapsed = 0;
    let hovered = null;
    let focused = null;

    const updatePlayback = () => {
      if (!enabled) return;
      const selected = focused || hovered;
      const paused = selected || reducedMotion.matches || !visible ||
        document.hidden || globalContainer.classList.contains('menu-open');
      wheel.classList.toggle('is-wind-paused', Boolean(paused));

      rotations.forEach(animation => {
        if (paused) animation.pause();
        else animation.play();
      });

      blades.forEach((blade, index) => {
        blade.classList.toggle('is-selected', blade === selected);
        if (blade === selected) {
          const turn = ((rotations[index].currentTime || 0) % duration) / duration * 360;
          const angle = (index * 60 + 20 + turn) % 360;
          blade.style.setProperty('--upright-angle', `${angle > 180 ? 360 - angle : -angle}deg`);
        }
      });
    };

    const updateControls = () => {
      controls.hidden = !desktop.matches;
      viewButton.textContent = enabled ? '一覧で見る' : '風車で見る';
    };

    const updateMode = () => {
      if (rotations.length) elapsed = rotations[0].currentTime || 0;
      rotations.forEach(animation => animation.cancel());
      rotations = [];
      hovered = null;
      focused = blades.find(blade => blade.contains(document.activeElement)) || null;
      enabled = desktop.matches && !listView;
      wheel.classList.toggle('is-windmill', enabled);
      document.body.classList.toggle('has-windmill', enabled);
      resetInteractions();

      blades.forEach((blade, index) => {
        reveals.get(blade)?.cancel();
        reveals.delete(blade);
        blade.classList.remove('is-selected');
        blade.style.removeProperty('--upright-angle');
        blade.style.setProperty('--blade-angle', `${index * 60}deg`);
        if (!enabled) return;

        // 6枚を同じ速度で回す。中央のキャラクターは別レイヤーで静止させる。
        const transform = angle => `translate(-50%, -50%) rotate(${angle}deg) translateY(-260px) rotate(20deg)`;
        const rotation = blade.animate(
          [{ transform: transform(index * 60) }, { transform: transform(index * 60 + 360) }],
          { duration, iterations: Infinity, easing: 'linear' }
        );
        rotation.pause();
        rotation.currentTime = elapsed;
        rotations.push(rotation);
      });

      updateControls();
      updatePlayback();
    };

    // 外側の羽根でホバーを判定し、カードが正面を向く間も選択を保つ。
    blades.forEach(blade => {
      blade.addEventListener('pointerenter', event => {
        if (!enabled || event.pointerType !== 'mouse') return;
        hovered = blade;
        updatePlayback();
      });
      blade.addEventListener('pointerleave', () => {
        if (hovered === blade) hovered = null;
        updatePlayback();
      });
    });

    grid.addEventListener('focusin', event => {
      focused = blades.find(blade => blade.contains(event.target)) || null;
      updatePlayback();
    });
    grid.addEventListener('focusout', event => {
      focused = blades.find(blade => blade.contains(event.relatedTarget)) || null;
      updatePlayback();
    });
    viewButton.addEventListener('click', () => {
      listView = !listView;
      updateMode();
    });
    desktop.addEventListener('change', updateMode);
    reducedMotion.addEventListener('change', () => {
      updateControls();
      updatePlayback();
    });
    document.addEventListener('visibilitychange', updatePlayback);
    window.addEventListener('pageshow', updatePlayback);
    window.addEventListener('pagehide', () => rotations.forEach(animation => animation.pause()));

    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
      });
      visibilityObserver.observe(wheel);
    }
    const menuObserver = new MutationObserver(updatePlayback);
    menuObserver.observe(globalContainer, { attributes: true, attributeFilter: ['class'] });

    updateMode();
  }
})();
