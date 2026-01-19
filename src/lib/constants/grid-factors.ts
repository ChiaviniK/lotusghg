
// Factors for the Brazilian National Interconnected System (SIN)
// Unit: tCO2 / MWh
// Source: MCTI (Ministry of Science, Technology and Innovation) - Monthly Average Factors

export const SIN_CHARGES_2023 = {
    jan: 0.0456,
    feb: 0.0421,
    mar: 0.0380,
    apr: 0.0400,
    may: 0.0450,
    jun: 0.0510,
    jul: 0.0550,
    aug: 0.0520,
    sep: 0.0480,
    oct: 0.0440,
    nov: 0.0400,
    dec: 0.0390,
    average: 0.0450
};

// Placeholder for 2024 (often released later, using 2023 as proxy or placeholder)
export const SIN_CHARGES_2024 = {
    jan: 0.0456,
    feb: 0.0421,
    mar: 0.0380,
    apr: 0.0400,
    may: 0.0450,
    jun: 0.0510,
    jul: 0.0550,
    aug: 0.0520,
    sep: 0.0480,
    oct: 0.0440,
    nov: 0.0400,
    dec: 0.0390,
    average: 0.0450
};

// EV Efficiency Defaults (kWh / km)
// Source: Average typical values for vehicle classes
export const EV_EFFICIENCY = {
    passenger_car_small: 0.15, // e.g. Renault Kwid E-Tech
    passenger_car_medium: 0.18, // e.g. BYD Dolphin
    passenger_car_large: 0.22, // e.g. Tesla Model Y
    light_commercial: 0.25, // e.g. Electric Van
    heavy_truck: 1.2, // e.g. e-Delivery
    bus: 1.3 // e.g. Electric Bus
};

export const EV_TYPES = [
    { id: 'passenger_car_small', label: 'Carro de Passeio (Pequeno)' },
    { id: 'passenger_car_medium', label: 'Carro de Passeio (Médio)' },
    { id: 'passenger_car_large', label: 'Carro de Passeio (Grande/SUV)' },
    { id: 'light_commercial', label: 'Veículo Comercial Leve (Van)' },
    { id: 'heavy_truck', label: 'Caminhão Elétrico' },
    { id: 'bus', label: 'Ônibus Elétrico' },
];

// T&D (Transmission & Distribution) Loss Factor
// Source: Average Technical Losses for Brazilian Distribution System (Aneel/EPE)
// Approx 7-15% depending on region and voltage. Using conservative average.
export const TD_LOSS_FACTOR_2024 = 0.15; // 15% loss

// Grid CH4 and N2O Factors (t/MWh) - Placeholders
// Clean energy grids have low values, mostly from reservoir emissions or thermal backup.
export const SIN_CH4_FACTOR = 0.0000; // tCH4/MWh (placeholder)
export const SIN_N2O_FACTOR = 0.0000; // tN2O/MWh (placeholder)
