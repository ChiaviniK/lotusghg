
import { ROAD_FUEL_TYPES } from "@/lib/constants/upstream-transport-data";

// --- Interfaces ---

export interface CommutingInput {
    description: string;

    // Public Transport
    public_type?: "rail_train" | "rail_subway" | "bus_urban" | "bus_road" | "ferry";
    public_passengers?: number;
    public_distance_km?: number; // one way
    public_trechos_per_day?: number; // usually 2 (round trip)
    public_days_per_year?: number; // default 230

    // Private Vehicle
    private_calc_method?: "fleet" | "fuel" | "distance";

    // Opt 1 (Fleet) & Opt 3 (Distance)
    private_vehicle_type?: string;
    private_vehicle_year?: number;

    // Opt 1 & Opt 2
    private_fuel_id?: string;
    private_consumption_per_day_liters?: number;

    // Opt 3
    private_distance_per_day_km?: number;
    private_avg_consumption_km_l?: number; // optional override?

    // Common Private
    private_days_per_year?: number; // default 230
    private_days_per_month?: number; // alternative

    // Remote Work
    remote_employees?: number;
    remote_days_per_week?: number;
}

export interface CommutingResult {
    emissions_tCO2e: number;
    emissions_tCO2_bio: number;
    energy_MWh?: number;
    details?: any;
}

// --- Constants ---

// Factors from GHG Protocol / IPCC / DEFRA (Approximate for placeholder)
// Unit: kg CO2e / passenger.km
const PUBLIC_TRANSPORT_FACTORS = {
    rail_train: 0.035,
    rail_subway: 0.030,
    bus_urban: 0.096,
    bus_road: 0.028,
    ferry: 0.113
};

// Remote Work Defaults
// Power consumption per person-day (8h): Laptop (0.05 kW) + Monitor (0.03 kW) + Lighting/Other (0.05 kW) ~= 0.13 kW * 8h ~= 1.0 kWh/day
// This is a conservative estimate.
const REMOTE_WORK_KWH_PER_DAY = 1.5;

// Grid Factor (using latest available or average)
// Assuming National Grid Average for Brazil (approx 0.04 - 0.1 kgCO2/kWh depending on year)
// We will reuse centralized GRID_FACTORS if available, otherwise static.
const AVG_GRID_FACTOR_KG_KWH = 0.086; // 2022 Average

// --- Calculation Functions ---

export function calculateCommuting(input: CommutingInput, mode: "public" | "private" | "remote"): CommutingResult {
    let total_tCO2e = 0;
    let total_tCO2_bio = 0;
    let energy_MWh = 0;
    let details = {};

    if (mode === "public") {
        const factor = PUBLIC_TRANSPORT_FACTORS[input.public_type || "bus_urban"] || 0.096;
        const dist_one_way = input.public_distance_km || 0;
        const trips_day = input.public_trechos_per_day || 2; // Default round trip
        const passengers = input.public_passengers || 1;
        const days = input.public_days_per_year || 230;

        const total_pkm = dist_one_way * trips_day * passengers * days;

        // emissions (kg) = pkm * factor
        // convert to tonnes
        total_tCO2e = (total_pkm * factor) / 1000;

        details = { total_pkm, factor, days };
    }
    else if (mode === "private") {
        const method = input.private_calc_method || "distance";
        const days = input.private_days_per_year || (input.private_days_per_month ? input.private_days_per_month * 12 : 230);

        let total_liters = 0;
        let fuel_id = input.private_fuel_id || "gasolina_comercial"; // default

        // Logic for converting inputs to Fuel Volume
        if (method === "fleet") {
            // Opt 1: Consumption/day * days (Simplification as we don't have year specific tables)
            // Ideally we'd look up consumption based on Year, but user inputs consumption directly?
            // "Em Consumo médio de combustível por dia, considerar o trecho de ida e trecho de volta."
            const cons_day = input.private_consumption_per_day_liters || 0;
            total_liters = cons_day * days;
        }
        else if (method === "fuel") {
            // Opt 2: Consumption/day * days
            const cons_day = input.private_consumption_per_day_liters || 0;
            total_liters = cons_day * days;
        }
        else if (method === "distance") {
            // Opt 3: Distance / Efficiency
            const dist_day = input.private_distance_per_day_km || 0;
            const efficiency = input.private_avg_consumption_km_l || 10; // Default 10km/L
            const total_dist = dist_day * days;
            total_liters = total_dist / efficiency;
            // Infer fuel? Usually Gasoline for general cars
            fuel_id = input.private_fuel_id || "gasolina_comercial";
        }

        // Apply Emission Factors for Fuel
        const fuelData = ROAD_FUEL_TYPES.find(f => f.id === fuel_id) || ROAD_FUEL_TYPES.find(f => f.id === "gasolina_comercial");

        if (fuelData && total_liters > 0) {
            // factors are kg/L (or kg/unit as per data)
            const kgCO2 = total_liters * fuelData.ef_co2;
            const kgCH4 = total_liters * fuelData.ef_ch4;
            const kgN2O = total_liters * fuelData.ef_n2o;
            // @ts-ignore
            const kgBio = total_liters * (fuelData.ef_bio || 0);

            const GWP_CH4 = 28;
            const GWP_N2O = 265;

            total_tCO2e = (kgCO2 + (kgCH4 * GWP_CH4) + (kgN2O * GWP_N2O)) / 1000;
            total_tCO2_bio = kgBio / 1000;
        }

        details = { total_liters, days, fuel_data: fuelData };
    }
    else if (mode === "remote") {
        const employees = input.remote_employees || 0;
        const days_week = input.remote_days_per_week || 0;

        // Total days per year = days_week * 52 (roughly)
        // Or if prompt says "sugere 230 dias uteis", maybe we scale days_week/5?
        // Let's use: (days_week / 5) * 230
        const working_days_year = (days_week / 5) * 230;

        const total_working_days = employees * working_days_year;

        const total_kwh = total_working_days * REMOTE_WORK_KWH_PER_DAY;
        energy_MWh = total_kwh / 1000;

        const grid_factor = AVG_GRID_FACTOR_KG_KWH;
        total_tCO2e = (total_kwh * grid_factor) / 1000;

        details = { total_working_days, total_kwh };
    }

    return {
        emissions_tCO2e: total_tCO2e,
        emissions_tCO2_bio: total_tCO2_bio,
        energy_MWh,
        details
    };
}
