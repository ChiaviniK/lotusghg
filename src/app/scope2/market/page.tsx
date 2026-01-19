"use client";

import { ThermalEnergyForm } from "@/components/forms/ThermalEnergyForm";

export default function Scope2MarketPage() {
    return (
        <div className="container mx-auto py-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Escolha de Compra (Energia Térmica)</h2>
            <p className="text-muted-foreground mb-8">
                Cálculo de emissões pelo consumo de energia térmica (vapor) comprada (Abordagem de Escolha de Compra / Market-based).
                Insira os dados da Tabela 1 e verifique os resultados na Tabela 3.
            </p>
            <ThermalEnergyForm />
        </div>
    );
}
