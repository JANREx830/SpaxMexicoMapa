document.addEventListener("DOMContentLoaded", function() {
    initDrillingAnimation();
});

function initDrillingAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const screw = entry.target.querySelector('.drilling-screw');
                const line = entry.target.querySelector('.drill-line');
                if(screw) screw.classList.add('start-drill');
                if(line) line.classList.add('start-drill');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const drillZone = document.getElementById('drill-trigger-zone');
    if(drillZone) {
        observer.observe(drillZone);
    }
}
