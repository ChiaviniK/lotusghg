
export interface LandUseResult {
    emissions_tCO2e: number;
    bio_emissions_t: number;
    bio_removals_t: number;
}

// Constants for Gas GWPs (Simplified for Land Use)
const LAND_USE_GWPS: Record<string, number> = {
    "di_xido_de_carbono_co2": 1.0,
    "metano_ch4": 28.0,
    "xido_nitroso_n2o": 265.0
};

// Logic for Table 3 (Other Tools - Restored)
export function calculateLandUseOtherTools(
    gasId: string,
    quantity_t: number,
    bio_co2_emission_t: number = 0,
    bio_co2_removal_t: number = 0
): LandUseResult {
    const gwp = LAND_USE_GWPS[gasId] || 0;
    const emissions_tCO2e = quantity_t * gwp;

    return {
        emissions_tCO2e,
        bio_emissions_t: bio_co2_emission_t,
        bio_removals_t: bio_co2_removal_t
    };
}

// Logic for Table 1 (Native Calculation - Simplified Manual Entry)
export function calculateLandUseChange(
    manual_emission_tCO2e: number,
    bio_co2_emission_t: number = 0,
    bio_co2_removal_t: number = 0
): LandUseResult {
    return {
        emissions_tCO2e: manual_emission_tCO2e,
        bio_emissions_t: bio_co2_emission_t,
        bio_removals_t: bio_co2_removal_t
    };
}
