import { FUGITIVE_GASES } from "@/lib/constants/gases";

export interface AgricultureResult {
    emissions_tCO2e: number;
    bio_emissions_t: number;
    bio_removals_t: number;
}

export function calculateAgricultureEmissions(
    gasId: string,
    quantity_t: number,
    bio_co2_emission_t: number = 0,
    bio_co2_removal_t: number = 0
): AgricultureResult {
    const gas = FUGITIVE_GASES[gasId];

    // Default GWP to 0 if gas not found
    const gwp = gas ? gas.gwp : 0;

    const emissions_tCO2e = quantity_t * gwp;

    return {
        emissions_tCO2e,
        bio_emissions_t: bio_co2_emission_t,
        bio_removals_t: bio_co2_removal_t
    };
}
