(() => {
  // 企画情報はHTMLに保持し、JavaScript無効時にも表示する。
  // 画像が読めない場合だけ、情報を残して画像欄を準備中に戻す。
  document.querySelectorAll('.classroom-image').forEach((image) => {
    const showPlaceholder = () => {
      image.closest('.classroom-poster').hidden = true;
      image.closest('.classroom-frame').querySelector('.classroom-placeholder').hidden = false;
    };
    image.addEventListener('error', showPlaceholder);
    if (image.complete && !image.naturalWidth) showPlaceholder();
  });

  // 共通のメニューデザインを使用し、クリック・タッチ・キーボードに対応。
  const container = document.querySelector("#global-container");
  const button = document.querySelector(".mobile-menu__btn");
  const menu = document.querySelector("#classroom-menu");
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
})();
