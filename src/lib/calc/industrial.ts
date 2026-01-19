import { FUGITIVE_GASES } from "@/lib/constants/gases";

export interface IndustrialProcessResult {
    emissions_tCO2e: number;
    bio_emissions_t: number;
    bio_removals_t: number;
}

export function calculateIndustrialEmissions(
    gasId: string,
    quantity_t: number, // Quantity of gas emitted in TONNES
    bio_co2_emission_t: number = 0,
    bio_co2_removal_t: number = 0
): IndustrialProcessResult {
    const gas = FUGITIVE_GASES[gasId];

    // If gas not found, default GWP to 0 (or throw error? Safe default for now)
    const gwp = gas ? gas.gwp : 0;

    // Calculate tCO2e
    const emissions_tCO2e = quantity_t * gwp;

    return {
        emissions_tCO2e,
        bio_emissions_t: bio_co2_emission_t,
        bio_removals_t: bio_co2_removal_t
    };
}
