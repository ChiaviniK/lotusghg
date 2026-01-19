
export interface ThermalFactor {
    id: string;
    label: string;
    co2_kg_gj: number;
    ch4_kg_gj: number;
    n2o_kg_gj: number;
    type: 'fossil' | 'biogenic';
}

export const THERMAL_FACTORS: ThermalFactor[] = [
    // Fossils
    { id: 'alcatrao', label: 'Alcatrão', co2_kg_gj: 80.67, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'asfaltos', label: 'Asfaltos', co2_kg_gj: 80.67, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'carvao_met_imp', label: 'Carvão Metalúrgico Importado', co2_kg_gj: 94.60, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_met_nac', label: 'Carvão Metalúrgico Nacional', co2_kg_gj: 94.60, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_3100', label: 'Carvão Vapor 3100 kcal / kg', co2_kg_gj: 101.20, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_3300', label: 'Carvão Vapor 3300 kcal / kg', co2_kg_gj: 101.20, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_3700', label: 'Carvão Vapor 3700 kcal / kg', co2_kg_gj: 101.20, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_4200', label: 'Carvão Vapor 4200 kcal / kg', co2_kg_gj: 96.07, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_4500', label: 'Carvão Vapor 4500 kcal / kg', co2_kg_gj: 96.07, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_4700', label: 'Carvão Vapor 4700 kcal / kg', co2_kg_gj: 94.60, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_5200', label: 'Carvão Vapor 5200 kcal / kg', co2_kg_gj: 96.07, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_5900', label: 'Carvão Vapor 5900 kcal / kg', co2_kg_gj: 94.60, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_6000', label: 'Carvão Vapor 6000 kcal / kg', co2_kg_gj: 94.60, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'carvao_vap_sem', label: 'Carvão Vapor sem Especificação', co2_kg_gj: 101.20, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'coque_carvao', label: 'Coque de Carvão Mineral', co2_kg_gj: 107.07, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'coque_petroleo', label: 'Coque de Petróleo', co2_kg_gj: 97.53, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'etano', label: 'Etano', co2_kg_gj: 61.60, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'fossil' },
    { id: 'gas_coqueria', label: 'Gás de Coqueria', co2_kg_gj: 44.37, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'fossil' },
    { id: 'gas_refinaria', label: 'Gás de Refinaria', co2_kg_gj: 57.57, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'fossil' },
    { id: 'glp', label: 'Gás Liquefeito de Petróleo (GLP)', co2_kg_gj: 63.07, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'fossil' },
    { id: 'gas_nat_seco', label: 'Gás Natural Seco', co2_kg_gj: 56.10, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'fossil' },
    { id: 'gas_nat_umido', label: 'Gás Natural Úmido', co2_kg_gj: 56.10, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'fossil' },
    { id: 'gasolina_auto', label: 'Gasolina Automotiva (pura)', co2_kg_gj: 69.30, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'gasolina_av', label: 'Gasolina de Aviação', co2_kg_gj: 70.03, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'lgn', label: 'Líquidos de Gás Natural (LGN)', co2_kg_gj: 64.17, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'lubrificantes', label: 'Lubrificantes', co2_kg_gj: 73.33, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'nafta', label: 'Nafta', co2_kg_gj: 73.33, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'oleo_combustivel', label: 'Óleo Combustível', co2_kg_gj: 77.37, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'oleo_xisto', label: 'Óleo de Xisto', co2_kg_gj: 73.30, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'oleo_diesel', label: 'Óleo Diesel (puro)', co2_kg_gj: 74.07, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'oleos_residuais', label: 'Óleos Residuais', co2_kg_gj: 73.30, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'fossil' },
    { id: 'outros_petrol', label: 'Outros Produtos de Petróleo', co2_kg_gj: 73.33, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'parafina', label: 'Parafina', co2_kg_gj: 73.30, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'petroleo_bruto', label: 'Petróleo Bruto', co2_kg_gj: 73.33, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'querosene_av', label: 'Querosene de Aviação', co2_kg_gj: 71.50, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'querosene_ilum', label: 'Querosene Iluminante', co2_kg_gj: 71.87, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'residuos_ind', label: 'Resíduos Industriais', co2_kg_gj: 143.00, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'fossil' },
    { id: 'residuos_mun_f', label: 'Resíduos Municipais (fração não-biomassa)', co2_kg_gj: 91.70, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'fossil' },
    { id: 'solventes', label: 'Solventes', co2_kg_gj: 73.33, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'fossil' },
    { id: 'turfa', label: 'Turfa', co2_kg_gj: 106.00, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },
    { id: 'xisto_b', label: 'Xisto Betuminoso e Areias Betuminosas', co2_kg_gj: 107.00, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00150, type: 'fossil' },

    // Biogenic
    { id: 'etanol_anidro', label: 'Etanol Anidro', co2_kg_gj: 70.77, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'biogenic' },
    { id: 'etanol_hidratado', label: 'Etanol Hidratado', co2_kg_gj: 70.77, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'biogenic' },
    { id: 'bagaco', label: 'Bagaço de Cana', co2_kg_gj: 100.10, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'biogenic' },
    { id: 'biodiesel', label: 'Biodiesel (B100)', co2_kg_gj: 74.07, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'biogenic' },
    { id: 'biogas_outros', label: 'Biogás (outros)', co2_kg_gj: 85.27, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'biogenic' },
    { id: 'biogas_aterro', label: 'Biogás de aterro', co2_kg_gj: 119.24, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'biogenic' },
    { id: 'biometano', label: 'Biometano', co2_kg_gj: 56.10, ch4_kg_gj: 0.0010, n2o_kg_gj: 0.00010, type: 'biogenic' },
    { id: 'caldo_cana', label: 'Caldo de Cana', co2_kg_gj: 79.57, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'biogenic' },
    { id: 'carvao_veg', label: 'Carvão Vegetal', co2_kg_gj: 106.70, ch4_kg_gj: 0.2000, n2o_kg_gj: 0.00400, type: 'biogenic' },
    { id: 'lenha_com', label: 'Lenha Comercial', co2_kg_gj: 111.83, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'biogenic' },
    { id: 'licor', label: 'Licor Negro (Lixívia)', co2_kg_gj: 95.33, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00200, type: 'biogenic' },
    { id: 'melaco', label: 'Melaço', co2_kg_gj: 79.57, ch4_kg_gj: 0.0030, n2o_kg_gj: 0.00060, type: 'biogenic' },
    { id: 'residuos_mun_bio', label: 'Resíduos Municipais (fração biomassa)', co2_kg_gj: 100.00, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'biogenic' },
    { id: 'residuos_veg', label: 'Resíduos Vegetais', co2_kg_gj: 100.10, ch4_kg_gj: 0.0300, n2o_kg_gj: 0.00400, type: 'biogenic' },
];
