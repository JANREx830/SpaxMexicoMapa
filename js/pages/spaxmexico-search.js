function setupSpaxMapSearch(stores, normalizeStr, renderStores, geoJsonLayer, getGeoJsonStyle, updateSelectedState, map) {
    const stateSelect = document.getElementById('search-state');
    const searchForm = document.getElementById('search-distributors-form');
    const inputName = document.getElementById('search-name');
    const btnSearch = document.getElementById('btn-search-distributors');
    const btnShowAllPoints = document.getElementById('btn-show-all-points');

    if (stateSelect) {
        const uniqueStates = [...new Set(stores.map(s => s.state))].sort();
        uniqueStates.forEach(state => {
            stateSelect.insertAdjacentHTML('beforeend', `<option value="${state}">${state}</option>`);
        });
    }

    const executeSearch = (e) => {
        if (e) e.preventDefault();

        const queryName = inputName ? normalizeStr(inputName.value.trim()) : "";
        const queryState = stateSelect ? stateSelect.value : "";

        const filtered = stores.filter(s => {
            const matchName = queryName === "" || 
                              normalizeStr(s.name).includes(queryName) ||
                              normalizeStr(s.city).includes(queryName);
            const matchState = queryState === "" || s.state === queryState;
            return matchName && matchState;
        });

        let stateToHighlight = "";
        if (queryState) {
            stateToHighlight = queryState;
        } else if (filtered.length === 1) {
            stateToHighlight = filtered[0].state;
        }

        updateSelectedState(stateToHighlight);
        if (geoJsonLayer) {
            geoJsonLayer.setStyle(getGeoJsonStyle);
        }

        renderStores(filtered);

        const mapSection = document.querySelector('.blueprint-section');
        if (mapSection && filtered.length > 0) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (searchForm) searchForm.addEventListener('submit', executeSearch);
    if (btnSearch) btnSearch.addEventListener('click', executeSearch);

    if (btnShowAllPoints) {
        btnShowAllPoints.addEventListener('click', () => {
            if (inputName) inputName.value = '';
            if (stateSelect) stateSelect.value = '';
            updateSelectedState("");
            if (geoJsonLayer) {
                geoJsonLayer.setStyle(getGeoJsonStyle);
            }
            renderStores(stores);
            setTimeout(() => { map.invalidateSize(); }, 300);
        });
    }
}
