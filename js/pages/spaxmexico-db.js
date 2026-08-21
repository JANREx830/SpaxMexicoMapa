function getSpaxDistributorData() {
    const stores = [
        {
            id: 1,
            name: "Ferretería La Central",
            address: "Av. de los Insurgentes Sur 123",
            city: "Ciudad de México",
            state: "CIUDAD DE MEXICO",
            phone: "55-1234-5678",
            latitude: 19.4005,
            longitude: -99.1663,
        },
        {
            id: 2,
            name: "Tornillos y Maderas de Jalisco",
            address: "Calle Madero 456",
            city: "Guadalajara",
            state: "JALISCO",
            phone: "33-9876-5432",
            latitude: 20.6736,
            longitude: -103.344,
        },
        {
            id: 3,
            name: "SPAX Center Monterrey",
            address: "Av. Eugenio Garza Sada 789",
            city: "Monterrey",
            state: "NUEVO LEON",
            phone: "81-1234-9876",
            latitude: 25.6500,
            longitude: -100.2910,
        },
        {
            id: 4,
            name: "Maderería del Sureste",
            address: "Calle 60 123",
            city: "Mérida",
            state: "YUCATAN",
            phone: null, // Ejemplo sin teléfono
            latitude: 20.9754,
            longitude: -89.6169,
        },
        {
            id: 5,
            name: "El Clavo de Oro",
            address: "Blvd. Agua Caliente 1122",
            city: "Tijuana",
            state: "BAJA CALIFORNIA",
            phone: "66-4567-1234",
            latitude: 32.5027,
            longitude: -117.0037,
        }
    ];

    // La lista de estados con presencia se genera automáticamente a partir de los distribuidores
    const statesList = [...new Set(stores.map(store => store.state))];

    return { statesList, stores };
}
