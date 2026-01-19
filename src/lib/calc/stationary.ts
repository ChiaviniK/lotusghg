import { STATIONARY_FUELS } from "@/lib/constants/fuels";

export interface CalculationResult {
    energy_TJ: number;

    // Detailed Gas Emissions (Targeting user request)
    emissions_CO2_fossil_kg: number;
    emissions_CO2_bio_kg: number;
    emissions_CH4_kg: number;
    emissions_N2O_kg: number;

    // Tonnages for reporting
    emissions_CO2_fossil_t: number;
    emissions_CO2_bio_t: number; // Biogenic
    emissions_CH4_t: number;
    emissions_N2O_t: number;

    // Totals
    emissions_tCO2e: number;
}

// Global Warming Potentials (AR5 usually)
const GWP_CH4 = 28;
const GWP_N2O = 265;

export function calculateStationaryEmissions(
    fuelName: string,
    quantity: number
): CalculationResult {
    const fuel = STATIONARY_FUELS[fuelName];

    if (!fuel) {
        console.warn(`Fuel not found: ${fuelName}`);
        return {
            energy_TJ: 0,
            emissions_CO2_fossil_kg: 0, emissions_CO2_bio_kg: 0, emissions_CH4_kg: 0, emissions_N2O_kg: 0,
            emissions_CO2_fossil_t: 0, emissions_CO2_bio_t: 0, emissions_CH4_t: 0, emissions_N2O_t: 0,
            emissions_tCO2e: 0
        };
    }

    // 1. Convert Quantity to Mass (kg)
    let mass_tonnes = 0;

    if (fuel.unit === "Toneladas") {
        mass_tonnes = quantity;
    } else if (fuel.unit === "kg") {
        mass_tonnes = quantity / 1000;
    } else {
        // Volume based (m3, Litros) -> use Density (kg/unit)
        mass_tonnes = (quantity * fuel.density) / 1000;
    }

    // 2. Calculate Energy (TJ)
    // Energy (GJ) = Mass (t) * PCI (GJ/t)
    const energy_GJ = mass_tonnes * fuel.pci;
    const energy_TJ = energy_GJ / 1000;

    // 3. Calculate Emissions (kg)
    // EF is in kg/TJ
    const raw_co2 = energy_TJ * fuel.ef_co2;
    const raw_ch4 = energy_TJ * (fuel.ef_ch4 || 0);
    const raw_n2o = energy_TJ * (fuel.ef_n2o || 0);

    // 4. Split Fossil vs Bio
    let co2_fossil = 0;
    let co2_bio = 0;

    if (fuel.isBio) {
        co2_bio = raw_co2;
    } else {
        co2_fossil = raw_co2;
    }

    // 5. Convert to Tonnes
    const co2_fossil_t = co2_fossil / 1000;
    const co2_bio_t = co2_bio / 1000;
    const ch4_t = raw_ch4 / 1000;
    const n2o_t = raw_n2o / 1000;

    // 6. Calculate tCO2e (Total GHG)
    // Biogenic CO2 is usually reported separately and NOT included in Scope 1 totals (check Protocol)
    // The user requested: "Emissões de GEE totais t CO2e" and "Emissões biogênicas t CO2".
    // Standard: Scope 1 = Fossil CO2 + (CH4 * GWP) + (N2O * GWP)

    const tco2e = co2_fossil_t + (ch4_t * GWP_CH4) + (n2o_t * GWP_N2O);

    return {
        energy_TJ,
        emissions_CO2_fossil_kg: co2_fossil,
        emissions_CO2_bio_kg: co2_bio,
        emissions_CH4_kg: raw_ch4,
        emissions_N2O_kg: raw_n2o,

        emissions_CO2_fossil_t: co2_fossil_t,
        emissions_CO2_bio_t: co2_bio_t,
        emissions_CH4_t: ch4_t,
        emissions_N2O_t: n2o_t,

        emissions_tCO2e: tco2e
    };
}
