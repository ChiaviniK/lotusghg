
import { ThermalFactor, THERMAL_FACTORS } from "../constants/thermal-fluids";

export interface ThermalInput {
    fuel_id: string;
    description: string;
    steam_purchased_gj: number;
    boiler_efficiency: number; // 0-1 (e.g., 0.8)
    custom_factors?: {
        co2_kg_gj?: number;
        ch4_kg_gj?: number;
        n2o_kg_gj?: number;
    };
}

export interface ThermalResult {
    fuel_consumption_gj: number;
    emissions: {
        co2_t: number;
        ch4_t: number;
        n2o_t: number;
        total_co2e_t: number;
        biogenic_co2_t: number;
    };
    factor_used: ThermalFactor;
}

export function calculateThermalEmissions(input: ThermalInput): ThermalResult {
    const factor = THERMAL_FACTORS.find(f => f.id === input.fuel_id);
    if (!factor) {
        throw new Error(`Fuel ID ${input.fuel_id} not found`);
    }

    // 1. Calculate Fuel Consumption
    // Fuel (GJ) = Steam (GJ) / Efficiency
    const efficiency = input.boiler_efficiency > 0 ? input.boiler_efficiency : 0.8;
    const fuel_consumption_gj = input.steam_purchased_gj / efficiency;

    // 2. Use Custom or Default Factors
    const co2_factor = input.custom_factors?.co2_kg_gj ?? factor.co2_kg_gj;
    const ch4_factor = input.custom_factors?.ch4_kg_gj ?? factor.ch4_kg_gj;
    const n2o_factor = input.custom_factors?.n2o_kg_gj ?? factor.n2o_kg_gj;

    // 3. Calculate Emissions (kg -> tonnes)
    const co2_kg = fuel_consumption_gj * co2_factor;
    const ch4_kg = fuel_consumption_gj * ch4_factor;
    const n2o_kg = fuel_consumption_gj * n2o_factor;

    const co2_t = co2_kg / 1000;
    const ch4_t = ch4_kg / 1000;
    const n2o_t = n2o_kg / 1000;

    // 4. Calculate CO2e
    // GWP: CH4=28, N2O=265 (Using standard AR5/User default from other modules)
    const total_co2e_t = (factor.type === 'biogenic' ? 0 : co2_t) + (ch4_t * 28) + (n2o_t * 265);
    const biogenic_co2_t = factor.type === 'biogenic' ? co2_t : 0;

    return {
        fuel_consumption_gj,
        emissions: {
            co2_t: factor.type === 'biogenic' ? 0 : co2_t, // Fossil CO2 only in main total
            ch4_t,
            n2o_t,
            total_co2e_t,
            biogenic_co2_t
        },
        factor_used: {
            ...factor,
            co2_kg_gj: co2_factor,
            ch4_kg_gj: ch4_factor,
            n2o_kg_gj: n2o_factor
        }
    };
}
