function createDistributorPopupHtml(store) {
    const phoneHtml = store.phone 
        ? `<p class="spax-popup-phone"><i class="fas fa-phone-alt" style="margin-right: 8px; font-size: 0.8em;"></i>${store.phone}</p>` 
        : '';

    return `
        <h6 class="spax-popup-title">${store.name}</h6>
        <p class="spax-popup-address">${store.address}, ${store.city}, ${store.state}</p>
        ${phoneHtml}
        <a href="https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}" target="_blank" class="spax-popup-link">Cómo llegar</a>
    `;
}

function createDistributorListItemHtml(store) {
    return `
        <h6>${store.name}</h6>
        <p>${store.address}, ${store.city}</p>
    `;
}
