function initWhatsAppWidget() {
    const waFab = document.getElementById('wa-fab');
    const waWidget = document.getElementById('wa-widget');
    const waClose = document.getElementById('wa-close');
    const waMinimize = document.getElementById('wa-minimize');
    const waHeader = document.getElementById('wa-header');

    if (!waFab || !waWidget || !waClose || !waMinimize || !waHeader) {
        return; // No ejecutar si los elementos no existen
    }

    let isChatOpened = false;

    waFab.addEventListener('click', () => {
        waWidget.classList.remove('hide');
        waWidget.classList.remove('minimized');
        
        // Solo animar si GSAP está disponible y es la primera vez que se abre
        if (typeof gsap !== 'undefined' && !isChatOpened) {
            isChatOpened = true;
            gsap.fromTo(".chat-bubble-1", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, delay: 0.3 });
            gsap.fromTo(".chat-bubble-2", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, delay: 0.9 });
            gsap.fromTo(".chat-bubble-3", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, delay: 1.7 });
        }
    });

    waClose.addEventListener('click', () => waWidget.classList.add('hide'));
    waMinimize.addEventListener('click', () => waWidget.classList.toggle('minimized'));

    let isDragging = false;
    let initialX, initialY;

    waHeader.addEventListener("mousedown", (e) => {
        if(e.target.closest('.wa-controls')) return;
        
        const rect = waWidget.getBoundingClientRect();
        waWidget.style.right = 'auto';
        waWidget.style.bottom = 'auto';
        waWidget.style.left = rect.left + 'px';
        waWidget.style.top = rect.top + 'px';

        initialX = e.clientX;
        initialY = e.clientY;
        isDragging = true;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - initialX;
        const dy = e.clientY - initialY;
        initialX = e.clientX;
        initialY = e.clientY;
        const rect = waWidget.getBoundingClientRect();
        waWidget.style.left = (rect.left + dx) + 'px';
        waWidget.style.top = (rect.top + dy) + 'px';
    });
    
    document.addEventListener("mouseup", () => isDragging = false);
}
