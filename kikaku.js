(() => {
  const page = document.querySelector('.program-main');
  if (!page) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const banners = [...page.querySelectorAll('.event-banner')];
  const reveals = new Map();

  // CSSで隠さず、アニメーション中だけ透明にする。JSが使えなくても内容は表示される。
  const reveal = (element, delay = 0) => {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;

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
})();
