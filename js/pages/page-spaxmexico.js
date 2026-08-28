document.addEventListener("DOMContentLoaded", function() {
    console.log("DONDE-COMPRAR: Inicializando Mapa con Base de Datos...");
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

    const { statesList, stores } = getSpaxDistributorData();

    const normalizeStr = (str) => {
        return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    };

    function findMatchingSpaxState(geoJsonStateName) {
        const normalizedGeoJsonName = normalizeStr(geoJsonStateName);
        const mapping = {
            'distrito federal': 'CIUDAD DE MEXICO',
            'mexico city': 'CIUDAD DE MEXICO',
            'méxico': 'MÉXICO',
            'estado de mexico': 'MÉXICO',
            'coahuila de zaragoza': 'COAHUILA',
            'michoacan de ocampo': 'MICHOACAN',
            'veracruz de ignacio de la llave': 'VERACRUZ',
            'nuevo león': 'NUEVO LEON'
        };
        const mappedState = mapping[normalizedGeoJsonName];
        if (mappedState && statesList.some(s => normalizeStr(s) === normalizeStr(mappedState))) return mappedState;
        const directMatch = statesList.find(s => normalizeStr(s) === normalizedGeoJsonName);
        return directMatch || null;
    }

    let defaultCenter = [23.6345, -102.5528];
    const mexicoBounds = L.latLngBounds(
        L.latLng(14.5, -118.5), 
        L.latLng(32.8, -86.7)  
    );

    var map = L.map('map', { 
        scrollWheelZoom: false, 
        touchZoom: false,      
        doubleClickZoom: false, 
        maxBounds: mexicoBounds,  
        minZoom: 5,             
        maxBoundsViscosity: 1.0 
    }).setView(defaultCenter, 5);

    new ResizeObserver(() => {
        if (map) map.invalidateSize();
    }).observe(document.getElementById('map'));

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

    const spaxIcon = L.divIcon({
        html: `<i class="fas fa-map-marker-alt" style="color: #0d6e3a; font-size: 30px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);"></i>`,
        className: 'spax-marker-icon', 
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
    var markerGroup = new L.featureGroup().addTo(map);
    let geoJsonLayer;
    let selectedStateForStyling = ""; 

    function updateSelectedState(newState) {
        selectedStateForStyling = newState;
    }

    fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/mexico.geojson')
        .then(response => response.json())
        .then(data => {
            geoJsonLayer = L.geoJSON(data, {
                style: getGeoJsonStyle,
                onEachFeature: onEachFeature
            }).addTo(map);
      
            setupSpaxMapSearch(stores, normalizeStr, renderStores, geoJsonLayer, getGeoJsonStyle, updateSelectedState, map);
        })
        .catch(err => console.log("Error cargando el GeoJSON de México:", err));

    function onEachFeature(feature, layer) {
        const spaxStateName = findMatchingSpaxState(feature.properties.name);

        layer.bindTooltip(feature.properties.name, {
            permanent: false,
            direction: 'center',
            className: 'spax-state-tooltip',
            sticky: true 
        });

        if (spaxStateName) { 
            layer.on({
                click: (e) => {
                    const stateSelect = document.getElementById('search-state');
                    const inputName = document.getElementById('search-name');
                    const btnSearch = document.getElementById('btn-search-distributors');

                    if (stateSelect && inputName && btnSearch) {
                        inputName.value = '';
                        stateSelect.value = spaxStateName;
                        btnSearch.click();
                    }
                }
            });
        }
    }

    function getGeoJsonStyle(feature) {
        const spaxStateNameForFeature = findMatchingSpaxState(feature.properties.name);
        const normalizedSelectedState = normalizeStr(selectedStateForStyling);

        let isSelected = false;
        if (normalizedSelectedState && spaxStateNameForFeature) {
            isSelected = (normalizeStr(spaxStateNameForFeature) === normalizedSelectedState);
        }

        if (normalizedSelectedState) {
            if (isSelected) {
                return { color: '#0d6e3a', weight: 3, fillColor: '#0d6e3a', fillOpacity: 0.6, className: 'leaflet-interactive-spax' };
            } else {
                const isInteractive = spaxStateNameForFeature ? 'leaflet-interactive-spax' : '';
                return { color: '#cccccc', weight: 1, fillColor: '#f0f0f0', fillOpacity: 0.5, className: isInteractive, interactive: !!spaxStateNameForFeature };
            }
        }

        if (spaxStateNameForFeature) {
            return { color: '#0d6e3a', weight: 2, fillColor: '#0d6e3a', fillOpacity: 0.25, className: 'leaflet-interactive-spax' };
        } else {
            return { color: '#0d6e3a', weight: 1.5, fillColor: '#0d6e3a', fillOpacity: 0.1, interactive: false };
        }
    }

    function renderStores(filteredStores) {
        const errorMsg = document.getElementById('search-error-msg');
        const listContainer = document.getElementById('distributor-list-container');
        markerGroup.clearLayers();
        if (listContainer) listContainer.innerHTML = '';

        if (filteredStores.length === 0) {
            if (errorMsg) errorMsg.classList.remove('d-none');
            if (listContainer) {
                listContainer.innerHTML = `<div class="text-muted text-center p-5">No se encontraron distribuidores con estos criterios.</div>`;
            }
            map.setView(defaultCenter, 5); 
            return;
        }

        if (errorMsg) errorMsg.classList.add('d-none');
        
        const markers = [];

        filteredStores.forEach(store => {
            const marker = L.marker([store.latitude, store.longitude], { icon: spaxIcon });
      
            marker.bindPopup(createDistributorPopupHtml(store));
            markerGroup.addLayer(marker);
            markers.push({ storeId: store.id, marker: marker });

            if (listContainer) {
                const listItem = document.createElement('div');
                listItem.className = 'distributor-list-item';
                listItem.setAttribute('data-store-id', store.id);
                listItem.innerHTML = createDistributorListItemHtml(store);
                listContainer.appendChild(listItem);
            }
        });

        if (listContainer) {
            listContainer.querySelectorAll('.distributor-list-item').forEach(item => {
                item.addEventListener('click', () => {
                    const storeId = parseInt(item.getAttribute('data-store-id'));
                    const targetMarkerData = markers.find(m => m.storeId === storeId);
                    const targetStoreData = stores.find(s => s.id === storeId);
                    if (targetMarkerData && targetStoreData) {
                        map.flyTo([targetStoreData.latitude, targetStoreData.longitude], 15);
                        targetMarkerData.marker.openPopup();
                    }
                });
            });
        }

        if (filteredStores.length === 1) {
            const store = filteredStores[0];
            map.flyTo([store.latitude, store.longitude], 13); 
        } else if (filteredStores.length > 1 && filteredStores.length < stores.length) {
         
            map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
        } else { 
            map.setView(defaultCenter, 5);
        }
    }

    renderStores(stores);

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(".prod-anim-left > *", 
            { opacity: 0, x: -30 }, 
            { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.2 }
        );
        gsap.fromTo(".prod-anim-right", 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.4 }
        );
        gsap.fromTo(".map-anim-left > *",
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: ".blueprint-section", start: "top 70%" } }
        );
        gsap.fromTo(".map-anim-right",
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.8, scrollTrigger: { trigger: ".blueprint-section", start: "top 70%" } }
        );

        gsap.to(".decor-drawn", {
            y: 200, 
            ease: "none",
            scrollTrigger: {
                trigger: ".product-search-section",
                start: "top top", 
                end: "bottom top", 
                scrub: 1 
            }
        });

        gsap.fromTo(".proj-anim-fade",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: ".inspire-section", start: "top 80%" } }
        );
        gsap.fromTo(".proj-anim-card",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, scrollTrigger: { trigger: ".inspire-section", start: "top 75%" } }
        );
    }
});