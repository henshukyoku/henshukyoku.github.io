class MobileMenu {
  constructor() {
    this.DOM = {};
    this.DOM.btn = document.querySelector(".mobile-menu__btn");
    this.DOM.cover = document.querySelector(".mobile-menu__cover");
    this.DOM.container = document.querySelector("#global-container");
    this.DOM.menuItems = document.querySelectorAll(".mobile-menu__item");
    this.eventType = this._getEventType();
    this._addEvent();
  }

  _getEventType() {
    const isTouchCapable = "ontouchstart" in window;
    return isTouchCapable ? "touchstart" : "click";
  }

  _toggle() {
    const isOpen = this.DOM.container.classList.contains("menu-open");
    this.DOM.container.classList.toggle("menu-open");

    const isNowOpen = !isOpen;

    if (isNowOpen) {
      this.DOM.menuItems.forEach((item, index) => {
        const delay = 0.07 * (index + 1);
        item.style.transitionDelay = `${delay}s`;
      });
    } else {
      this.DOM.menuItems.forEach((item) => {
        item.style.transitionDelay = "";
      });
    }
  }

  _addEvent() {
    this.DOM.btn.addEventListener(this.eventType, this._toggle.bind(this));
    this.DOM.cover.addEventListener(this.eventType, this._toggle.bind(this));
  }
}
