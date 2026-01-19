
import { SIN_CHARGES_2024, EV_EFFICIENCY } from "../constants/grid-factors";

export interface SinInput {
    year: number;
    consumption_mwh: {
        jan?: number;
        feb?: number;
        mar?: number;
        apr?: number;
        may?: number;
        jun?: number;
        jul?: number;
        aug?: number;
        sep?: number;
        oct?: number;
        nov?: number;
        dec?: number;
    };
    annual_mwh?: number;
    use_monthly: boolean; // true = prioritize monthly inputs
}

export interface Scope2Result {
    emissions_tCO2e: number;
    biogenic_emissions_tCO2e: number; // Usually 0 for Grid unless specified
    energy_mwh: number;
}

export interface EvInput {
    vehicle_type: keyof typeof EV_EFFICIENCY;
    distance_km: number;
    use_monthly: boolean;
    monthly_km?: Record<string, number>; // optional breakdown
}

/**
 * Calculates emissions from grid electricity purchases (SIN)
 */
export function calculateSinEmissions(input: SinInput): Scope2Result {
    let total_emissions = 0;
    let total_energy = 0;
    const factors = SIN_CHARGES_2024; // Simplifying to use 2024 for now

    if (input.use_monthly) {
        // Calculate month by month for precision
        Object.entries(input.consumption_mwh).forEach(([month, mwh]) => {
            if (mwh && mwh > 0) {
                const factor = factors[month as keyof typeof factors] || factors.average;
                total_emissions += mwh * factor;
                total_energy += mwh;
            }
        });
    } else {
        // Annual Average
        total_energy = input.annual_mwh || 0;
        total_emissions = total_energy * factors.average;
    }

    return {
        emissions_tCO2e: total_emissions,
        biogenic_emissions_tCO2e: 0,
        energy_mwh: total_energy
    };
}

/**
 * Calculates emissions from EV charging (Location-based)
 */
export function calculateEvEmissions(input: EvInput): Scope2Result {
    const efficiency = EV_EFFICIENCY[input.vehicle_type] || 0.2; // kWh/km

    // Convert Distance to Energy (MWh)
    // km * kWh/km = kWh -> /1000 = MWh
    const total_km = input.use_monthly && input.monthly_km
        ? Object.values(input.monthly_km).reduce((a, b) => a + b, 0)
        : input.distance_km;

    const energy_kwh = total_km * efficiency;
    const energy_mwh = energy_kwh / 1000;

    // Use Average Factor for simplicity on EV annual/distance calculation 
    // (Ideally would split by month if monthly distance provided)
    const emissions = energy_mwh * SIN_CHARGES_2024.average;

    return {
        emissions_tCO2e: emissions,
        biogenic_emissions_tCO2e: 0,
        energy_mwh: energy_mwh
    };
}

export function calculateIsolatedEmissions(mwh: number, factor: number): Scope2Result {
    return {
        emissions_tCO2e: mwh * factor,
        biogenic_emissions_tCO2e: 0,
        energy_mwh: mwh
    };
}
