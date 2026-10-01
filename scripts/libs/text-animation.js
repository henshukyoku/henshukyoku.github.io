class TextAnimation {
    constructor(el) {
        this.DOM = {};
        this.DOM.el = el instanceof HTMLElement ? el : document.querySelector(el);
        this.chars = Array.from(this.DOM.el.textContent.trim());
        this.DOM.el.replaceChildren(this._splitText());
    }
    _splitText() {
        const fragment = document.createDocumentFragment();
        this.chars.forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = /\s/.test(char) ? '\u00a0' : char;
            fragment.appendChild(span);
        });
        return fragment;
    }
    animate() {
        this.DOM.el.classList.toggle('inview');
    }
}
class TweenTextAnimation extends TextAnimation {
    constructor(el) {
        super(el);
        this.DOM.chars = this.DOM.el.querySelectorAll('.char');
    }
    
    animate() {
        this.DOM.el.classList.add('inview');
        this.DOM.chars.forEach((c, i) => {
            gsap.to(c, .6, {
                ease: Back.easeOut,
                delay: i * .05,
                startAt: { y: '-50%', opacity: 0},
                y: '0%',
                opacity: 1
            });
        });
    }
}
