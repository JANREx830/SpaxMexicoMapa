
document.addEventListener("DOMContentLoaded", function() {
    console.log("CORE: Cargando componentes y UI global...");

    loadCommonComponents();
    initUiHelpers();
    initGlobalAnimations();
    initLazyVideos();
    initTranslator();
    initCookies();
});

function loadCommonComponents() {
    fetch('./components/preloader.html')
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('preloader-container');
            if (container) {
                container.outerHTML = data;
                initPreloaderLogic();
            }
        })
        .catch(error => console.error('Error cargando el preloader:', error));

    fetch('./components/navbar/navbar.html')
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('navbar-container');
            if (container) {
                container.innerHTML = data;
                initNavbarScroll(); 
                
                if (typeof updateTranslatorButtonState === 'function') updateTranslatorButtonState();
                
                const themeIcon = document.querySelector('#theme-toggle i');
                if (themeIcon && document.documentElement.getAttribute('data-bs-theme') === 'dark') {
                    themeIcon.className = 'fas fa-sun';
                }
            }
        })
        .catch(error => console.error('Error cargando el navbar:', error));

    const heroInternos = document.querySelectorAll('.hero-interno-container');
    if (heroInternos.length > 0) {
        fetch('./components/hero/hero-interno.html')
            .then(response => response.text())
            .then(data => {
                heroInternos.forEach(container => {
                    const title = container.getAttribute('data-title') || '';
                    const subtitle = container.getAttribute('data-subtitle') || '';
                    const bgType = container.getAttribute('data-bg') || 'gradient';
                    const bgImg = container.getAttribute('data-img') || '';
                    
                    let componentHtml = data.replace('{{TITLE}}', title).replace('{{SUBTITLE}}', subtitle);
                    
                    if (bgType === 'video') {
                        componentHtml = componentHtml.replace('{{BG_CLASS}}', '')
                            .replace('{{MEDIA}}', '<video class="hero-video active" autoplay loop muted playsinline style="object-fit: cover;"><source src="./assets/videos/FINALCUT_SPAX-ES.mp4" type="video/mp4"></video><div class="hero-overlay"></div>');
                    } else if (bgType === 'image' && bgImg !== '') {
                        componentHtml = componentHtml.replace('{{BG_CLASS}}', '')
                            .replace('{{MEDIA}}', `<img class="hero-video active" src="${bgImg}" style="object-fit: cover; z-index: 1;"><div class="hero-overlay"></div>`);
                    } else {
                    componentHtml = componentHtml.replace('{{BG_CLASS}}', 'hero-gradient')
                        .replace('{{MEDIA}}', '<div class="floating-items-overlay" style="z-index: 2;"><img src="./assets/comunes/0441010350403Tornillo.webp" alt="Tornillo 1" class="floating-item screw-top-left"><img src="./assets/comunes/0441010350403Tornillo.webp" alt="Tornillo 2" class="floating-item screw-bottom-left blur-medium"><img src="./assets/comunes/0441010350403Tornillo.webp" alt="Tornillo 3" class="floating-item drill-top-right"><img src="./assets/comunes/0441010350403Tornillo.webp" alt="Tornillo 4" class="floating-item screw-mid-right blur-hard"></div>');
                    }
                    
                    container.outerHTML = componentHtml;
                });
            })
            .catch(error => console.error('Error cargando el hero interno:', error));
    }

    fetch('./components/footer/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) {
                footerContainer.innerHTML = data;
                initFooterAnimation(footerContainer);
            }
        })
        .catch(error => console.error('Error cargando el footer:', error));

    // Cargar el HTML del widget de WhatsApp y luego su script
    fetch('./components/footer/whatsappicon.html')
        .then(response => response.text())
        .then(data => {
            const waContainer = document.createElement('div');
            waContainer.id = 'whatsapp-container';
            waContainer.innerHTML = data;
            document.body.appendChild(waContainer);
            
            const waScript = document.createElement('script');
            waScript.src = './js/components/whatsapp-widget.js';
            waScript.onload = () => {
                initWhatsAppWidget();
            };
            document.body.appendChild(waScript);
        })
        .catch(error => console.error('Error cargando el widget de WhatsApp:', error));
}

function initUiHelpers() {
    // El script en <head> hace el trabajo inicial, esto es un refuerzo y maneja el clic.
    const savedTheme = localStorage.getItem('spax-theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    document.body.addEventListener('click', (e) => {
        const themeToggle = e.target.closest('#theme-toggle');
        if (!themeToggle) return; 
        
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('spax-theme', newTheme);

        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    document.body.addEventListener('click', function(e) {
       const btn = e.target.closest('.btn-download');
        if (!btn || btn.id === 'pdfDownloadBtn') return; 
        if (!btn) return;

        if (btn.tagName === 'A') {
            e.preventDefault();
        }
        
        if (btn.classList.contains('disabled')) return;

        const originalHTML = btn.innerHTML;
        
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Descargando...';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('disabled');
            btn.style.pointerEvents = 'auto';

            if (btn.tagName === 'A' && btn.hasAttribute('download')) {
                window.location.href = btn.href;
            }

        }, 2000);
    });
}

function updateTranslatorButtonState() {
    const langToggleBtn = document.getElementById('lang-toggle');
    if (!langToggleBtn) return;
    const currentGoogtransCookie = getCookie('googtrans');
    if (currentGoogtransCookie && currentGoogtransCookie.includes('/es/en')) {
        langToggleBtn.setAttribute('data-lang', 'en'); // Indica que el idioma actual es inglés
        langToggleBtn.innerHTML = 'ES'; // El botón dirá "ES" para cambiar a español
        langToggleBtn.title = 'Switch to Spanish';
    } else {
        langToggleBtn.setAttribute('data-lang', 'es');
        langToggleBtn.innerHTML = 'EN';
        langToggleBtn.title = 'Cambiar a Inglés';
    }
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function initTranslator() {
    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.display = 'none';
    document.body.appendChild(gtDiv);

    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'es',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };
    const gtScript = document.createElement('script');
    gtScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(gtScript);

    document.body.addEventListener('click', (e) => {
        const langToggle = e.target.closest('#lang-toggle');
        if (!langToggle) return;

        const isCurrentlySpanish = langToggle.getAttribute('data-lang') === 'es';

        if (isCurrentlySpanish) {
            document.documentElement.lang = 'en';
            document.cookie = 'googtrans=/es/en; path=/;';
            window.location.reload();
        } else {
            document.documentElement.lang = 'es';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + window.location.hostname.split('.').slice(-2).join('.');
            window.location.href = window.location.pathname + window.location.search;
        }
    });
}

function initGlobalAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        const getRatio = (el) => window.innerHeight / (window.innerHeight + el.offsetHeight);
        
        gsap.utils.toArray(".parallax-container").forEach((section, i) => {
            const videoWrapper = section.querySelector(".parallax-video-wrapper");
            
            if(videoWrapper) {
                gsap.fromTo(videoWrapper, 
                    { y: () => i ? -window.innerHeight * getRatio(section) : 0 }, 
                    {
                        y: () => window.innerHeight * (1 - getRatio(section)),
                        ease: "none",
                        scrollTrigger: {
                            trigger: section,
                            start: () => i ? "top bottom" : "top top",
                            end: "bottom top",
                            scrub: true,
                            invalidateOnRefresh: true
                        }
                    }
                );
            }
        });
    }

    const videoModal = document.getElementById('videoModal');
    const videoIframe = document.getElementById('videoIframe');

    if(videoModal && videoIframe) {
        videoModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const videoSrc = button.getAttribute('data-video');
            if(videoSrc) {
                videoIframe.src = videoSrc;
            }
        });

        videoModal.addEventListener('hide.bs.modal', function () {
            videoIframe.src = ""; 
        });
    }
}

function initPreloaderLogic() {
    const preloader = document.getElementById('spax-preloader');
    if (!preloader) return;

    const removePreloader = () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 600);
        }, 250);
    };

    if (document.readyState === 'complete') {
        removePreloader();
    } else {
        window.addEventListener('load', removePreloader);
    }
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar-spax');
    if (!navbar) return;

    const toggleScrolled = () => {
        let scrollPos = window.scrollY;
        const scroller = document.querySelector('.parallax-scroller');
        if (scroller) {
            scrollPos = scroller.scrollTop;
        }
        
        if (scrollPos > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    toggleScrolled();

    window.addEventListener('scroll', toggleScrolled);
    const scroller = document.querySelector('.parallax-scroller');
    if (scroller) {
        scroller.addEventListener('scroll', toggleScrolled);
    }
}

function initLazyVideos() {
    const lazyVideos = document.querySelectorAll('video.lazy-video');
    
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    
                    const sources = video.querySelectorAll('source');
                    sources.forEach(source => {
                        if (source.dataset.src) {
                            source.src = source.dataset.src;
                        }
                    });
                    
                    video.load();
                    video.classList.remove('lazy-video');
                    
                    observer.unobserve(video);
                }
            });
        }, { rootMargin: '0px 0px 600px 0px' }); 

        lazyVideos.forEach(video => {
            videoObserver.observe(video);
        });
    }
}
function initCookies() {
    const cookieBanner = document.getElementById('cookie-banner');
    if (!cookieBanner) return;
    const COOKIE_VERSION = '2';

    const savedConsent = localStorage.getItem('spax_mx_cookies');
    const savedVersion = localStorage.getItem('spax_mx_cookies_version');
    const consentIsValid =
        savedConsent &&
        savedVersion === COOKIE_VERSION;
    if (!consentIsValid) {
        localStorage.removeItem('spax_mx_cookies');
        localStorage.removeItem('spax_mx_cookies_version');

        setTimeout(() => {

            cookieBanner.style.display = 'block';

            if (typeof gsap !== 'undefined') {

                gsap.fromTo(
                    cookieBanner,
                    {
                        y: 100,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.5
                    }
                );

            } else {

                cookieBanner.style.display = 'block';

            }

        }, 1000);

    } else {

        if (savedConsent === 'todas') {
            inyectarGTM();
        }

    }
    const btnAceptar = document.getElementById('btn-aceptar-todas');

    if (btnAceptar) {

        btnAceptar.addEventListener('click', () => {

            localStorage.setItem(
                'spax_mx_cookies',
                'todas'
            );

            localStorage.setItem(
                'spax_mx_cookies_version',
                COOKIE_VERSION
            );

            cerrarCookieBanner();

            inyectarGTM();

        });

    }
    const btnNecesarias =
        document.getElementById('btn-solo-necesarias');

    if (btnNecesarias) {

        btnNecesarias.addEventListener('click', () => {

            localStorage.setItem(
                'spax_mx_cookies',
                'necesarias'
            );

            localStorage.setItem(
                'spax_mx_cookies_version',
                COOKIE_VERSION
            );

            cerrarCookieBanner();

        });

    }
}
function cerrarCookieBanner() {

    const cookieBanner =
        document.getElementById('cookie-banner');

    if (!cookieBanner) return;

    if (typeof gsap !== 'undefined') {

        gsap.to(cookieBanner, {

            y: 100,
            opacity: 0,
            duration: 0.5,

            onComplete: () => {
                cookieBanner.style.display = 'none';
            }

        });

    } else {

        cookieBanner.style.display = 'none';

    }
}