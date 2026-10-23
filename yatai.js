(() => {
  // 出店情報はHTMLに保持し、JavaScript無効時にも表示する。
  // 画像が読めない場合だけ、情報を残して画像欄を準備中に戻す。
  document.querySelectorAll('.yatai-stall__image').forEach((image) => {
    const showPlaceholder = () => {
      image.closest('.yatai-stall__image-panel').hidden = true;
      image.closest('.yatai-stall__frame').querySelector('.yatai-stall__placeholder').hidden = false;
    };
    image.addEventListener('error', showPlaceholder);
    if (image.complete && !image.naturalWidth) showPlaceholder();
  });

  // 元画像へのリンクを残しつつ、対応ブラウザではページ内で拡大する。
  const viewer = document.querySelector(".yatai-map-viewer");
  const viewport = viewer.querySelector(".yatai-map-viewer__viewport");
  const viewerImage = viewer.querySelector("img");
  const zoomOut = viewer.querySelector('[data-map-zoom="out"]');
  const zoomIn = viewer.querySelector('[data-map-zoom="in"]');
  let mapLink;
  const zoomSteps = [1, 1.5, 2, 3, 4, 6, 8, 12, 16];
  let zoom = 1;
  let fitWidth = 0;
  let previousOverflow = "";

  const setZoom = (nextZoom) => {
    const ratio = nextZoom / zoom;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    zoom = nextZoom;
    viewerImage.style.width = `${fitWidth * zoom}px`;
    viewer.querySelector("output").value = `${Math.round(zoom * 100)}%`;
    zoomOut.disabled = zoom <= 1;
    zoomIn.disabled = zoom >= zoomSteps[zoomSteps.length - 1];
    viewport.scrollLeft = Math.max(0, centerX * ratio - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, centerY * ratio - viewport.clientHeight / 2);
  };
  const fitMap = () => {
    if (!viewer.open || !viewerImage.naturalWidth) return;
    fitWidth = Math.min(
      viewerImage.naturalWidth,
      viewport.clientWidth - 32,
      (viewport.clientHeight - 32) * viewerImage.naturalWidth / viewerImage.naturalHeight,
    );
    setZoom(1);
    viewport.scrollTo(0, 0);
  };
  viewerImage.addEventListener("load", fitMap);
  document.querySelectorAll(".yatai-map-link").forEach((link) => {
    if (typeof viewer.showModal !== "function") return;
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-controls", viewer.id);
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      mapLink = link;
      viewerImage.src = link.href;
      viewerImage.alt = link.querySelector("img").alt;
      viewer.querySelector("h2").textContent = link.closest("figure").querySelector("figcaption").textContent;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      viewer.showModal();
      fitMap();
    });
  });
  zoomOut.addEventListener("click", () => setZoom([...zoomSteps].reverse().find((step) => step < zoom) || 1));
  zoomIn.addEventListener("click", () => setZoom(zoomSteps.find((step) => step > zoom) || zoom));
  viewer.querySelector('[data-map-zoom="reset"]').addEventListener("click", fitMap);
  viewer.querySelector(".yatai-map-viewer__close").addEventListener("click", () => viewer.close());
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      viewer.close();
    }
  });
  viewer.addEventListener("click", (event) => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  viewer.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    mapLink?.focus({ preventScroll: true });
  });
  window.addEventListener("resize", fitMap);

  // 共通のメニューデザインを使用し、クリック・タッチ・キーボードに対応。
  const container = document.querySelector("#global-container");
  const button = document.querySelector(".mobile-menu__btn");
  const menu = document.querySelector("#yatai-menu");
  const content = document.querySelector("#content");
  const footer = document.querySelector(".footer");
  const toggleMenu = (open) => {
    container.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    menu.inert = !open;
    content.inert = open;
    footer.inert = open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) menu.querySelector("a").focus({ preventScroll: true });
    else button.focus({ preventScroll: true });
  };
  button.hidden = false;
  button.addEventListener("click", () => toggleMenu(!container.classList.contains("menu-open")));
  document.querySelector(".mobile-menu__cover").addEventListener("click", () => toggleMenu(false));
  document.addEventListener("keydown", (event) => {
    if (!container.classList.contains("menu-open")) return;
    if (event.key === "Escape") toggleMenu(false);
    if (event.key === "Tab") {
      const links = [...menu.querySelectorAll("a[href]")];
      const focusable = [button, ...links];
      const index = focusable.indexOf(document.activeElement);
      event.preventDefault();
      focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
    }
  });
  // 表示直前に、上から一度だけ静かに降ろす。透明度を変えず点滅を防ぐ。
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      revealObserver.unobserve(target);
      const article = target.querySelector('article');
      if (reducedMotion.matches || !article.animate) return;
      const animation = article.animate([
        { transform: 'translateY(-28px)' },
        { transform: 'translateY(0)' },
      ], { duration: 1000, easing: 'cubic-bezier(.22,.61,.36,1)', iterations: 1 });
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    });
  }, { threshold: 0, rootMargin: '0px 0px 60px 0px' }) : null;
  if (!reducedMotion.matches) {
    document.querySelectorAll('.yatai-stall').forEach((stall) => revealObserver?.observe(stall));
  }
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    revealObserver?.disconnect();
    animations.forEach((animation) => animation.cancel());
  });
})();
