export interface FuelFactor {
  id: string;
  name: string;
  unit: string;
  pci: number;
  density: number;
  ef_co2: number;
  ef_ch4: number;
  ef_n2o: number;
  isBio: boolean;
}

export interface MobileFuel {
  id: string;
  name: string;
  fuelName: string;
  fuelId: string;
  mode: 'road' | 'rail' | 'water' | 'air';
  ef_ch4_kg_l: number;
  ef_n2o_kg_l: number;
}

export const STATIONARY_FUELS: Record<string, FuelFactor> = {
  "Acetileno": {
    id: "acetileno",
    name: "Acetileno",
    unit: "kg",
    pci: 0,
    density: 0,
    ef_co2: 0,
    ef_ch4: 0,
    ef_n2o: 0,
    isBio: false
  },
  "Alcatrão": {
    id: "alcatr_o",
    name: "Alcatrão",
    unit: "m³",
    pci: 35.79714,
    density: 1000.0,
    ef_co2: 80666.66666666666,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Asfaltos": {
    id: "asfaltos",
    name: "Asfaltos",
    unit: "m³",
    pci: 40.988772,
    density: 1025.0,
    ef_co2: 80666.66666666666,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Carvão Metalúrgico Importado": {
    id: "carv_o_metal_rgico_importado",
    name: "Carvão Metalúrgico Importado",
    unit: "Toneladas",
    pci: 30.98232,
    density: 1000,
    ef_co2: 94600.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Metalúrgico Nacional": {
    id: "carv_o_metal_rgico_nacional",
    name: "Carvão Metalúrgico Nacional",
    unit: "Toneladas",
    pci: 26.879255999999998,
    density: 1000,
    ef_co2: 94600.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 3100 kcal / kg": {
    id: "carv_o_vapor_3100_kcal___kg",
    name: "Carvão Vapor 3100 kcal / kg",
    unit: "Toneladas",
    pci: 12.35106,
    density: 1000,
    ef_co2: 101200.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 3300 kcal / kg": {
    id: "carv_o_vapor_3300_kcal___kg",
    name: "Carvão Vapor 3300 kcal / kg",
    unit: "Toneladas",
    pci: 12.97908,
    density: 1000,
    ef_co2: 101200.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 3700 kcal / kg": {
    id: "carv_o_vapor_3700_kcal___kg",
    name: "Carvão Vapor 3700 kcal / kg",
    unit: "Toneladas",
    pci: 14.653799999999999,
    density: 1000,
    ef_co2: 101200.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 4200 kcal / kg": {
    id: "carv_o_vapor_4200_kcal___kg",
    name: "Carvão Vapor 4200 kcal / kg",
    unit: "Toneladas",
    pci: 16.7472,
    density: 1000,
    ef_co2: 96066.66666666666,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 4500 kcal / kg": {
    id: "carv_o_vapor_4500_kcal___kg",
    name: "Carvão Vapor 4500 kcal / kg",
    unit: "Toneladas",
    pci: 17.793899999999997,
    density: 1000,
    ef_co2: 96066.66666666666,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 4700 kcal / kg": {
    id: "carv_o_vapor_4700_kcal___kg",
    name: "Carvão Vapor 4700 kcal / kg",
    unit: "Toneladas",
    pci: 18.631259999999997,
    density: 1000,
    ef_co2: 94600.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 5200 kcal / kg": {
    id: "carv_o_vapor_5200_kcal___kg",
    name: "Carvão Vapor 5200 kcal / kg",
    unit: "Toneladas",
    pci: 20.51532,
    density: 1000,
    ef_co2: 96066.66666666666,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 5900 kcal / kg": {
    id: "carv_o_vapor_5900_kcal___kg",
    name: "Carvão Vapor 5900 kcal / kg",
    unit: "Toneladas",
    pci: 23.44608,
    density: 1000,
    ef_co2: 94600.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor 6000 kcal / kg": {
    id: "carv_o_vapor_6000_kcal___kg",
    name: "Carvão Vapor 6000 kcal / kg",
    unit: "Toneladas",
    pci: 23.864759999999997,
    density: 1000,
    ef_co2: 94600.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Carvão Vapor sem Especificação": {
    id: "carv_o_vapor_sem_especifica__o",
    name: "Carvão Vapor sem Especificação",
    unit: "Toneladas",
    pci: 11.932379999999998,
    density: 1000,
    ef_co2: 101200.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Coque de Carvão Mineral": {
    id: "coque_de_carv_o_mineral",
    name: "Coque de Carvão Mineral",
    unit: "Toneladas",
    pci: 28.88892,
    density: 1000,
    ef_co2: 107066.66666666666,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Coque de Petróleo": {
    id: "coque_de_petr_leo",
    name: "Coque de Petróleo",
    unit: "m³",
    pci: 35.127252,
    density: 1040.0,
    ef_co2: 97533.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Etano": {
    id: "etano",
    name: "Etano",
    unit: "Toneladas",
    pci: 46.4,
    density: 1000,
    ef_co2: 61600.0,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Gás de Coqueria": {
    id: "g_s_de_coqueria",
    name: "Gás de Coqueria",
    unit: "Toneladas",
    pci: 38.7,
    density: 1000,
    ef_co2: 44366.66666666666,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Gás de Refinaria": {
    id: "g_s_de_refinaria",
    name: "Gás de Refinaria",
    unit: "Toneladas",
    pci: 49.5,
    density: 1000,
    ef_co2: 57566.666666666664,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Gás Liquefeito de Petróleo (GLP)": {
    id: "g_s_liquefeito_de_petr_leo__glp_",
    name: "Gás Liquefeito de Petróleo (GLP)",
    unit: "Toneladas",
    pci: 46.473479999999995,
    density: 1000,
    ef_co2: 63066.666666666664,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Gás Natural Seco": {
    id: "g_s_natural_seco",
    name: "Gás Natural Seco",
    unit: "m³",
    pci: 49.78897297297297,
    density: 0.74,
    ef_co2: 56100.0,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Gás Natural Úmido": {
    id: "g_s_natural__mido",
    name: "Gás Natural Úmido",
    unit: "m³",
    pci: 56.18232972972972,
    density: 0.74,
    ef_co2: 56100.0,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Gasolina Automotiva (pura)": {
    id: "gasolina_automotiva__pura_",
    name: "Gasolina Automotiva (pura)",
    unit: "Litros",
    pci: 43.54272,
    density: 0.742,
    ef_co2: 69300.0,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Gasolina de Aviação": {
    id: "gasolina_de_avia__o",
    name: "Gasolina de Aviação",
    unit: "Litros",
    pci: 44.38008,
    density: 0.726,
    ef_co2: 70033.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Líquidos de Gás Natural (LGN)": {
    id: "l_quidos_de_g_s_natural__lgn_",
    name: "Líquidos de Gás Natural (LGN)",
    unit: "Toneladas",
    pci: 44.2,
    density: 1000,
    ef_co2: 64166.66666666666,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Lubrificantes": {
    id: "lubrificantes",
    name: "Lubrificantes",
    unit: "Litros",
    pci: 42.370416,
    density: 0.875,
    ef_co2: 73333.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Nafta": {
    id: "nafta",
    name: "Nafta",
    unit: "m³",
    pci: 44.505684,
    density: 702.0,
    ef_co2: 73333.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Óleo Combustível": {
    id: "_leo_combust_vel",
    name: "Óleo Combustível",
    unit: "Litros",
    pci: 40.15141199999999,
    density: 1.0,
    ef_co2: 77366.66666666667,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Óleo de Xisto": {
    id: "_leo_de_xisto",
    name: "Óleo de Xisto",
    unit: "Toneladas",
    pci: 38.1,
    density: 1000,
    ef_co2: 73300.0,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Óleo Diesel (puro)": {
    id: "_leo_diesel__puro_",
    name: "Óleo Diesel (puro)",
    unit: "Litros",
    pci: 42.28668,
    density: 0.84,
    ef_co2: 74066.66666666666,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Óleos Residuais": {
    id: "_leos_residuais",
    name: "Óleos Residuais",
    unit: "Toneladas",
    pci: 40.2,
    density: 1000,
    ef_co2: 73300.0,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Outros Produtos de Petróleo": {
    id: "outros_produtos_de_petr_leo",
    name: "Outros Produtos de Petróleo",
    unit: "Toneladas",
    pci: 42.70536,
    density: 1000,
    ef_co2: 73333.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Parafina": {
    id: "parafina",
    name: "Parafina",
    unit: "Toneladas",
    pci: 40.2,
    density: 1000,
    ef_co2: 73300.0,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Petróleo Bruto": {
    id: "petr_leo_bruto",
    name: "Petróleo Bruto",
    unit: "m³",
    pci: 45.217439999999996,
    density: 884.0,
    ef_co2: 73333.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Querosene de Aviação": {
    id: "querosene_de_avia__o",
    name: "Querosene de Aviação",
    unit: "Toneladas",
    pci: 43.54272,
    density: 1000,
    ef_co2: 71500.0,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Querosene Iluminante": {
    id: "querosene_iluminante",
    name: "Querosene Iluminante",
    unit: "Toneladas",
    pci: 43.54272,
    density: 1000,
    ef_co2: 71866.66666666667,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Resíduos Industriais": {
    id: "res_duos_industriais",
    name: "Resíduos Industriais",
    unit: "TJ",
    pci: 0,
    density: 0,
    ef_co2: 143000.0,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Resíduos Municipais (fração não-biomassa)": {
    id: "res_duos_municipais__fra__o_n_o_biomassa_",
    name: "Resíduos Municipais (fração não-biomassa)",
    unit: "Toneladas",
    pci: 10.0,
    density: 1000,
    ef_co2: 91700.0,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Solventes": {
    id: "solventes",
    name: "Solventes",
    unit: "Litros",
    pci: 44.170739999999995,
    density: 0.741,
    ef_co2: 73333.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Turfa": {
    id: "turfa",
    name: "Turfa",
    unit: "Toneladas",
    pci: 9.76,
    density: 1000,
    ef_co2: 106000.0,
    ef_ch4: 2.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Xisto Betuminoso e Areias Betuminosas": {
    id: "xisto_betuminoso_e_areias_betuminosas",
    name: "Xisto Betuminoso e Areias Betuminosas",
    unit: "Toneladas",
    pci: 8.9,
    density: 1000,
    ef_co2: 107000.0,
    ef_ch4: 10.0,
    ef_n2o: 1.5,
    isBio: false
  },
  "Etanol Anidro": {
    id: "etanol_anidro",
    name: "Etanol Anidro",
    unit: "Litros",
    pci: 28.2609,
    density: 0.791,
    ef_co2: 70766.66666666667,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: true
  },
  "Etanol Hidratado": {
    id: "etanol_hidratado",
    name: "Etanol Hidratado",
    unit: "Litros",
    pci: 26.37684,
    density: 0.809,
    ef_co2: 70766.66666666667,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: true
  },
  "Bagaço de Cana": {
    id: "baga_o_de_cana",
    name: "Bagaço de Cana",
    unit: "Toneladas",
    pci: 8.917884,
    density: 1000,
    ef_co2: 100100.0,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: true
  },
  "Biodiesel (B100)": {
    id: "biodiesel__b100_",
    name: "Biodiesel (B100)",
    unit: "Litros",
    pci: 37.6812,
    density: 0.88,
    ef_co2: 74066.66666666666,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: true
  },
  "Biogás (outros)": {
    id: "biog_s__outros_",
    name: "Biogás (outros)",
    unit: "Toneladas",
    pci: 20.0,
    density: 1000,
    ef_co2: 85271.31782945737,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Biogás de aterro": {
    id: "biog_s_de_aterro",
    name: "Biogás de aterro",
    unit: "Toneladas",
    pci: 12.3,
    density: 1000,
    ef_co2: 119241.1924119241,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Biometano": {
    id: "biometano",
    name: "Biometano",
    unit: "Toneladas",
    pci: 49.0,
    density: 1000,
    ef_co2: 56100.0,
    ef_ch4: 1.0,
    ef_n2o: 0.1,
    isBio: false
  },
  "Caldo de Cana": {
    id: "caldo_de_cana",
    name: "Caldo de Cana",
    unit: "Toneladas",
    pci: 2.5958159999999997,
    density: 1000,
    ef_co2: 79566.66666666666,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Carvão Vegetal": {
    id: "carv_o_vegetal",
    name: "Carvão Vegetal",
    unit: "Toneladas",
    pci: 27.046727999999998,
    density: 1000,
    ef_co2: 106700.0,
    ef_ch4: 200.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Lenha Comercial": {
    id: "lenha_comercial",
    name: "Lenha Comercial",
    unit: "Toneladas",
    pci: 12.97908,
    density: 1000,
    ef_co2: 111833.33333333333,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Licor Negro (Lixívia)": {
    id: "licor_negro__lix_via_",
    name: "Licor Negro (Lixívia)",
    unit: "Toneladas",
    pci: 11.974248,
    density: 1000,
    ef_co2: 95333.33333333333,
    ef_ch4: 3.0,
    ef_n2o: 2.0,
    isBio: false
  },
  "Melaço": {
    id: "mela_o",
    name: "Melaço",
    unit: "Toneladas",
    pci: 7.74558,
    density: 1000,
    ef_co2: 79566.66666666666,
    ef_ch4: 3.0,
    ef_n2o: 0.6,
    isBio: false
  },
  "Resíduos Municipais (fração biomassa)": {
    id: "res_duos_municipais__fra__o_biomassa_",
    name: "Resíduos Municipais (fração biomassa)",
    unit: "Toneladas",
    pci: 11.6,
    density: 1000,
    ef_co2: 100000.0,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Resíduos Vegetais": {
    id: "res_duos_vegetais",
    name: "Resíduos Vegetais",
    unit: "Toneladas",
    pci: 11.6,
    density: 1000,
    ef_co2: 100100.0,
    ef_ch4: 30.0,
    ef_n2o: 4.0,
    isBio: false
  },
  "Fator de emissão por tipo de combustível": {
    id: "fator_de_emiss_o_por_tipo_de_combust_vel",
    name: "Fator de emissão por tipo de combustível",
    unit: "",
    pci: 0,
    density: 0,
    ef_co2: 0,
    ef_ch4: 0,
    ef_n2o: 0,
    isBio: false
  },
  "Fator de emissão por frota e tipo de combustível": {
    id: "fator_de_emiss_o_por_frota_e_tipo_de_combust_vel",
    name: "Fator de emissão por frota e tipo de combustível",
    unit: "",
    pci: 0,
    density: 0,
    ef_co2: 0,
    ef_ch4: 0,
    ef_n2o: 0,
    isBio: false
  },
  "Combustível": {
    id: "combust_vel",
    name: "Combustível",
    unit: "Fatores de Emissão (unidades originais) - MMA (2014) e CETESB (2023) CH4 (g/km)",
    pci: 0,
    density: 0,
    ef_co2: 0,
    ef_ch4: 0,
    ef_n2o: 0,
    isBio: false
  },
};

export const MOBILE_FUELS: Record<string, MobileFuel> = {
  "autom_vel_a_gasolina_gasolina_automotiva__comercial_": {
    id: "autom_vel_a_gasolina_gasolina_automotiva__comercial_",
    name: "Automóvel a gasolina",
    fuelName: "Gasolina Automotiva (comercial)",
    fuelId: "gasolina_automotiva__pura_",
    mode: "road",
    ef_ch4_kg_l: 4.1123660574470984e-05,
    ef_n2o_kg_l: 0.00029938880468791666
  },
  "autom_vel_a_gnv_g_s_natural_veicular__gnv_": {
    id: "autom_vel_a_gnv_g_s_natural_veicular__gnv_",
    name: "Automóvel a GNV",
    fuelName: "Gás Natural Veicular (GNV)",
    fuelId: "g_s_natural_veicular__gnv_",
    mode: "road",
    ef_ch4_kg_l: 0.00264,
    ef_n2o_kg_l: 0.0003756
  },
  "ve_culo_comercial_leve_a_diesel__leo_diesel__comercial_": {
    id: "ve_culo_comercial_leve_a_diesel__leo_diesel__comercial_",
    name: "Veículo comercial leve a diesel",
    fuelName: "Óleo Diesel (comercial)",
    fuelId: "_leo_diesel__puro_",
    mode: "road",
    ef_ch4_kg_l: 7.91e-05,
    ef_n2o_kg_l: 0.00022600000000000002
  },
  "autom_vel_h_brido_a_gasolina_gasolina_automotiva__comercial_": {
    id: "autom_vel_h_brido_a_gasolina_gasolina_automotiva__comercial_",
    name: "Automóvel híbrido a gasolina",
    fuelName: "Gasolina Automotiva (comercial)",
    fuelId: "gasolina_automotiva__pura_",
    mode: "road",
    ef_ch4_kg_l: 0.00010704444149532847,
    ef_n2o_kg_l: 5.833762610986718e-05
  },
  "tipo_de_ve_culo_combust_vel": {
    id: "tipo_de_ve_culo_combust_vel",
    name: "Tipo de Veículo",
    fuelName: "Combustível",
    fuelId: "combust_vel",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "autom_vel_a_etanol_etanol_hidratado": {
    id: "autom_vel_a_etanol_etanol_hidratado",
    name: "Automóvel a etanol",
    fuelName: "Etanol Hidratado",
    fuelId: "etanol_hidratado",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "autom_vel_a_biometano_biometano": {
    id: "autom_vel_a_biometano_biometano",
    name: "Automóvel a biometano",
    fuelName: "Biometano",
    fuelId: "biometano",
    mode: "road",
    ef_ch4_kg_l: 0.0007585714319999999,
    ef_n2o_kg_l: 1.6301892000000002e-05
  },
  "unidade_tipo_do_ve_culo": {
    id: "unidade_tipo_do_ve_culo",
    name: "Unidade",
    fuelName: "Tipo do Veículo",
    fuelId: "tipo_do_ve_culo",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2_1": {
    id: "2_1",
    name: "2",
    fuelName: "1",
    fuelId: "1",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "km___litro_autom_vel_a_gasolina": {
    id: "km___litro_autom_vel_a_gasolina",
    name: "km / litro",
    fuelName: "Automóvel a gasolina",
    fuelId: "autom_vel_a_gasolina",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "km___m__autom_vel_a_gnv": {
    id: "km___m__autom_vel_a_gnv",
    name: "km / m³",
    fuelName: "Automóvel a GNV",
    fuelId: "autom_vel_a_gnv",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "km___litro_motocicleta_a_gasolina": {
    id: "km___litro_motocicleta_a_gasolina",
    name: "km / litro",
    fuelName: "Motocicleta a gasolina",
    fuelId: "motocicleta_a_gasolina",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "km___kwh_autom_vel_h_brido_plug_in_a_eletricidade": {
    id: "km___kwh_autom_vel_h_brido_plug_in_a_eletricidade",
    name: "km / kWh",
    fuelName: "Automóvel híbrido plug-in a eletricidade",
    fuelId: "autom_vel_h_brido_plug_in_a_eletricidade",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "ano_tipo_de__nibus": {
    id: "ano_tipo_de__nibus",
    name: "Ano",
    fuelName: "Tipo de ônibus",
    fuelId: "tipo_de__nibus",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2006__nibus_municipal": {
    id: "2006__nibus_municipal",
    name: "2006",
    fuelName: "Ônibus municipal",
    fuelId: "_nibus_municipal",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "___nibus_de_viagem": {
    id: "___nibus_de_viagem",
    name: "-",
    fuelName: "Ônibus de viagem",
    fuelId: "_nibus_de_viagem",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "fator_de_emiss_o___defra__kg_co2e___t_km__tipo_de_caminh_o": {
    id: "fator_de_emiss_o___defra__kg_co2e___t_km__tipo_de_caminh_o",
    name: "Fator de emissão - DEFRA (kg CO2e / t.km)",
    fuelName: "Tipo de caminhão",
    fuelId: "tipo_de_caminh_o",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_85353_van___classe_i__at__1_305_toneladas_": {
    id: "0_85353_van___classe_i__at__1_305_toneladas_",
    name: "0.85353",
    fuelName: "Van - classe I (até 1,305 toneladas)",
    fuelId: "van___classe_i__at__1_305_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_61153_van___classe_ii__1_305_a_1_74_toneladas_": {
    id: "0_61153_van___classe_ii__1_305_a_1_74_toneladas_",
    name: "0.61153",
    fuelName: "Van - classe II (1,305 a 1,74 toneladas)",
    fuelId: "van___classe_ii__1_305_a_1_74_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_61363_van___classe_iii__1_74_a_3_5_toneladas_": {
    id: "0_61363_van___classe_iii__1_74_a_3_5_toneladas_",
    name: "0.61363",
    fuelName: "Van - classe III (1,74 a 3,5 toneladas)",
    fuelId: "van___classe_iii__1_74_a_3_5_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_61643_van___m_dia__at__3_5_toneladas_": {
    id: "0_61643_van___m_dia__at__3_5_toneladas_",
    name: "0.61643",
    fuelName: "Van - média (até 3,5 toneladas)",
    fuelId: "van___m_dia__at__3_5_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_50546_caminh_o___r_gido__3_5_a_7_5_toneladas_": {
    id: "0_50546_caminh_o___r_gido__3_5_a_7_5_toneladas_",
    name: "0.50546",
    fuelName: "Caminhão - rígido (3,5 a 7,5 toneladas)",
    fuelId: "caminh_o___r_gido__3_5_a_7_5_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_38233_caminh_o___r_gido__7_5_a_17_toneladas_": {
    id: "0_38233_caminh_o___r_gido__7_5_a_17_toneladas_",
    name: "0.38233",
    fuelName: "Caminhão - rígido (7,5 a 17 toneladas)",
    fuelId: "caminh_o___r_gido__7_5_a_17_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_15398_caminh_o___r_gido__acima_de_17_toneladas_": {
    id: "0_15398_caminh_o___r_gido__acima_de_17_toneladas_",
    name: "0.15398",
    fuelName: "Caminhão - rígido (acima de 17 toneladas)",
    fuelId: "caminh_o___r_gido__acima_de_17_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_17853_caminh_o___r_gido__m_dia_": {
    id: "0_17853_caminh_o___r_gido__m_dia_",
    name: "0.17853",
    fuelName: "Caminhão - rígido (média)",
    fuelId: "caminh_o___r_gido__m_dia_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_11311_caminh_o___articulado__3_5_a_33_toneladas_": {
    id: "0_11311_caminh_o___articulado__3_5_a_33_toneladas_",
    name: "0.11311",
    fuelName: "Caminhão - articulado (3,5 a 33 toneladas)",
    fuelId: "caminh_o___articulado__3_5_a_33_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_07447_caminh_o___articulado__acima_de_33_toneladas_": {
    id: "0_07447_caminh_o___articulado__acima_de_33_toneladas_",
    name: "0.07447",
    fuelName: "Caminhão - articulado (acima de 33 toneladas)",
    fuelId: "caminh_o___articulado__acima_de_33_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_07547_caminh_o___articulado__m_dia_": {
    id: "0_07547_caminh_o___articulado__m_dia_",
    name: "0.07547",
    fuelName: "Caminhão - articulado (média)",
    fuelId: "caminh_o___articulado__m_dia_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_09752_caminh_o___caminh_o__m_dia_": {
    id: "0_09752_caminh_o___caminh_o__m_dia_",
    name: "0.09752",
    fuelName: "Caminhão - caminhão (média)",
    fuelId: "caminh_o___caminh_o__m_dia_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_60195_caminh_o_refrigerado___r_gido__3_5_a_7_5_toneladas_": {
    id: "0_60195_caminh_o_refrigerado___r_gido__3_5_a_7_5_toneladas_",
    name: "0.60195",
    fuelName: "Caminhão refrigerado - rígido (3,5 a 7,5 toneladas)",
    fuelId: "caminh_o_refrigerado___r_gido__3_5_a_7_5_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_45287_caminh_o_refrigerado___r_gido__7_5_a_17_toneladas_": {
    id: "0_45287_caminh_o_refrigerado___r_gido__7_5_a_17_toneladas_",
    name: "0.45287",
    fuelName: "Caminhão refrigerado - rígido (7,5 a 17 toneladas)",
    fuelId: "caminh_o_refrigerado___r_gido__7_5_a_17_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_1833_caminh_o_refrigerado___r_gido__acima_de_17_toneladas_": {
    id: "0_1833_caminh_o_refrigerado___r_gido__acima_de_17_toneladas_",
    name: "0.1833",
    fuelName: "Caminhão refrigerado - rígido (acima de 17 toneladas)",
    fuelId: "caminh_o_refrigerado___r_gido__acima_de_17_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_21254_caminh_o_refrigerado___r_gido__m_dia_": {
    id: "0_21254_caminh_o_refrigerado___r_gido__m_dia_",
    name: "0.21254",
    fuelName: "Caminhão refrigerado - rígido (média)",
    fuelId: "caminh_o_refrigerado___r_gido__m_dia_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_13086_caminh_o_refrigerado___articulado__3_5_a_33_toneladas_": {
    id: "0_13086_caminh_o_refrigerado___articulado__3_5_a_33_toneladas_",
    name: "0.13086",
    fuelName: "Caminhão refrigerado - articulado (3,5 a 33 toneladas)",
    fuelId: "caminh_o_refrigerado___articulado__3_5_a_33_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_08617_caminh_o_refrigerado___articulado__acima_de_33_toneladas_": {
    id: "0_08617_caminh_o_refrigerado___articulado__acima_de_33_toneladas_",
    name: "0.08617",
    fuelName: "Caminhão refrigerado - articulado (acima de 33 toneladas)",
    fuelId: "caminh_o_refrigerado___articulado__acima_de_33_toneladas_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_08732_caminh_o_refrigerado___articulado__m_dia_": {
    id: "0_08732_caminh_o_refrigerado___articulado__m_dia_",
    name: "0.08732",
    fuelName: "Caminhão refrigerado - articulado (média)",
    fuelId: "caminh_o_refrigerado___articulado__m_dia_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_11417_caminh_o_refrigerado___caminh_o__m_dia_": {
    id: "0_11417_caminh_o_refrigerado___caminh_o__m_dia_",
    name: "0.11417",
    fuelName: "Caminhão refrigerado - caminhão (média)",
    fuelId: "caminh_o_refrigerado___caminh_o__m_dia_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "acr_scimo_para_refletir_a_rota_real_dist_ncia_a_rea": {
    id: "acr_scimo_para_refletir_a_rota_real_dist_ncia_a_rea",
    name: "Acréscimo para refletir a rota real",
    fuelName: "Distância aérea",
    fuelId: "dist_ncia_a_rea",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_08_curta_dist_ncia__d___500_km_": {
    id: "0_08_curta_dist_ncia__d___500_km_",
    name: "0.08",
    fuelName: "Curta distância (d ≤ 500 km)",
    fuelId: "curta_dist_ncia__d___500_km_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_08_m_dia_dist_ncia__500___d___3_700_km_": {
    id: "0_08_m_dia_dist_ncia__500___d___3_700_km_",
    name: "0.08",
    fuelName: "Média distância (500 < d ≤ 3.700 km)",
    fuelId: "m_dia_dist_ncia__500___d___3_700_km_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_08_longa_dist_ncia__d___3_700_km_": {
    id: "0_08_longa_dist_ncia__d___3_700_km_",
    name: "0.08",
    fuelName: "Longa distância (d > 3.700 km)",
    fuelId: "longa_dist_ncia__d___3_700_km_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "acr_scimo_para_refletir_a_rota_real_dist_ncia": {
    id: "acr_scimo_para_refletir_a_rota_real_dist_ncia",
    name: "Acréscimo para refletir a rota real",
    fuelName: "Distância",
    fuelId: "dist_ncia",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "emiss_o__g_co2_passageiro_km__ano": {
    id: "emiss_o__g_co2_passageiro_km__ano",
    name: "Emissão (g CO2/passageiro.km)",
    fuelName: "Ano",
    fuelId: "ano",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_1_2006": {
    id: "4_1_2006",
    name: "4.1",
    fuelName: "2006",
    fuelId: "2006",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_1_2007": {
    id: "4_1_2007",
    name: "4.1",
    fuelName: "2007",
    fuelId: "2007",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_1_2008": {
    id: "4_1_2008",
    name: "4.1",
    fuelName: "2008",
    fuelId: "2008",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2_1_2009": {
    id: "2_1_2009",
    name: "2.1",
    fuelName: "2009",
    fuelId: "2009",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_2_2010": {
    id: "4_2_2010",
    name: "4.2",
    fuelName: "2010",
    fuelId: "2010",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2_3_2011": {
    id: "2_3_2011",
    name: "2.3",
    fuelName: "2011",
    fuelId: "2011",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_3_2012": {
    id: "4_3_2012",
    name: "4.3",
    fuelName: "2012",
    fuelId: "2012",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "6_2_2013": {
    id: "6_2_2013",
    name: "6.2",
    fuelName: "2013",
    fuelId: "2013",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "8_4_2014": {
    id: "8_4_2014",
    name: "8.4",
    fuelName: "2014",
    fuelId: "2014",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "7_8_2015": {
    id: "7_8_2015",
    name: "7.8",
    fuelName: "2015",
    fuelId: "2015",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "5_2016": {
    id: "5_2016",
    name: "5",
    fuelName: "2016",
    fuelId: "2016",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "6_1_2017": {
    id: "6_1_2017",
    name: "6.1",
    fuelName: "2017",
    fuelId: "2017",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_7_2018": {
    id: "4_7_2018",
    name: "4.7",
    fuelName: "2018",
    fuelId: "2018",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "4_5_2019": {
    id: "4_5_2019",
    name: "4.5",
    fuelName: "2019",
    fuelId: "2019",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "6_2_2020": {
    id: "6_2_2020",
    name: "6.2",
    fuelName: "2020",
    fuelId: "2020",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "11_5_2021": {
    id: "11_5_2021",
    name: "11.5",
    fuelName: "2021",
    fuelId: "2021",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "3_2022": {
    id: "3_2022",
    name: "3",
    fuelName: "2022",
    fuelId: "2022",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2_7_2023": {
    id: "2_7_2023",
    name: "2.7",
    fuelName: "2023",
    fuelId: "2023",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "3_7_2024": {
    id: "3_7_2024",
    name: "3.7",
    fuelName: "2024",
    fuelId: "2024",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "fe_sin__t_co2___mwh__kwh___p_km": {
    id: "fe_sin__t_co2___mwh__kwh___p_km",
    name: "FE SIN (t CO2 / MWh)",
    fuelName: "kWh / P.km",
    fuelId: "kwh___p_km",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "kg_co2___tku_concession_ria": {
    id: "kg_co2___tku_concession_ria",
    name: "kg CO2 / tku",
    fuelName: "Concessionária",
    fuelId: "concession_ria",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_010199999999999999_m_dia_nacional": {
    id: "0_010199999999999999_m_dia_nacional",
    name: "0.010199999999999999",
    fuelName: "Média nacional",
    fuelId: "m_dia_nacional",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0225_allmn___am_rica_latina_log_stica_malha_norte": {
    id: "0_0225_allmn___am_rica_latina_log_stica_malha_norte",
    name: "0.0225",
    fuelName: "ALLMN - AMÉRICA LATINA LOGÍSTICA MALHA NORTE",
    fuelId: "allmn___am_rica_latina_log_stica_malha_norte",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_026699999999999998_allmo___am_rica_latina_log_stica_malha_oeste": {
    id: "0_026699999999999998_allmo___am_rica_latina_log_stica_malha_oeste",
    name: "0.026699999999999998",
    fuelName: "ALLMO - AMÉRICA LATINA LOGÍSTICA MALHA OESTE",
    fuelId: "allmo___am_rica_latina_log_stica_malha_oeste",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0291_allmp___am_rica_latina_log_stica_malha_paulista": {
    id: "0_0291_allmp___am_rica_latina_log_stica_malha_paulista",
    name: "0.0291",
    fuelName: "ALLMP - AMÉRICA LATINA LOGÍSTICA MALHA PAULISTA",
    fuelId: "allmp___am_rica_latina_log_stica_malha_paulista",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0218_allms___am_rica_latina_logistica_malha_sul": {
    id: "0_0218_allms___am_rica_latina_logistica_malha_sul",
    name: "0.0218",
    fuelName: "ALLMS - AMÉRICA LATINA LOGISTICA MALHA SUL",
    fuelId: "allms___am_rica_latina_logistica_malha_sul",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_004900000000000001_efc___estrada_de_ferro_caraj_s": {
    id: "0_004900000000000001_efc___estrada_de_ferro_caraj_s",
    name: "0.004900000000000001",
    fuelName: "EFC - ESTRADA DE FERRO CARAJÁS",
    fuelId: "efc___estrada_de_ferro_caraj_s",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0077_efvm___estrada_de_ferro_vit_ria_a_minas": {
    id: "0_0077_efvm___estrada_de_ferro_vit_ria_a_minas",
    name: "0.0077",
    fuelName: "EFVM - ESTRADA DE FERRO VITÓRIA A MINAS",
    fuelId: "efvm___estrada_de_ferro_vit_ria_a_minas",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0202_fca___ferrovia_centro_atl_ntica": {
    id: "0_0202_fca___ferrovia_centro_atl_ntica",
    name: "0.0202",
    fuelName: "FCA - FERROVIA CENTRO-ATLÂNTICA",
    fuelId: "fca___ferrovia_centro_atl_ntica",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_026600000000000002_ferroeste___estrada_de_ferro_paran__oeste": {
    id: "0_026600000000000002_ferroeste___estrada_de_ferro_paran__oeste",
    name: "0.026600000000000002",
    fuelName: "FERROESTE - ESTRADA DE FERRO PARANÁ–OESTE",
    fuelId: "ferroeste___estrada_de_ferro_paran__oeste",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0179_ftc___ferrovia_tereza_cristina": {
    id: "0_0179_ftc___ferrovia_tereza_cristina",
    name: "0.0179",
    fuelName: "FTC - FERROVIA TEREZA CRISTINA",
    fuelId: "ftc___ferrovia_tereza_cristina",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0101_fns___ferrovia_norte_sul": {
    id: "0_0101_fns___ferrovia_norte_sul",
    name: "0.0101",
    fuelName: "FNS - FERROVIA NORTE-SUL",
    fuelId: "fns___ferrovia_norte_sul",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_012199999999999999_mrs___mrs_log_stica": {
    id: "0_012199999999999999_mrs___mrs_log_stica",
    name: "0.012199999999999999",
    fuelName: "MRS - MRS LOGÍSTICA",
    fuelId: "mrs___mrs_log_stica",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_0364_tnlsa___transnordestina_log_stica": {
    id: "0_0364_tnlsa___transnordestina_log_stica",
    name: "0.0364",
    fuelName: "TNLSA - TRANSNORDESTINA LOGÍSTICA",
    fuelId: "tnlsa___transnordestina_log_stica",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "fator_de_emiss_o___defra__kg_co2e___passageiro_km__tipo_de_embarca__o": {
    id: "fator_de_emiss_o___defra__kg_co2e___passageiro_km__tipo_de_embarca__o",
    name: "Fator de emissão - DEFRA (kg CO2e / passageiro.km)",
    fuelName: "Tipo de embarcação",
    fuelId: "tipo_de_embarca__o",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_018710813959731544_balsa_de_passageiros": {
    id: "0_018710813959731544_balsa_de_passageiros",
    name: "0.018710813959731544",
    fuelName: "Balsa de passageiros",
    fuelId: "balsa_de_passageiros",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_1293288754362416_balsa_de_ve_culos": {
    id: "0_1293288754362416_balsa_de_ve_culos",
    name: "0.1293288754362416",
    fuelName: "Balsa de veículos",
    fuelId: "balsa_de_ve_culos",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "0_11269808080536912_balsa_h_brida_ve_culos_e_passageiros": {
    id: "0_11269808080536912_balsa_h_brida_ve_culos_e_passageiros",
    name: "0.11269808080536912",
    fuelName: "Balsa híbrida veículos e passageiros",
    fuelId: "balsa_h_brida_ve_culos_e_passageiros",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "subtipo_tipo_de_navio": {
    id: "subtipo_tipo_de_navio",
    name: "Subtipo",
    fuelName: "Tipo de navio",
    fuelId: "tipo_de_navio",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "navio_tanque__petr_leo_bruto__navio_petroleiro": {
    id: "navio_tanque__petr_leo_bruto__navio_petroleiro",
    name: "Navio tanque (petróleo bruto)",
    fuelName: "Navio petroleiro",
    fuelId: "navio_petroleiro",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "navio_graneleiro_navio_cargueiro": {
    id: "navio_graneleiro_navio_cargueiro",
    name: "Navio graneleiro",
    fuelName: "Navio cargueiro",
    fuelId: "navio_cargueiro",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "combust_vel_correspondente_adotado_pelo_ipcc_combust_vel": {
    id: "combust_vel_correspondente_adotado_pelo_ipcc_combust_vel",
    name: "Combustível correspondente adotado pelo IPCC",
    fuelName: "Combustível",
    fuelId: "combust_vel",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "coal_tar_alcatr_o": {
    id: "coal_tar_alcatr_o",
    name: "Coal Tar",
    fuelName: "Alcatrão",
    fuelId: "alcatr_o",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "bitumen_asfaltos": {
    id: "bitumen_asfaltos",
    name: "Bitumen",
    fuelName: "Asfaltos",
    fuelId: "asfaltos",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "coking_coal_carv_o_metal_rgico_importado": {
    id: "coking_coal_carv_o_metal_rgico_importado",
    name: "Coking Coal",
    fuelName: "Carvão Metalúrgico Importado",
    fuelId: "carv_o_metal_rgico_importado",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "coking_coal_carv_o_metal_rgico_nacional": {
    id: "coking_coal_carv_o_metal_rgico_nacional",
    name: "Coking Coal",
    fuelName: "Carvão Metalúrgico Nacional",
    fuelId: "carv_o_metal_rgico_nacional",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_3100_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_3100_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 3100 kcal / kg",
    fuelId: "carv_o_vapor_3100_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_3300_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_3300_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 3300 kcal / kg",
    fuelId: "carv_o_vapor_3300_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_3700_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_3700_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 3700 kcal / kg",
    fuelId: "carv_o_vapor_3700_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_4200_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_4200_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 4200 kcal / kg",
    fuelId: "carv_o_vapor_4200_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_4500_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_4500_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 4500 kcal / kg",
    fuelId: "carv_o_vapor_4500_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_4700_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_4700_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 4700 kcal / kg",
    fuelId: "carv_o_vapor_4700_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_5200_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_5200_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 5200 kcal / kg",
    fuelId: "carv_o_vapor_5200_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_5900_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_5900_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 5900 kcal / kg",
    fuelId: "carv_o_vapor_5900_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_6000_kcal___kg": {
    id: "other_bituminous_coal_carv_o_vapor_6000_kcal___kg",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor 6000 kcal / kg",
    fuelId: "carv_o_vapor_6000_kcal___kg",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_bituminous_coal_carv_o_vapor_sem_especifica__o": {
    id: "other_bituminous_coal_carv_o_vapor_sem_especifica__o",
    name: "Other Bituminous Coal",
    fuelName: "Carvão Vapor sem Especificação",
    fuelId: "carv_o_vapor_sem_especifica__o",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "coke_oven_coke_and_lignite_coke_coque_de_carv_o_mineral": {
    id: "coke_oven_coke_and_lignite_coke_coque_de_carv_o_mineral",
    name: "Coke Oven Coke and Lignite Coke",
    fuelName: "Coque de Carvão Mineral",
    fuelId: "coque_de_carv_o_mineral",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "petroleum_coke_coque_de_petr_leo": {
    id: "petroleum_coke_coque_de_petr_leo",
    name: "Petroleum Coke",
    fuelName: "Coque de Petróleo",
    fuelId: "coque_de_petr_leo",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "ethane_etano": {
    id: "ethane_etano",
    name: "Ethane",
    fuelName: "Etano",
    fuelId: "etano",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "coke_oven_gas_g_s_de_coqueria": {
    id: "coke_oven_gas_g_s_de_coqueria",
    name: "Coke Oven Gas",
    fuelName: "Gás de Coqueria",
    fuelId: "g_s_de_coqueria",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "refinery_gas_g_s_de_refinaria": {
    id: "refinery_gas_g_s_de_refinaria",
    name: "Refinery Gas",
    fuelName: "Gás de Refinaria",
    fuelId: "g_s_de_refinaria",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "liquefied_petroleum_gases_g_s_liquefeito_de_petr_leo__glp_": {
    id: "liquefied_petroleum_gases_g_s_liquefeito_de_petr_leo__glp_",
    name: "Liquefied Petroleum Gases",
    fuelName: "Gás Liquefeito de Petróleo (GLP)",
    fuelId: "g_s_liquefeito_de_petr_leo__glp_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "natural_gas_g_s_natural_seco": {
    id: "natural_gas_g_s_natural_seco",
    name: "Natural Gas",
    fuelName: "Gás Natural Seco",
    fuelId: "g_s_natural_seco",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "natural_gas_g_s_natural__mido": {
    id: "natural_gas_g_s_natural__mido",
    name: "Natural Gas",
    fuelName: "Gás Natural Úmido",
    fuelId: "g_s_natural__mido",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "motor_gasoline_gasolina_automotiva__pura_": {
    id: "motor_gasoline_gasolina_automotiva__pura_",
    name: "Motor Gasoline",
    fuelName: "Gasolina Automotiva (pura)",
    fuelId: "gasolina_automotiva__pura_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "natural_gas_liquids_l_quidos_de_g_s_natural__lgn_": {
    id: "natural_gas_liquids_l_quidos_de_g_s_natural__lgn_",
    name: "Natural Gas Liquids",
    fuelName: "Líquidos de Gás Natural (LGN)",
    fuelId: "l_quidos_de_g_s_natural__lgn_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "lubricants_lubrificantes": {
    id: "lubricants_lubrificantes",
    name: "Lubricants",
    fuelName: "Lubrificantes",
    fuelId: "lubrificantes",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "naphtha_nafta": {
    id: "naphtha_nafta",
    name: "Naphtha",
    fuelName: "Nafta",
    fuelId: "nafta",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "residual_fuel_oil__leo_combust_vel": {
    id: "residual_fuel_oil__leo_combust_vel",
    name: "Residual Fuel Oil",
    fuelName: "Óleo Combustível",
    fuelId: "_leo_combust_vel",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "shale_oil__leo_de_xisto": {
    id: "shale_oil__leo_de_xisto",
    name: "Shale Oil",
    fuelName: "Óleo de Xisto",
    fuelId: "_leo_de_xisto",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "diesel_oil__leo_diesel__puro_": {
    id: "diesel_oil__leo_diesel__puro_",
    name: "Diesel Oil",
    fuelName: "Óleo Diesel (puro)",
    fuelId: "_leo_diesel__puro_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "waste_oils__leos_residuais": {
    id: "waste_oils__leos_residuais",
    name: "Waste Oils",
    fuelName: "Óleos Residuais",
    fuelId: "_leos_residuais",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_petroleum_products_outros_produtos_de_petr_leo": {
    id: "other_petroleum_products_outros_produtos_de_petr_leo",
    name: "Other Petroleum Products",
    fuelName: "Outros Produtos de Petróleo",
    fuelId: "outros_produtos_de_petr_leo",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "paraffin_waxes_parafina": {
    id: "paraffin_waxes_parafina",
    name: "Paraffin Waxes",
    fuelName: "Parafina",
    fuelId: "parafina",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "crude_oil_petr_leo_bruto": {
    id: "crude_oil_petr_leo_bruto",
    name: "Crude Oil",
    fuelName: "Petróleo Bruto",
    fuelId: "petr_leo_bruto",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_kerosene_querosene_iluminante": {
    id: "other_kerosene_querosene_iluminante",
    name: "Other Kerosene",
    fuelName: "Querosene Iluminante",
    fuelId: "querosene_iluminante",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "industrial_wastes_res_duos_industriais": {
    id: "industrial_wastes_res_duos_industriais",
    name: "Industrial Wastes",
    fuelName: "Resíduos Industriais",
    fuelId: "res_duos_industriais",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "municipal_wastes__non_biomass_fraction__res_duos_municipais__fra__o_n_o_biomassa_": {
    id: "municipal_wastes__non_biomass_fraction__res_duos_municipais__fra__o_n_o_biomassa_",
    name: "Municipal Wastes (non-biomass fraction)",
    fuelName: "Resíduos Municipais (fração não-biomassa)",
    fuelId: "res_duos_municipais__fra__o_n_o_biomassa_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_petroleum_products_solventes": {
    id: "other_petroleum_products_solventes",
    name: "Other Petroleum Products",
    fuelName: "Solventes",
    fuelId: "solventes",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "peat_turfa": {
    id: "peat_turfa",
    name: "Peat",
    fuelName: "Turfa",
    fuelId: "turfa",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "oil_shale_and_tar_sands_xisto_betuminoso_e_areias_betuminosas": {
    id: "oil_shale_and_tar_sands_xisto_betuminoso_e_areias_betuminosas",
    name: "Oil Shale and Tar Sands",
    fuelName: "Xisto Betuminoso e Areias Betuminosas",
    fuelId: "xisto_betuminoso_e_areias_betuminosas",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "combust_vel_mais_pr_ximo_utilizado_pelo_ipcc_combust_vel": {
    id: "combust_vel_mais_pr_ximo_utilizado_pelo_ipcc_combust_vel",
    name: "Combustível mais próximo utilizado pelo IPCC",
    fuelName: "Combustível",
    fuelId: "combust_vel",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_liquid_biofuels_etanol_hidratado": {
    id: "other_liquid_biofuels_etanol_hidratado",
    name: "Other Liquid Biofuels",
    fuelName: "Etanol Hidratado",
    fuelId: "etanol_hidratado",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_primary_solid_biomass_baga_o_de_cana": {
    id: "other_primary_solid_biomass_baga_o_de_cana",
    name: "Other Primary Solid Biomass",
    fuelName: "Bagaço de Cana",
    fuelId: "baga_o_de_cana",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "biodiesels_biodiesel__b100_": {
    id: "biodiesels_biodiesel__b100_",
    name: "Biodiesels",
    fuelName: "Biodiesel (B100)",
    fuelId: "biodiesel__b100_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_biogas_biog_s__outros_": {
    id: "other_biogas_biog_s__outros_",
    name: "Other biogas",
    fuelName: "Biogás (outros)",
    fuelId: "biog_s__outros_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "landfill_biogas_biog_s_de_aterro": {
    id: "landfill_biogas_biog_s_de_aterro",
    name: "Landfill biogas",
    fuelName: "Biogás de aterro",
    fuelId: "biog_s_de_aterro",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_biogas_biometano": {
    id: "other_biogas_biometano",
    name: "Other biogas",
    fuelName: "Biometano",
    fuelId: "biometano",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_liquid_biofuels_caldo_de_cana": {
    id: "other_liquid_biofuels_caldo_de_cana",
    name: "Other Liquid Biofuels",
    fuelName: "Caldo de Cana",
    fuelId: "caldo_de_cana",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "charcoal_carv_o_vegetal": {
    id: "charcoal_carv_o_vegetal",
    name: "Charcoal",
    fuelName: "Carvão Vegetal",
    fuelId: "carv_o_vegetal",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "wood___wood_waste_lenha_comercial": {
    id: "wood___wood_waste_lenha_comercial",
    name: "Wood / Wood Waste",
    fuelName: "Lenha Comercial",
    fuelId: "lenha_comercial",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "sulphite_lyes__black_liquor__licor_negro__lix_via_": {
    id: "sulphite_lyes__black_liquor__licor_negro__lix_via_",
    name: "Sulphite lyes (Black Liquor)",
    fuelName: "Licor Negro (Lixívia)",
    fuelId: "licor_negro__lix_via_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_liquid_biofuels_mela_o": {
    id: "other_liquid_biofuels_mela_o",
    name: "Other Liquid Biofuels",
    fuelName: "Melaço",
    fuelId: "mela_o",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "municipal_wastes__biomass_fraction__res_duos_municipais__fra__o_biomassa_": {
    id: "municipal_wastes__biomass_fraction__res_duos_municipais__fra__o_biomassa_",
    name: "Municipal Wastes (biomass fraction)",
    fuelName: "Resíduos Municipais (fração biomassa)",
    fuelId: "res_duos_municipais__fra__o_biomassa_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "other_primary_solid_biomass_res_duos_vegetais": {
    id: "other_primary_solid_biomass_res_duos_vegetais",
    name: "Other Primary Solid Biomass",
    fuelName: "Resíduos Vegetais",
    fuelId: "res_duos_vegetais",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "fam_lia___tipo_g_s": {
    id: "fam_lia___tipo_g_s",
    name: "Família / Tipo",
    fuelName: "Gás",
    fuelId: "g_s",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "__di_xido_de_carbono__co2_": {
    id: "__di_xido_de_carbono__co2_",
    name: "-",
    fuelName: "Dióxido de carbono (CO2)",
    fuelId: "di_xido_de_carbono__co2_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "__metano__ch4_": {
    id: "__metano__ch4_",
    name: "-",
    fuelName: "Metano (CH4)",
    fuelId: "metano__ch4_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "___xido_nitroso__n2o_": {
    id: "___xido_nitroso__n2o_",
    name: "-",
    fuelName: "Óxido nitroso (N2O)",
    fuelId: "_xido_nitroso__n2o_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "hfc_hfc_23": {
    id: "hfc_hfc_23",
    name: "HFC",
    fuelName: "HFC-23",
    fuelId: "hfc_23",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "__hexafluoreto_de_enxofre__sf6_": {
    id: "__hexafluoreto_de_enxofre__sf6_",
    name: "-",
    fuelName: "Hexafluoreto de enxofre (SF6)",
    fuelId: "hexafluoreto_de_enxofre__sf6_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "__trifluoreto_de_nitrog_nio__nf3_": {
    id: "__trifluoreto_de_nitrog_nio__nf3_",
    name: "-",
    fuelName: "Trifluoreto de nitrogênio (NF3)",
    fuelId: "trifluoreto_de_nitrog_nio__nf3_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "pfc_pfc_14": {
    id: "pfc_pfc_14",
    name: "PFC",
    fuelName: "PFC-14",
    fuelId: "pfc_14",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "composto_r_400": {
    id: "composto_r_400",
    name: "Composto",
    fuelName: "R-400",
    fuelId: "r_400",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "cfc_cfc_11": {
    id: "cfc_cfc_11",
    name: "CFC",
    fuelName: "CFC-11",
    fuelId: "cfc_11",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "hcfc_hcfc_21": {
    id: "hcfc_hcfc_21",
    name: "HCFC",
    fuelName: "HCFC-21",
    fuelId: "hcfc_21",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "refer_ncia_bibliogr_fica_cita__o_na_ferramenta": {
    id: "refer_ncia_bibliogr_fica_cita__o_na_ferramenta",
    name: "Referência bibliográfica",
    fuelName: "Citação na ferramenta",
    fuelId: "cita__o_na_ferramenta",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "ag_ncia_nacional_do_petr_leo__g_s_natural_e_biocombust_veis_anp_2012": {
    id: "ag_ncia_nacional_do_petr_leo__g_s_natural_e_biocombust_veis_anp_2012",
    name: "Agência Nacional do Petróleo, Gás Natural e Biocombustíveis",
    fuelName: "ANP 2012",
    fuelId: "anp_2012",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "ag_ncia_nacional_de_transportes_terrestres_antt_2012": {
    id: "ag_ncia_nacional_de_transportes_terrestres_antt_2012",
    name: "Agência Nacional de Transportes Terrestres",
    fuelName: "ANTT 2012",
    fuelId: "antt_2012",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "designation_and_safety_classification_of_refrigerants_ashrae_2019": {
    id: "designation_and_safety_classification_of_refrigerants_ashrae_2019",
    name: "Designation and Safety Classification of Refrigerants",
    fuelName: "ASHRAE 2019",
    fuelId: "ashrae_2019",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "minist_rio_de_minas_e_energia__balan_o_energ_tico_nacional_2024__ano_base_2023___ben_2024": {
    id: "minist_rio_de_minas_e_energia__balan_o_energ_tico_nacional_2024__ano_base_2023___ben_2024",
    name: "Ministério de Minas e Energia. Balanço Energético Nacional 2024 (ano base 2023).",
    fuelName: "BEN 2024",
    fuelId: "ben_2024",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "companhia_ambiental_do_estado_de_s_o_paulo___cetesb__emiss_es_veiculares_no_estado_de_s_o_paulo_2017__cetesb_2017": {
    id: "companhia_ambiental_do_estado_de_s_o_paulo___cetesb__emiss_es_veiculares_no_estado_de_s_o_paulo_2017__cetesb_2017",
    name: "Companhia Ambiental do Estado de São Paulo - CETESB. Emissões veiculares no estado de São Paulo 2017.",
    fuelName: "CETESB 2017",
    fuelId: "cetesb_2017",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "defra___uk_government_conversion_factors_for_company_reporting__ano__2024__defra_2024": {
    id: "defra___uk_government_conversion_factors_for_company_reporting__ano__2024__defra_2024",
    name: "DEFRA - UK Government conversion factors for Company Reporting. Ano: 2024.",
    fuelName: "DEFRA 2024",
    fuelId: "defra_2024",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2006_ipcc_guidelines_for_national_greenhouse_gas_inventories__ipcc_2006": {
    id: "2006_ipcc_guidelines_for_national_greenhouse_gas_inventories__ipcc_2006",
    name: "2006 IPCC Guidelines for National Greenhouse Gas Inventories:",
    fuelName: "IPCC 2006",
    fuelId: "ipcc_2006",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "ipcc_fifth_assessment_report__climate_change_2013__ar5__ipcc_2013": {
    id: "ipcc_fifth_assessment_report__climate_change_2013__ar5__ipcc_2013",
    name: "IPCC Fifth Assessment Report: Climate Change 2013 (AR5)",
    fuelName: "IPCC 2013",
    fuelId: "ipcc_2013",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "2019_refinement_to_the_2006_ipcc_guidelines_for_national_greenhouse_gas_inventories_ipcc_2019": {
    id: "2019_refinement_to_the_2006_ipcc_guidelines_for_national_greenhouse_gas_inventories_ipcc_2019",
    name: "2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories",
    fuelName: "IPCC 2019",
    fuelId: "ipcc_2019",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "minist_rio_da_ci_ncia__tecnologia__comunica__o_e_inova__o__terceira_comunica__o_nacional_do_brasil___conven__o_quadro_das_na__es_unidas_sobre_mudan_a_do_clima__bras_lia__mctic__2016__mctic_2016": {
    id: "minist_rio_da_ci_ncia__tecnologia__comunica__o_e_inova__o__terceira_comunica__o_nacional_do_brasil___conven__o_quadro_das_na__es_unidas_sobre_mudan_a_do_clima__bras_lia__mctic__2016__mctic_2016",
    name: "Ministério da Ciência, Tecnologia, Comunicação e Inovação. Terceira Comunicação Nacional do Brasil à Convenção-Quadro das Nações Unidas sobre Mudança do Clima. Brasília: MCTIC, 2016.",
    fuelName: "MCTIC 2016",
    fuelId: "mctic_2016",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "minist_rio_do_meio_ambiente__1__invent_rio_nacional_de_emiss_es_atmosf_ricas_por_ve_culos_automotores_rodovi_rios__brasil__2011__mma_2011": {
    id: "minist_rio_do_meio_ambiente__1__invent_rio_nacional_de_emiss_es_atmosf_ricas_por_ve_culos_automotores_rodovi_rios__brasil__2011__mma_2011",
    name: "Ministério do Meio Ambiente. 1º Inventário Nacional de Emissões Atmosféricas por Veículos Automotores Rodoviários. Brasil: 2011.",
    fuelName: "MMA 2011",
    fuelId: "mma_2011",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "secretaria_de_energia_do_estado_de_s_o_paulo__balan_o_energ_tico_do_estado_de_s_o_paulo___2010__s_o_paulo__2011__seesp_2011": {
    id: "secretaria_de_energia_do_estado_de_s_o_paulo__balan_o_energ_tico_do_estado_de_s_o_paulo___2010__s_o_paulo__2011__seesp_2011",
    name: "Secretaria de Energia do Estado de São Paulo. Balanço energético do Estado de São Paulo - 2010. São Paulo: 2011.",
    fuelName: "SEESP 2011",
    fuelId: "seesp_2011",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "united_state_environmental_protection_agency___us_epa_usepa_2007": {
    id: "united_state_environmental_protection_agency___us_epa_usepa_2007",
    name: "United State Environmental Protection Agency - US EPA",
    fuelName: "USEPA 2007",
    fuelId: "usepa_2007",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "minist_rio_das_cidades__c_digo_de_tr_nsito_brasileiro_e_legisla__o_complementar_em_vigor__mc_2008": {
    id: "minist_rio_das_cidades__c_digo_de_tr_nsito_brasileiro_e_legisla__o_complementar_em_vigor__mc_2008",
    name: "Ministério das Cidades. Código de Trânsito Brasileiro e Legislação Complementar em Vigor.",
    fuelName: "MC 2008",
    fuelId: "mc_2008",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "resolu__o_conama_n__15__de_13_de_dezembro_de_1995__conama_1995": {
    id: "resolu__o_conama_n__15__de_13_de_dezembro_de_1995__conama_1995",
    name: "RESOLUÇÃO CONAMA nº 15, de 13 de dezembro de 1995.",
    fuelName: "CONAMA 1995",
    fuelId: "conama_1995",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "resolu__o_n__445___25_de_junho_de_2013__contran_2013": {
    id: "resolu__o_n__445___25_de_junho_de_2013__contran_2013",
    name: "RESOLUÇÃO Nº 445 , 25 DE JUNHO DE 2013.",
    fuelName: "CONTRAN 2013",
    fuelId: "contran_2013",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "minist_rio_do_meio_ambiente__invent_rio_nacional_de_emiss_es_atmosf_ricas_por_ve_culos_automotores_rodovi_rios_2013__ano_base_2012__relat_rio_final__mma_2014": {
    id: "minist_rio_do_meio_ambiente__invent_rio_nacional_de_emiss_es_atmosf_ricas_por_ve_culos_automotores_rodovi_rios_2013__ano_base_2012__relat_rio_final__mma_2014",
    name: "Ministério do Meio Ambiente. Inventário Nacional de Emissões Atmosféricas por Veículos Automotores Rodoviários 2013. Ano-base 2012. Relatório Final.",
    fuelName: "MMA 2014",
    fuelId: "mma_2014",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "normais_climatol_gicas_do_brasil_1981_2010_inmet_2018": {
    id: "normais_climatol_gicas_do_brasil_1981_2010_inmet_2018",
    name: "Normais Climatológicas do Brasil 1981-2010",
    fuelName: "INMET 2018",
    fuelId: "inmet_2018",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "anp__resolu__o_no_8__de_30_de_janeiro_de_2015___dou___imprensa_nacional__2_fev__2015__anp_2015": {
    id: "anp__resolu__o_no_8__de_30_de_janeiro_de_2015___dou___imprensa_nacional__2_fev__2015__anp_2015",
    name: "ANP. RESOLUÇÃO No 8, DE 30 DE JANEIRO DE 2015 - DOU - Imprensa Nacional, 2 fev. 2015.",
    fuelName: "ANP 2015",
    fuelId: "anp_2015",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "companhia_ambiental_do_estado_de_s_o_paulo___cetesb__relat_rios_de_emiss_es_veiculares_no_estado_s_o_paulo__2023_cetesb_2023": {
    id: "companhia_ambiental_do_estado_de_s_o_paulo___cetesb__relat_rios_de_emiss_es_veiculares_no_estado_s_o_paulo__2023_cetesb_2023",
    name: "Companhia Ambiental do Estado de São Paulo - CETESB. Relatórios de Emissões Veiculares no Estado São Paulo, 2023",
    fuelName: "CETESB 2023",
    fuelId: "cetesb_2023",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
  "estimating_20_year_land_use_change_and_derived_co2_emissions_associated_to_crops__pasture_and_forestry_in_brazil_and_each_of_its_27_states__novaes__et_al___2017_": {
    id: "estimating_20_year_land_use_change_and_derived_co2_emissions_associated_to_crops__pasture_and_forestry_in_brazil_and_each_of_its_27_states__novaes__et_al___2017_",
    name: "Estimating 20-year land use change and derived CO2 emissions associated to crops, pasture and forestry in Brazil and each of its 27 states.",
    fuelName: "NOVAES, et al. (2017)",
    fuelId: "novaes__et_al___2017_",
    mode: "road",
    ef_ch4_kg_l: 0,
    ef_n2o_kg_l: 0
  },
};
