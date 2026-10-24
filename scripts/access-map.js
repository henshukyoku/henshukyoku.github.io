(() => {
  const viewer = document.querySelector('.access-map-viewer');
  const trigger = document.querySelector('[data-open-campus-map]');
  if (!viewer || !trigger) return;
  const viewport = viewer.querySelector('.access-map-viewer__viewport');
  const image = viewer.querySelector('img');
  const preview = document.querySelector('.access-campus-map-preview img');
  const imageSource = preview.currentSrc || preview.src;
  const zoomOut = viewer.querySelector('[data-map-zoom="out"]');
  const zoomIn = viewer.querySelector('[data-map-zoom="in"]');
  const zoomSteps = [1, 1.5, 2, 3, 4, 6, 8, 12, 16];
  let zoom = 1;
  let fitWidth = 0;

  function setZoom(nextZoom) {
    const ratio = nextZoom / zoom;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    zoom = nextZoom;
    image.style.width = `${fitWidth * zoom}px`;
    viewer.querySelector('output').value = `${Math.round(zoom * 100)}%`;
    zoomOut.disabled = zoom <= 1;
    zoomIn.disabled = zoom >= zoomSteps[zoomSteps.length - 1];
    viewport.scrollLeft = Math.max(0, centerX * ratio - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, centerY * ratio - viewport.clientHeight / 2);
  }
  function fitMap() {
    if (!viewer.open || !image.naturalWidth) return;
    fitWidth = Math.max(1, Math.min(
      /\.svg(?:[?#]|$)/i.test(imageSource) ? Infinity : image.naturalWidth,
      viewport.clientWidth - 32,
      (viewport.clientHeight - 32) * image.naturalWidth / image.naturalHeight,
    ));
    setZoom(1);
    viewport.scrollTo(0, 0);
  }
  image.addEventListener('load', fitMap);
  trigger.addEventListener('click', () => {
    if (typeof viewer.showModal !== 'function') {
      window.open(imageSource, '_blank', 'noopener');
      return;
    }
    image.src = imageSource;
    viewer.showModal();
    fitMap();
  });
  zoomOut.addEventListener('click', () => setZoom([...zoomSteps].reverse().find(step => step < zoom) || 1));
  zoomIn.addEventListener('click', () => setZoom(zoomSteps.find(step => step > zoom) || zoom));
  viewer.querySelector('[data-map-zoom="reset"]').addEventListener('click', fitMap);
  viewer.querySelector('[data-map-close]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  viewer.addEventListener('close', () => trigger.focus({ preventScroll: true }));
  window.addEventListener('resize', fitMap);
})();
