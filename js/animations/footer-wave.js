function initFooterAnimation(footerContainer) {
    const footerSvg = footerContainer.querySelector('svg');
    const path = footerSvg ? footerSvg.querySelector('path') : null;
    
    if (footerSvg && path) {
        footerSvg.style.width = '100%';
        footerSvg.style.position = 'absolute';
        footerSvg.style.left = '0';
        footerSvg.style.transform = 'translateY(-99%)';
        
        let targetX = 720; 
        let targetY = 170; 
        let currentX = 720;
        let currentY = 170;
        const viewBoxWidth = 1440;

        function animateWave() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            const c1x = currentX * 0.4;
            const c2x = currentX - 200;
            const c3x = currentX + 200;
            const c4x = currentX + (viewBoxWidth - currentX) * 0.6;
            const newPath = `M0,220 C${c1x},220 ${c2x},${currentY} ${currentX},${currentY} C${c3x},${currentY} ${c4x},220 ${viewBoxWidth},220 L${viewBoxWidth},320 L0,320 Z`;
            
            path.setAttribute('d', newPath);
            requestAnimationFrame(animateWave);
        }
        animateWave();

        footerContainer.addEventListener('mousemove', (e) => {
            const rect = footerContainer.getBoundingClientRect();
            const ratioX = (e.clientX - rect.left) / rect.width;
            const distY = e.clientY - rect.top; 
            targetX = ratioX * viewBoxWidth;
            targetY = distY < 150 ? 50 + (distY * 0.4) : 120;
        });
        footerContainer.addEventListener('mouseleave', () => { targetX = 720; targetY = 170; });
    }
}
