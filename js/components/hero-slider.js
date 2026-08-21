function initializeHeroSlider(options = {}) {
    const {
        slidesSelector = '.hero-slide',
        videosSelector = '.hero-video-wrapper .hero-video',
        nextBtnId = 'btn-next-hero',
        prevBtnId = 'btn-prev-hero',
        itemsToAnimateSelector = '.floating-item',
        exitAnimationClass = 'screws-exit',
        enterAnimationClass = 'screws-enter',
        hasAutoPlay = false,
        autoPlayInterval = 20000,
        onSlideChange = null
    } = options;

    const slides = document.querySelectorAll(slidesSelector);
    const videos = document.querySelectorAll(videosSelector);
    const btnNext = document.getElementById(nextBtnId);
    const btnPrev = document.getElementById(prevBtnId);
    const itemsToAnimate = document.querySelectorAll(itemsToAnimateSelector);

    if (!slides.length || !videos.length || !btnNext || !btnPrev) {
        console.warn('SPAX Slider Component: Faltan elementos para el slider.');
        return;
    }

    let currentSlide = 0;
    let slideInterval;
    let isAnimating = false;

    function goToSlide(index) {
        if (isAnimating) return;
        isAnimating = true;

        if (itemsToAnimate.length) {
            itemsToAnimate.forEach(item => item.classList.add(exitAnimationClass));
        }
        slides[currentSlide].classList.remove('active');
        videos[currentSlide].classList.remove('active');

        currentSlide = (index + slides.length) % slides.length;

        setTimeout(() => {
            if (itemsToAnimate.length) {
                itemsToAnimate.forEach(item => {
                    item.classList.remove(exitAnimationClass);
                    item.classList.add(enterAnimationClass);
                });
            }
            
            slides[currentSlide].classList.add('active');
            videos[currentSlide].classList.add('active');
            
            if (videos[currentSlide].tagName === 'VIDEO') {
                videos[currentSlide].currentTime = 0;
                videos[currentSlide].play().catch(e => console.error("La reproducción automática del video del slider fue prevenida.", e));
            }

            if (typeof onSlideChange === 'function') {
                onSlideChange(currentSlide);
            }

            setTimeout(() => {
                if (itemsToAnimate.length) {
                    itemsToAnimate.forEach(item => item.classList.remove(enterAnimationClass));
                }
                isAnimating = false;
            }, 600);

        }, 400);
    }

    function next() { goToSlide(currentSlide + 1); }
    function prev() { goToSlide(currentSlide - 1); }

    function start() { if (hasAutoPlay) slideInterval = setInterval(next, autoPlayInterval); }
    function stop() { if (hasAutoPlay) clearInterval(slideInterval); }

    btnNext.addEventListener('click', () => { stop(); next(); start(); });
    btnPrev.addEventListener('click', () => { stop(); prev(); start(); });
    
    start();
}
