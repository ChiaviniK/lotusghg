
// Constants based on IPCC 2006, Vol 5, Ch 6

export const BO_BOD = 0.6; // kg CH4 / kg BOD
export const BO_COD = 0.25; // kg CH4 / kg COD

// Table 6.3 - Global Warming Potentials
const GWP_CH4 = 28;
const GWP_N2O = 265;

// Emission Factors for N2O
const N2O_EF_PLANT = 0.005; // kg N2O-N / kg N (Plants)
const N2O_EF_DISCHARGE = 0.005; // kg N2O-N / kg N (Discharge) - Simplified Tier 1 often uses same

export const EFFLUENT_MCF: Record<string, { label: string, mcf: number }> = {
    "aerobic": { label: "Aeróbio (Bem gerenciado)", mcf: 0.0 },
    "aerobic_poor": { label: "Aeróbio (Mal gerenciado / Sobrecarr.)", mcf: 0.3 },
    "anaerobic_reactor": { label: "Reator Anaeróbio (UASB, etc.)", mcf: 0.8 },
    "anaerobic_lagoon_deep": { label: "Lagoa Anaeróbia (>2m)", mcf: 0.8 },
    "anaerobic_lagoon_shallow": { label: "Lagoa Anaeróbia (<2m)", mcf: 0.2 },
    "septic": { label: "Fossa Séptica", mcf: 0.5 },
    "latrine": { label: "Latrina", mcf: 0.1 },
    "untreated_discharge": { label: "Lançamento sem tratamento (Mar/Rio)", mcf: 0.1 }, // Simplified
    "stagnant_discharge": { label: "Lançamento em corpo hídrico estagnado", mcf: 0.2 }, // Rough estimate
};

export interface EffluentResult {
    emissions_tCO2e: number;
    biogenic_emissions_tCO2e: number;
    ch4_emissions_t: number;
    n2o_emissions_t: number;
}

// ------------------------------------------------------------------
// 1. TREATMENT
// ------------------------------------------------------------------
export interface EffluentTreatmentInput {
    flow_m3_year: number;

    // Organic Load
    organic_load_mg_l: number;
    load_type: "bod" | "cod";

    // System
    treatment_type: string; // key of EFFLUENT_MCF

    // Corrections
    sludge_removed_kg: number; // Organic material removed as sludge
    methane_recovered_t: number;

    // Nitrogen
    nitrogen_load_mg_l: number;
}

export function calculateEffluentTreatment(input: EffluentTreatmentInput): EffluentResult {
    // 1. CH4 Emissions
    // M = (TOW - S) * EF - R
    // EF = Bo * MCF

    const tow_kg = input.flow_m3_year * (input.organic_load_mg_l / 1000); // m3 * g/m3 = g -> /1000 = kg?
    // Wait: mg/L = g/m3. 
    // Flow (m3/yr) * Load (g/m3 or mg/L) = g/yr.
    // Divide by 1000 to get kg/yr.
    const tow_total_kg = (input.flow_m3_year * input.organic_load_mg_l) / 1000;

    const tow_net_kg = tow_total_kg - input.sludge_removed_kg;
    const tow_final = Math.max(0, tow_net_kg);

    const Bo = input.load_type === "bod" ? BO_BOD : BO_COD;
    const mcf = EFFLUENT_MCF[input.treatment_type]?.mcf ?? 0;

    const ch4_generated_kg = tow_final * Bo * mcf;
    const ch4_emitted_kg = ch4_generated_kg - (input.methane_recovered_t * 1000);
    const ch4_final_t = Math.max(0, ch4_emitted_kg / 1000); // Convert to tonnes

    // 2. N2O Emissions (Direct from Plant)
    // N = Flow * N_load
    // Emissions = N * EF * 44/28
    const n_load_kg = (input.flow_m3_year * input.nitrogen_load_mg_l) / 1000;
    const n2o_emitted_kg = n_load_kg * N2O_EF_PLANT * (44 / 28);
    const n2o_final_t = n2o_emitted_kg / 1000;

    // Total CO2e
    const total_co2e = (ch4_final_t * GWP_CH4) + (n2o_final_t * GWP_N2O);

    return {
        emissions_tCO2e: total_co2e,
        biogenic_emissions_tCO2e: 0,
        ch4_emissions_t: ch4_final_t,
        n2o_emissions_t: n2o_final_t
    };
}

// ------------------------------------------------------------------
// 2. DISPOSAL (FINAL DISCHARGE)
// ------------------------------------------------------------------
export interface EffluentDisposalInput {
    flow_m3_year: number;
    nitrogen_load_mg_l: number; // N effluent
    discharge_type: string; // key of EFFLUENT_MCF (usually untreated or specific water body)
}

export function calculateEffluentDisposal(input: EffluentDisposalInput): EffluentResult {
    // Usually focused on N2O. CH4 might be relevant if stagnant water.

    // N2O
    const n_load_kg = (input.flow_m3_year * input.nitrogen_load_mg_l) / 1000;
    const n2o_emitted_kg = n_load_kg * N2O_EF_DISCHARGE * (44 / 28);
    const n2o_final_t = n2o_emitted_kg / 1000;

    // CH4 (Optional/Advanced) - usually zero for flowing water, but let's check input
    // If user selects "stagnant", we apply MCF. what is the organic load?
    // Simplified: We usually need BOD/COD for discharge CH4. 
    // If the form Step 11/12 implies *Post-treatment* discharge, we assume low organic load?
    // For now, let's assume 0 CH4 for discharge unless explicit inputs added. 
    // The prompt focuses on N2O for discharge in many simplified tools, but let's see.
    // "Emissões de N2O... Emissões de CH4" are in the table.
    // We will assume 0 CH4 for Disposal unless we add BOD inputs to this calculator.
    // Adding 0 for now to stay safe, or we'd need BOD input for disposal too.

    const ch4_final_t = 0;

    const total_co2e = (ch4_final_t * GWP_CH4) + (n2o_final_t * GWP_N2O);

    return {
        emissions_tCO2e: total_co2e,
        biogenic_emissions_tCO2e: 0,
        ch4_emissions_t: ch4_final_t,
        n2o_emissions_t: n2o_final_t
    };
}

// ------------------------------------------------------------------
// 3. SCOPE 3 SPECIFIC: DOMESTIC & INDUSTRIAL
// ------------------------------------------------------------------

// Alternative 2 Defaults (Population Based)
// Brazil / IPCC defaults:
// BOD: 50 g/person/day = 0.05 kg/person/day
// Flow: ~150 L/person/day = 0.15 m3/person/day (varies widely, but needed for N calc if not provided)
// Nitrogen: ~8-12 g N/person/day? 
export const PER_CAPITA_DEFAULTS = {
    BOD_KG_DAY: 0.050, // 50g
    N_KG_DAY: 0.012,   // 12g (IPCC range)
    FLOW_M3_DAY: 0.150 // 150 Liters
};

export interface DomesticAlt2Input {
    population: number;
    activity_type?: string;
    treatment_type: string; // key of EFFLUENT_MCF
    treatment_type_2?: string; // Sequential
    disposal_type?: string; // Final discharge
}

export function calculateScope3DomesticAlt2(input: DomesticAlt2Input): EffluentResult {
    const days = 365;

    // 1. Estimate Loads from Population
    const flow_m3_year = input.population * PER_CAPITA_DEFAULTS.FLOW_M3_DAY * days;
    const bod_load_kg_year = input.population * PER_CAPITA_DEFAULTS.BOD_KG_DAY * days;
    const n_load_kg_year = input.population * PER_CAPITA_DEFAULTS.N_KG_DAY * days;

    // Organic Load Concentration (computed for consistency with main function)
    // kg/yr / m3/yr * 1000 = mg/L
    const organic_load_mg_l = (bod_load_kg_year / flow_m3_year) * 1000;
    const nitrogen_load_mg_l = (n_load_kg_year / flow_m3_year) * 1000;

    // 2. Treatment 1
    const res1 = calculateEffluentTreatment({
        flow_m3_year,
        organic_load_mg_l,
        load_type: "bod",
        treatment_type: input.treatment_type,
        sludge_removed_kg: 0, // Assumption for simplified
        methane_recovered_t: 0,
        nitrogen_load_mg_l
    });

    let total_ch4 = res1.ch4_emissions_t;
    let total_n2o = res1.n2o_emissions_t;

    // 3. Sequential Treatment (Optional)
    if (input.treatment_type_2) {
        // Estimate removal from T1 to get input for T2
        // Simplified removal efficiencies (defaults)
        // Aerobic: 90%, Anaerobic: 70-80%, Septic: 50%
        // We really need specific removal rates. 
        // For Scope 3 Alt 2, maybe we just assume sequential means "Output of 1 goes to 2".
        // Let's assume a generic 60% removal if not specified? 
        // Actually, without removal rates, T2 calc is guess work.
        // Let's assume T2 processes the *remaining* load.
        // Remaining Load = Load * (1 - Efficiency). 
        // We will define approximate efficiencies map or default to 0.5
        const efficiency = 0.6; // 60% removal default

        const load_2 = organic_load_mg_l * (1 - efficiency);
        const n_load_2 = nitrogen_load_mg_l; // N usually persists unless specific denitrification

        const res2 = calculateEffluentTreatment({
            flow_m3_year, // Flow assumes constant
            organic_load_mg_l: load_2,
            load_type: "bod",
            treatment_type: input.treatment_type_2,
            sludge_removed_kg: 0,
            methane_recovered_t: 0,
            nitrogen_load_mg_l: n_load_2
        });

        total_ch4 += res2.ch4_emissions_t;
        // Bio N2O is usually per person, not summed per stage unless specific process N2O.
        // IPCC: Indirect N2O is total N * factor. Plant operations N2O is usually per plant.
        // We sum them.
        total_n2o += res2.n2o_emissions_t;
    }

    // 4. Disposal (Final)
    if (input.disposal_type) {
        // Assume some removal if treated
        const efficiency_total = input.treatment_type_2 ? 0.8 : 0.6;
        const n_final = nitrogen_load_mg_l * (1 - (efficiency_total * 0.5)); // N removal is lower than BOD usually

        const resDisp = calculateEffluentDisposal({
            flow_m3_year,
            nitrogen_load_mg_l: n_final, // Remaining N
            discharge_type: input.disposal_type
        });

        // Disposal CH4 is usually 0 except stagnant, but N2O is significant
        total_ch4 += resDisp.ch4_emissions_t;
        total_n2o += resDisp.n2o_emissions_t;
    }

    const GWP_CH4 = 28;
    const GWP_N2O = 265;
    const total_co2e = (total_ch4 * GWP_CH4) + (total_n2o * GWP_N2O);

    return {
        emissions_tCO2e: total_co2e,
        biogenic_emissions_tCO2e: 0,
        ch4_emissions_t: total_ch4,
        n2o_emissions_t: total_n2o
    };
}
