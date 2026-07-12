class HeroSlider {
    constructor(el) {
        this.el = document.querySelector(el);
        this.swiper = this.el ? this._initSwiper() : null;
    }

    _initSwiper() {
        return new Swiper(this.el, {
            // Optional parameters
            // direction: 'vertical',
            loop: true,
            grabCursor: true,
            effect: 'coverflow',
            centeredSlides: true,
            slidesPerView: 1,
            speed: 1000,
            breakpoints: {
                1024: {
                    slidesPerView: 2,
                }
            },
        });
    }

    start(options = {}) {
        if (!this.swiper) return;
        options = Object.assign({
            delay: 4000,
            disableOnInteraction: false
        }, options);
        
        this.swiper.params.autoplay = options;
        this.swiper.autoplay.start();
    }
    stop() {
        if (!this.swiper) return;
        this.swiper.autoplay.stop();
    }
}
