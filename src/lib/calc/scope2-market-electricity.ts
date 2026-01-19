
import { THERMAL_FACTORS, ThermalFactor } from "../constants/thermal-fluids";

export interface MarketElectricityInput {
    description: string;
    source_type: 'thermal' | 'renewable' | 'other';
    // If Thermal
    fuel_id?: string;
    boiler_efficiency?: number; // 0-1

    // Explicit factors (if known or renewable/other)
    custom_factors?: {
        co2_t_mwh?: number;
        ch4_t_mwh?: number;
        n2o_t_mwh?: number;
        biogenic_co2_t_mwh?: number;
    };

    // Consumption
    consumption_mwh: number;
}

export interface MarketElectricityResult {
    emissions: {
        co2_t: number;
        ch4_t: number;
        n2o_t: number;
        total_co2e_t: number;
        biogenic_co2_t: number;
    };
    used_factors: {
        co2_t_mwh: number;
        ch4_t_mwh: number;
        n2o_t_mwh: number;
        biogenic_co2_t_mwh: number;
    };
    is_estimated: boolean; // true if derived from fuel factors
}

/**
 * Calculates Market-based Scope 2 emissions.
 * If factors are provided, uses them.
 * If Thermal and no factors provided, derives from Fuel Factors (kg/GJ) + Efficiency.
 */
export function calculateMarketElectricity(input: MarketElectricityInput): MarketElectricityResult {
    let co2_factor = input.custom_factors?.co2_t_mwh ?? 0;
    let ch4_factor = input.custom_factors?.ch4_t_mwh ?? 0;
    let n2o_factor = input.custom_factors?.n2o_t_mwh ?? 0;
    let bio_factor = input.custom_factors?.biogenic_co2_t_mwh ?? 0;
    let is_estimated = false;

    // If factors missing and thermal source with fuel -> Derive
    if (input.source_type === 'thermal' && input.fuel_id && (co2_factor === 0 && ch4_factor === 0 && n2o_factor === 0)) {
        const fuel = THERMAL_FACTORS.find(f => f.id === input.fuel_id);
        if (fuel) {
            is_estimated = true;
            const efficiency = input.boiler_efficiency && input.boiler_efficiency > 0 ? input.boiler_efficiency : 0.8;

            // Formula: Factor (t/MWh) = Factor (kg/GJ) * 3.6 (GJ/MWh) / (Efficiency * 1000 kg/t)
            // 3.6 / 1000 = 0.0036
            // Factor (t/MWh) = Factor (kg/GJ) * 0.0036 / Efficiency

            const conversion = 0.0036 / efficiency;

            if (fuel.type === 'fossil') {
                co2_factor = fuel.co2_kg_gj * conversion;
            } else {
                bio_factor = fuel.co2_kg_gj * conversion;
            }
            ch4_factor = fuel.ch4_kg_gj * conversion;
            n2o_factor = fuel.n2o_kg_gj * conversion;
        }
    }

    const co2_t = input.consumption_mwh * co2_factor;
    const ch4_t = input.consumption_mwh * ch4_factor;
    const n2o_t = input.consumption_mwh * n2o_factor;
    const biogenic_t = input.consumption_mwh * bio_factor;

    const total_co2e_t = co2_t + (ch4_t * 28) + (n2o_t * 265);

    return {
        emissions: {
            co2_t,
            ch4_t,
            n2o_t,
            total_co2e_t,
            biogenic_co2_t: biogenic_t
        },
        used_factors: {
            co2_t_mwh: co2_factor,
            ch4_t_mwh: ch4_factor,
            n2o_t_mwh: n2o_factor,
            biogenic_co2_t_mwh: bio_factor
        },
        is_estimated
    };
}
