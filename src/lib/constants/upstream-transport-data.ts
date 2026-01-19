
export const UPSTREAM_MODES = [
    { id: "road", label: "Transporte Rodoviário" },
    { id: "rail", label: "Transporte Ferroviário" },
    { id: "water", label: "Transporte Hidroviário" },
    { id: "air", label: "Transporte Aéreo" },
];

export const ROAD_VEHICLE_TYPES = [
    { id: "light", label: "Veículo Leve (Passageiros/Comercial)" },
    { id: "heavy", label: "Veículo Pesado (Caminhões/Ônibus)" },
    { id: "motorcycle", label: "Motocicleta" },
];

export const ROAD_FUEL_TYPES = [
    { id: "diesel_commercial", label: "Óleo Diesel (Comercial)", unit: "litros", type: "liquid", ef_co2: 2.603, ef_ch4: 0.0001, ef_n2o: 0.00015 }, // Example factors kg/unit
    { id: "gasoline_commercial", label: "Gasolina (Comercial)", unit: "litros", type: "liquid", ef_co2: 2.212, ef_ch4: 0.0005, ef_n2o: 0.0002 },
    { id: "ethanol_hydrated", label: "Etanol Hidratado", unit: "litros", type: "liquid", ef_co2: 0, ef_bio: 1.5, ef_ch4: 0.0002, ef_n2o: 0.0001 }, // Biogenic CO2
    { id: "gnv", label: "GNV", unit: "m³", type: "gas", ef_co2: 1.996, ef_ch4: 0.004, ef_n2o: 0.0001 },
    { id: "biodiesel_b100", label: "Biodiesel (B100)", unit: "litros", type: "liquid", ef_co2: 0, ef_bio: 2.5, ef_ch4: 0.0001, ef_n2o: 0.0001 },
];

export const ROAD_CALC_METHODS = [
    { id: "fleet_year", label: "Opção 1: Tipo e Ano da Frota" },
    { id: "fuel", label: "Opção 2: Consumo de Combustível" },
    { id: "dist_weight", label: "Opção 3: Distância e Peso (Carga)" },
    { id: "dist_age", label: "Opção 4: Distância e Idade da Frota" },
];

export const ROAD_FLEET_YEARS = Array.from({ length: 25 }, (_, i) => ({
    id: String(2024 - i),
    label: String(2024 - i)
}));

// Rail Transport Constants
export const RAIL_CONCESSIONAIRES = [
    { id: "rumo_malha_norte", label: "Rumo Malha Norte" },
    { id: "rumo_malha_sul", label: "Rumo Malha Sul" },
    { id: "vli_fca", label: "VLI - Ferrovia Centro-Atlântica" },
    { id: "mrs", label: "MRS Logística" },
    { id: "vale_efvm", label: "Vale - EFVM" },
    { id: "vale_efc", label: "Vale - EFC" },
    { id: "media_nacional", label: "Média Nacional" },
];

export const RAIL_FUEL_TYPES = [
    { id: "diesel_rail", label: "Óleo Diesel (Ferroviário)", unit: "litros", ef_co2: 2.603 }, // Example
];

// Water Transport Constants
export const WATER_SHIP_TYPES = [
    { id: "bulk_carrier", label: "Graneleiro" },
    { id: "container_ship", label: "Porta-Contêiner" },
    { id: "tanker", label: "Navio Tanque" },
    { id: "general_cargo", label: "Carga Geral" },
    { id: "barge", label: "Barcaça" },
];

export const WATER_FUEL_TYPES = [
    { id: "bunker_fuel", label: "Óleo Combustível (Bunker)", unit: "kg", ef_co2: 3.114 },
    { id: "marine_diesel", label: "Diesel Marítimo", unit: "litros", ef_co2: 2.67 },
];

// Air Transport Constants
export const AIR_DISTANCES_DB: Record<string, { lat: number, lon: number }> = {
    "GRU": { lat: -23.4356, lon: -46.4731 },
    "GIG": { lat: -22.8089, lon: -43.2436 },
    "BSB": { lat: -15.8697, lon: -47.9172 },
    "CNF": { lat: -19.6244, lon: -43.9719 },
    "VCP": { lat: -23.0069, lon: -47.1345 },
    "REC": { lat: -8.1264, lon: -34.9230 },
    "POA": { lat: -29.9939, lon: -51.1711 },
    "SSA": { lat: -12.9086, lon: -38.3225 },
    "FOR": { lat: -3.7763, lon: -38.5323 },
    "CWB": { lat: -25.5327, lon: -49.1747 },
    "JFK": { lat: 40.6413, lon: -73.7781 },
    "LHR": { lat: 51.4700, lon: -0.4543 },
    "CDG": { lat: 49.0097, lon: 2.5479 },
    "DXB": { lat: 25.2532, lon: 55.3657 },
    "PEK": { lat: 40.0799, lon: 116.6031 },
    "HND": { lat: 35.5494, lon: 139.7798 },
    "SYD": { lat: -33.9399, lon: 151.1753 },
    // Add more as needed
};

// Default calculation factors (Placeholders based on average values if DB not available)
// Units: kgCO2e / unit
export const EMISSION_FACTORS = {
    road: {
        freight_tkm: 0.150, // kgCO2e / t.km (Example average for heavy truck)
        passenger_km: 0.120, // kgCO2e / km (Example average car)
    },
    rail: {
        freight_tkm: 0.025, // kgCO2e / t.km
    },
    water: {
        freight_tkm: 0.015, // kgCO2e / t.km
    },
    air: {
        freight_tkm: 0.800, // kgCO2e / t.km (Long haul average)
    }
};

export const AIR_FUEL_TYPES = [
    { id: "aviation_kerosene", label: "Querosene de Aviação", unit: "litros", ef_co2: 2.54 }, // Example
    { id: "aviation_gasoline", label: "Gasolina de Aviação", unit: "litros", ef_co2: 2.20 },
];
