import { StationaryCombustionResult } from "./stationary";
import { STATIONARY_FUELS, MOBILE_FUELS } from "@/lib/constants/fuels";
import { FUGITIVE_GASES } from "@/lib/constants/gases";

export interface MobileCombustionResult {
    energy_TJ: number;
    emissions_CO2_kg: number;
    emissions_CH4_kg: number;
    emissions_N2O_kg: number;
    emissions_tCO2e: number;
}

export function calculateMobileEmissions(
    mobileSourceId: string,
    quantity: number
): MobileCombustionResult {
    // 1. Try to find Mobile Source
    const mobileFuel = MOBILE_FUELS[mobileSourceId];

    // Fallback: If not found, check if it's a Stationary ID (legacy support or direct fuel usage)
    if (!mobileFuel) {
        // If user passes a stationary fuel ID directly (e.g. "gasolina_automotiva"), handle it?
        // For now, if not found, return 0. (Or assume it's just a raw fuel without vehicle data?)
        // Let's assume the ID must exist.
        console.warn(`Mobile Source not found: ${mobileSourceId}`);
        return { energy_TJ: 0, emissions_CO2_kg: 0, emissions_CH4_kg: 0, emissions_N2O_kg: 0, emissions_tCO2e: 0 };
    }

    // 2. Link to Stationary Fuel for CO2 (Density/PCI/CO2 Factor)
    const stationaryFuel = STATIONARY_FUELS[mobileFuel.fuelId];

    if (!stationaryFuel) {
        console.warn(`Linked Stationary Fuel not found: ${mobileFuel.fuelId}`);
        return { energy_TJ: 0, emissions_CO2_kg: 0, emissions_CH4_kg: 0, emissions_N2O_kg: 0, emissions_tCO2e: 0 };
    }

    // 3. Calculate CO2 (Using Stationary Logic: Vol -> Mass -> Energy -> CO2)
    // Assume input quantity is Liters (since Mobile Factors are kg/L)
    // Stationary Fuel unit might be Liters, m3, or Tonnes.

    let mass_tonnes = 0;

    // We assume Quantity is in LITERS because Mobile Factors are kg/L.
    // Convert Liters to Stationary Unit basis.

    // If Stationary Unit is Liters, mass conversion uses density if PCI is mass-based?
    // Stationary Fuel Logic:
    // If unit is Liters, and PCI is kcal/kg, we need Mass.
    // DENSITY in Stationary Config is usually calculated/stored relative to unit?
    // Let's rely on density to get KG.

    // Density in fuels.ts: 0.742 for Gasolina. Unit "Litros".
    // This implies 0.742 kg/Liter.
    const density_kg_L = stationaryFuel.density; // Assuming density corresponds to unit 1:1 if unit is Litros?
    // Wait. For Gasolina (Litros), density is 0.742. 
    // Stationary calc says: mass_tonnes = (quantity * fuel.density) / 1000;
    // IF quantity is Liters.
    // So mass_kg = quantity * density. mass_tonnes = mass_kg / 1000.

    mass_tonnes = (quantity * density_kg_L) / 1000;

    // Calculate Energy (TJ)
    const energy_GJ = mass_tonnes * stationaryFuel.pci;
    const energy_TJ = energy_GJ / 1000;

    // CO2 (kg)
    const emissions_CO2_kg = energy_TJ * stationaryFuel.ef_co2;

    // 4. Calculate CH4 / N2O (Using Mobile Factors kg/L)
    // quantity is Liters.
    const emissions_CH4_kg = quantity * mobileFuel.ef_ch4_kg_l;
    const emissions_N2O_kg = quantity * mobileFuel.ef_n2o_kg_l;

    // 5. Total tCO2e
    // Uses AR5 GWPs from constants
    const GWP_CH4 = FUGITIVE_GASES.ch4.gwp;
    const GWP_N2O = FUGITIVE_GASES.n2o.gwp;

    const total_kg_CO2e = emissions_CO2_kg
        + (emissions_CH4_kg * GWP_CH4)
        + (emissions_N2O_kg * GWP_N2O);

    return {
        energy_TJ,
        emissions_CO2_kg,
        emissions_CH4_kg,
        emissions_N2O_kg,
        emissions_tCO2e: total_kg_CO2e / 1000
    };
}
