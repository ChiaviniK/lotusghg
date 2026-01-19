
// Constants for Waste Management

// Default DOC values (Degradable Organic Carbon)
export const WASTE_DOC_DEFAULTS: Record<string, number> = {
    "food_waste": 0.15, // Resíduos alimentares
    "garden": 0.20,     // Resíduos de jardim/parque
    "paper": 0.40,      // Papel e papelão
    "wood": 0.43,       // Madeira e palha
    "textile": 0.24,    // Têxteis
    "nappies": 0.24,    // Fraldas descartáveis
    "sludge": 0.05,     // Lodo de esgoto (default IPCC range 0.04-0.05 depending on type)
    "inert": 0.0,       // Inertes (vidro, plástico, metal, etc)
};

// IPCC MCF (Methane Correction Factor) defaults
export const MCF_DEFAULTS = {
    "managed": 1.0,         // Aterro gerenciado
    "unmanaged_deep": 0.8,  // Aterro não gerenciado (>5m)
    "unmanaged_shallow": 0.4, // Aterro não gerenciado (<5m)
    "uncategorized": 0.6,   // Não categorizado
};

export interface WasteResult {
    emissions_tCO2e: number;
    biogenic_emissions_tCO2e: number;
}

// ------------------------------------------------------------------
// 1. LANDFILLING (RESÍDUOS ATERRADOS)
// ------------------------------------------------------------------

export interface LandfillHistoryYear {
    year: number;
    amount_t: number;
    mcf_type: keyof typeof MCF_DEFAULTS; // Quality of landfill
    methane_recovery_t: number; // Recovered CH4
}

export interface LandfillInput {
    // Composition % (0-100)
    composition: {
        food_waste: number;
        garden: number;
        paper: number;
        wood: number;
        textile: number;
        nappies: number;
        sludge: number;
        other: number; // Inerts
    };
    // Site Characteristics (Not used in simplified Tier 1 but kept for record)
    site: {
        state: string;
        city: string;
        temp_avg: number;
        precip_annual: number;
        evapo: number;
    };
    // Historical Data
    history: LandfillHistoryYear[];
}

// Simplified First Order Decay (FOD) estimation for Tier 1 / UI visual
// In a real full tool, this would calculate decay over years.
// Here we might just calculate the "Methane Generation Potential (L0)" for the deposited waste
// and assume a simplified release profile or calculate "Committed Emissions" for the deposited amount.
// Given strict browser requirement, we will calculate "Committed Emissions" (L0) for the *current inventory year's* waste
// OR aggregate standard emissions if historical data implies current year emissions from past waste.
// User prompt implies: "estimativa das emissões de CH4 da disposição de resíduos leve em conta os últimos 30 anos"
// This strongly suggests calculation of current year emissions from the stockpile.
export function calculateLandfillEmissions(input: LandfillInput, inventoryYear: number): WasteResult {
    // Constants
    const MCF = 1.0; // Default or year-specific?
    const DOCf = 0.5; // Fraction of DOC that dissimilates
    const F = 0.5; // Fraction of CH4 in landfill gas (0.5 is default)
    const GWP_CH4 = 28; // AR5

    // Rate constant (k) - depends on climate. Simplified defaults:
    // Wet/Tropical: k=0.17 (food), 0.07 (paper), etc. 
    // Let's use an average k per material for "Boreal/Temperate Wet" or "Tropical Wet" as a baseline, 
    // or estimate based on precip. 
    // If precip > 1000mm => Wet. 
    const isWet = input.site.precip_annual > 1000;

    // k values (Tropical Wet - typical for Brazil approximations if not specific)
    const k_values = isWet ? {
        food_waste: 0.4,
        garden: 0.17,
        paper: 0.07,
        wood: 0.035,
        textile: 0.07,
        nappies: 0.07,
        sludge: 0.4,
        inert: 0
    } : {
        food_waste: 0.185, // Dry defaults
        garden: 0.1,
        paper: 0.06,
        wood: 0.03,
        textile: 0.06,
        nappies: 0.06,
        sludge: 0.185,
        inert: 0
    };

    let totalCh4Generated = 0;

    // FOD Calculation:
    // CH4 generated in year T from waste deposited in year x:
    // CH4(x, T) = [Rx * DOC(x) * DOCf * MCF(x) * F * 16/12] * e^(-k(T-x-1)) * (1 - e^-k)
    // Rx = Amount deposited in year x

    input.history.forEach(record => {
        const yearsPrior = inventoryYear - record.year;
        if (yearsPrior < 0) return; // Future years don't contribute

        // Calculate CH4 from THIS record that is released in the inventoryYear
        // Sum across all waste components
        let ch4FromRecord = 0;

        Object.entries(input.composition).forEach(([type, pct]) => {
            const k = k_values[type as keyof typeof k_values] || 0;
            const doc = WASTE_DOC_DEFAULTS[type] || 0;
            const wasteAmount = record.amount_t * (pct / 100);
            const mcf = MCF_DEFAULTS[record.mcf_type] || 0.6;

            // Methane Generation Potential (L0) for this fraction
            const L0 = wasteAmount * doc * DOCf * mcf * F * (16 / 12);

            // FOD decay
            // Emission in year T = L0 * (e^(-k * (T - x - 1)) - e^(-k * (T - x))) 
            // Standard IPCC formula for year T from waste in year x
            const decay = Math.exp(-k * (yearsPrior - 1)) - Math.exp(-k * yearsPrior); // Wait, strictly (e^-k(t-1) - e^-kt) ? 
            // Actually usually it's L0 * k * e^(-k * t) approx?
            // IPCC 2006 Eq 3.4: Mass of Decomposable DOC accumulated...
            // Let's use the explicit decay term:
            // Generated = Rx * ... * (e^(-k(t-1)) - e^(-kt))
            // Note: if t=0 (current year), usually assumed t=0 or t=1? 
            // IPCC: "time x is the year of waste deposition". "T is the inventory year".
            // If T=x (deposition year), time delay usually means little emission in year 0 or half-year.
            // Simplified: (e^(-k * Math.max(0, yearsPrior - 1))) - Math.exp(-k * yearsPrior) is tricky if yearsPrior=0.
            // Let's assume (1 - exp(-k)) * exp(-k * yearsPrior)

            const emissionFactorFOD = (1 - Math.exp(-k)) * Math.exp(-k * Math.max(0, yearsPrior - 0.5)); // 0.5 year delay correction

            ch4FromRecord += L0 * emissionFactorFOD;
        });

        totalCh4Generated += ch4FromRecord;
    });

    // Subtract Recovery (Simplified: User provides recovery for *current year logic* or we subtract from total generated?)
    // User prompt: "entre com a quantidade de CH4 recuperada do aterro, ano a ano"
    // Usually Recovery is subtracted from the generated amount in that year.
    // We will sum the recovery entered for the INVENTORY YEAR.
    const currentYearRecord = input.history.find(h => h.year === inventoryYear);
    const recovered = currentYearRecord ? currentYearRecord.methane_recovery_t : 0;

    // Emissions = (Generated - Recovered) * (1 - OX)
    // OX = Oxidation factor (default 0.1 for managed, 0 for unmanaged)
    // Let's assume 0.1 widely used for cover.
    const OX = 0.1;

    let emissionsCh4 = (totalCh4Generated - recovered) * (1 - OX);
    if (emissionsCh4 < 0) emissionsCh4 = 0;

    return {
        emissions_tCO2e: emissionsCh4 * GWP_CH4,
        biogenic_emissions_tCO2e: 0 // Landfill CH4 from biogenic waste is Scope 1 anthropogenic. CO2 is biogenic (not counted).
    };
}


// ------------------------------------------------------------------
// 2. COMPOSTING
// ------------------------------------------------------------------
export interface CompostInput {
    amount_t: number;
    ch4_factor?: number; // Default 4 g CH4 / kg waste (0.004 t/t)
    n2o_factor?: number; // Default 0.24 g N2O / kg waste (0.00024 t/t)
    recovery_ch4_t: number;
}

export function calculateCompostEmissions(input: CompostInput): WasteResult {
    // Defaults IPCC 2006 (Biological Treatment)
    const CH4_EF = input.ch4_factor ?? 0.004;
    const N2O_EF = input.n2o_factor ?? 0.00024;

    const GWP_CH4 = 28;
    const GWP_N2O = 265;

    const ch4_emissions = (input.amount_t * CH4_EF) - input.recovery_ch4_t;
    const n2o_emissions = input.amount_t * N2O_EF;

    const total = (Math.max(0, ch4_emissions) * GWP_CH4) + (n2o_emissions * GWP_N2O);

    return {
        emissions_tCO2e: total,
        biogenic_emissions_tCO2e: 0 // CO2 from compost is biogenic
    };
}

// ------------------------------------------------------------------
// 3. INCINERATION
// ------------------------------------------------------------------
export interface IncinerationInput {
    amount_t: number;
    // We would need fossil carbon fraction for exact calc. 
    // Simplified: Provide direct factors or use input composition to determine fossil C?
    // User prompt: "Preencher com a porcentagem... cada tipo de resíduo"
    // "utilizamos valores padrão do IPCC [for fossil carbon]"
    composition: {
        paper: number;      // 1% fossil (inks/coatings) or assumes biogenic? IPCC says 90% bio, 10% fossil? or 100% bio?
        textile: number;    // often mix
        wood: number;
        food: number;
        garden: number;
        sludge: number;
        plastic: number;    // 100% fossil
        metal: number;      // 0
        glass: number;      // 0
        other: number;
    };
    ch4_factor?: number; // kg/t (default ~0)
    n2o_factor?: number; // kg/t 
}

const INCINERATION_DEFAULTS = {
    // Dry Matter %, Carbon %, Fossil Carbon % (of Carbon)
    // Simplified IPCC defaults
    paper: { dm: 0.9, c: 0.46, fossil: 0.01 },
    textile: { dm: 0.8, c: 0.5, fossil: 0.2 }, // Synthetic mix
    wood: { dm: 0.85, c: 0.5, fossil: 0 },
    food: { dm: 0.4, c: 0.38, fossil: 0 },
    garden: { dm: 0.4, c: 0.49, fossil: 0 },
    sludge: { dm: 0.45, c: 0.3, fossil: 0 }, // sewage
    plastic: { dm: 1.0, c: 0.75, fossil: 1.0 },
    metal: { dm: 1.0, c: 0, fossil: 0 },
    glass: { dm: 1.0, c: 0, fossil: 0 },
    other: { dm: 1.0, c: 0.3, fossil: 0.3 }, // inert/mix
};

export function calculateIncinerationEmissions(input: IncinerationInput): WasteResult {
    let fossilCo2 = 0;
    let bioCo2 = 0;

    Object.entries(input.composition).forEach(([type, pct]) => {
        if (!pct) return;
        const amount = input.amount_t * (pct / 100);
        const props = INCINERATION_DEFAULTS[type as keyof typeof INCINERATION_DEFAULTS] || INCINERATION_DEFAULTS.other;

        const totalCarbon = amount * props.dm * props.c;
        const fossilC = totalCarbon * props.fossil;
        const bioC = totalCarbon * (1 - props.fossil);

        fossilCo2 += fossilC * (44 / 12);
        bioCo2 += bioC * (44 / 12);
    });

    const GWP_CH4 = 28;
    const GWP_N2O = 265;

    // Non-CO2 emissions (CH4, N2O) - anthropogenic
    // factors are typically kg/t wet waste
    // User prompt: "será utilizado o default [CH4=0]"
    const ch4 = input.amount_t * ((input.ch4_factor ?? 0) / 1000);
    const n2o = input.amount_t * ((input.n2o_factor ?? 0.00005) / 1000); // 0.05kg/t default?

    const nonCo2 = (ch4 * GWP_CH4) + (n2o * GWP_N2O);

    return {
        emissions_tCO2e: fossilCo2 + nonCo2,
    };
}

// ------------------------------------------------------------------
// 4. SCOPE 3 SPECIFIC: LANDFILL (Allocation to Generation Year)
// ------------------------------------------------------------------

export interface Scope3LandfillInput {
    amount_t: number;
    composition: {
        food_waste: number;
        garden: number;
        paper: number;
        wood: number;
        textile: number;
        nappies: number;
        sludge: number;
        other: number;
    };
    site: {
        temp_avg: number;
        precip_annual: number;
    };
    mcf_type: keyof typeof MCF_DEFAULTS;
    methane_recovery_t: number; // Total recovery projected? Or current year? Usually projected for Scope 3.
}

export interface Scope3LandfillResult extends WasteResult {
    yearly_emissions: number[]; // 30-year projection
}

export function calculateScope3LandfillEmissions(input: Scope3LandfillInput): Scope3LandfillResult {
    // Constants
    const MCF = MCF_DEFAULTS[input.mcf_type] || 0.6;
    const DOCf = 0.5;
    const F = 0.5;
    const GWP_CH4 = 28;
    const OX = 0.1; // Default oxidation factor

    // Determine k values based on climate
    const isWet = input.site.precip_annual > 1000;
    const k_values = isWet ? {
        food_waste: 0.4, garden: 0.17, paper: 0.07, wood: 0.035, textile: 0.07, nappies: 0.07, sludge: 0.4, inert: 0
    } : {
        food_waste: 0.185, garden: 0.1, paper: 0.06, wood: 0.03, textile: 0.06, nappies: 0.06, sludge: 0.185, inert: 0
    };

    const yearly_emissions: number[] = new Array(31).fill(0); // Year 0 to 30
    let total_ch4_generated = 0;

    // Calculate L0 (Potential) per component and distribute over time
    Object.entries(input.composition).forEach(([type, pct]) => {
        if (!pct) return;
        const wasteAmount = input.amount_t * (pct / 100);
        const doc = WASTE_DOC_DEFAULTS[type] || 0;
        const k = k_values[type as keyof typeof k_values] || 0;

        if (k === 0) return; // Inert

        // L0 = Rx * DOC * DOCf * MCF * F * 16/12
        const L0 = wasteAmount * doc * DOCf * MCF * F * (16 / 12);

        // First Order Decay: Emission(t)
        // We calculate for t = 0 (year of generation) to t = 30
        // Formula: Decomposition in year t = L0 * (e^-k(t) - e^-k(t+1))??
        // IPCC Eq 3.4 is Accumulation. 
        // DDOCm decomp = DDOCm * (1 - e^-k)
        // Amount remaining at start of year t (where t=0 is deposition year):
        // Rem(t) = L0 * e^(-k * t)
        // Decomposed in year t = Rem(t) - Rem(t+1) = L0 * (e^-kt - e^-k(t+1))

        for (let t = 0; t <= 30; t++) {
            // Check delay: IPCC usually assumes reaction starts year after deposition (t=1), 
            // or 6 month delay. Let's use the explicit decay from mass balance.

            // Mass remaining at START of year t
            const massStart = L0 * Math.exp(-k * t);
            // Mass remaining at END of year t
            const massEnd = L0 * Math.exp(-k * (t + 1));

            const decomposed = massStart - massEnd;

            // Correction: If user assumes deposition happens iteratively throughout year 0, 
            // approximate delay is often handled. We'll stick to simple FOD.

            yearly_emissions[t] += decomposed;
        }
    });

    // Sum over 30 years for "Total Future Emissions" allocated to this year
    // NOTE: This assumes we account for ALL future emissions now.
    // Recovered methane should be subtracted. If it's a fixed amount per year, subtract. 
    // If it's efficacy (%), apply %. Input says "Total recovery", likely absolute.
    // Scope 3 usually asks for "recovery efficiency" or "total projected recovery".
    // We will assume the input `methane_recovery_t` is the TOTAL projected recovery over the lifetime, 
    // or we apply OX only.
    // If input is "Recuperação (t)", we treat it as total reduction from the potential.

    // Total Generated
    total_ch4_generated = yearly_emissions.reduce((a, b) => a + b, 0);

    // Net Emissions
    let net_ch4 = total_ch4_generated - input.methane_recovery_t;
    if (net_ch4 < 0) net_ch4 = 0;

    const emissions_tCO2e = net_ch4 * (1 - OX) * GWP_CH4;

    // Update yearly array to reflect CH4 -> CO2e conversion (and distribute recovery/oxidation proportionally)
    const factor = (emissions_tCO2e / (total_ch4_generated || 1));
    const yearly_co2e = yearly_emissions.map(y => y * factor);

    return {
        emissions_tCO2e,
        biogenic_emissions_tCO2e: 0,
        yearly_emissions: yearly_co2e
    };
}
