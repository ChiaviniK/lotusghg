import { FUGITIVE_GASES } from "@/lib/constants/gases";

export interface FugitiveResult {
    emissions_kg: number;
    emissions_tCO2e: number;
}

export type CalculationMethod = "balance" | "direct";

export interface FugitiveInput {
    gasId: string;
    method: CalculationMethod;
    // Balance Method Params
    stockStart?: number; // kg
    stockEnd?: number;   // kg
    purchased?: number;  // kg
    // Direct Method Params
    emissions?: number;  // kg (if known directly)
}

export function calculateFugitiveEmissions(input: FugitiveInput): FugitiveResult {
    const gas = FUGITIVE_GASES[input.gasId];
    if (!gas) {
        return { emissions_kg: 0, emissions_tCO2e: 0 };
    }

    let emissions_kg = 0;

    if (input.method === "balance") {
        // Equation: Emissions = (StockStart - StockEnd + Purchased)
        const start = input.stockStart || 0;
        const end = input.stockEnd || 0;
        const bought = input.purchased || 0;

        // Logic check: If detailed data is missing, we assume 0
        emissions_kg = (start - end) + bought;

        // Emissions cannot be negative in this context usually, 
        // but mathematically if stock increased more than purchased, it means leak wasn't the cause? 
        // Or maybe storage increase. GHG protocol usually floors at 0 or flags it.
        // For MVP, we allow negative to show "Stock Gain" but usually we clamp to 0 for reporting.
        // Let's keep it raw for now.
    } else {
        // Direct input
        emissions_kg = input.emissions || 0;
    }

    const emissions_tCO2e = (emissions_kg * gas.gwp) / 1000;

    return {
        emissions_kg,
        emissions_tCO2e
    };
}
