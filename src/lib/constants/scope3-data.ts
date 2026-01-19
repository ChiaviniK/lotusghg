
export const SCOPE3_CATEGORIES = [
    { id: 'cat1', label: 'Categoria 1: Bens e serviços comprados', group: '1-4' },
    { id: 'cat2', label: 'Categoria 2: Bens de capital', group: '1-4' },
    { id: 'cat3', label: 'Categoria 3: Atividades relacionadas com combustível e energia (não Escopo 1/2)', group: '1-4' },
    { id: 'cat4', label: 'Categoria 4: Transporte e distribuição (upstream)', group: '1-4' },
    { id: 'cat5', label: 'Categoria 5: Resíduos gerados nas operações', group: '5-8' },
    { id: 'cat6', label: 'Categoria 6: Viagens a negócios', group: '5-8' },
    { id: 'cat7', label: 'Categoria 7: Emissões casa-trabalho', group: '5-8' },
    { id: 'cat8', label: 'Categoria 8: Bens arrendados (upstream)', group: '5-8' },
    { id: 'cat9', label: 'Categoria 9: Transporte e distribuição (downstream)', group: '9-12' },
    { id: 'cat10', label: 'Categoria 10: Processamento de produtos vendidos', group: '9-12' },
    { id: 'cat11', label: 'Categoria 11: Uso de bens e serviços vendidos', group: '9-12' },
    { id: 'cat12', label: 'Categoria 12: Tratamento de fim de vida dos produtos vendidos', group: '9-12' },
    { id: 'cat13', label: 'Categoria 13: Bens arrendados (downstream)', group: '13-Other' },
    { id: 'cat14', label: 'Categoria 14: Franquias', group: '13-Other' },
    { id: 'cat15', label: 'Categoria 15: Investimentos', group: '13-Other' },
    { id: 'other', label: 'Outras emissões de Escopo 3', group: '13-Other' },
];

export const GHG_GASES = [
    { id: 'co2', label: 'CO2', gwp: 1 },
    { id: 'ch4', label: 'CH4', gwp: 28 }, // AR5
    { id: 'n2o', label: 'N2O', gwp: 265 }, // AR5
    // HFCs (Sample GWPs from AR5)
    { id: 'hfc23', label: 'HFC-23', gwp: 12400 },
    { id: 'hfc32', label: 'HFC-32', gwp: 677 },
    { id: 'hfc41', label: 'HFC-41', gwp: 116 }, // Approximate/Standard check needed if critical, using AR5 values where common
    { id: 'hfc125', label: 'HFC-125', gwp: 3170 },
    { id: 'hfc134', label: 'HFC-134', gwp: 1120 },
    { id: 'hfc134a', label: 'HFC-134a', gwp: 1300 },
    { id: 'hfc143', label: 'HFC-143', gwp: 328 },
    { id: 'hfc143a', label: 'HFC-143a', gwp: 4800 },
    { id: 'hfc152', label: 'HFC-152', gwp: 16 },
    { id: 'hfc152a', label: 'HFC-152a', gwp: 138 },
    { id: 'hfc161', label: 'HFC-161', gwp: 10 }, // Low GWP
    { id: 'hfc227ea', label: 'HFC-227ea', gwp: 3350 },
    { id: 'hfc236cb', label: 'HFC-236cb', gwp: 1210 },
    { id: 'hfc236ea', label: 'HFC-236ea', gwp: 1330 },
    { id: 'hfc236fa', label: 'HFC-236fa', gwp: 8060 },
    { id: 'hfc245ca', label: 'HFC-245ca', gwp: 560 },
    { id: 'hfc245fa', label: 'HFC-245fa', gwp: 858 },
    { id: 'hfc365mfc', label: 'HFC-365mfc', gwp: 804 },
    { id: 'hfc4310mee', label: 'HFC-43-10mee', gwp: 1650 },
    // PFCs
    { id: 'pfc14', label: 'PFC-14', gwp: 6630 },
    { id: 'pfc116', label: 'PFC-116', gwp: 11100 },
    { id: 'pfc218', label: 'PFC-218', gwp: 8900 },
    { id: 'pfc318', label: 'PFC-318', gwp: 9540 },
    { id: 'pfc3110', label: 'PFC-3-1-10', gwp: 9200 },
    { id: 'pfc4112', label: 'PFC-4-1-12', gwp: 9500 }, // Approx
    { id: 'pfc5114', label: 'PFC-5-1-14', gwp: 8550 }, // Approx
    { id: 'pfc9118', label: 'PFC-9-1-18', gwp: 8300 }, // Approx
    // Others
    { id: 'sf6', label: 'SF6', gwp: 23500 },
    { id: 'nf3', label: 'NF3', gwp: 16100 },
    { id: 'other_gwp', label: 'Outros GEE', gwp: 1 }, // Default 1, user must input CO2e directly
];

