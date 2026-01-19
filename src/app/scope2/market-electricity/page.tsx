"use client";

import { MarketElectricityForm } from "@/components/forms/MarketElectricityForm";

export default function Scope2MarketElectricityPage() {
    return (
        <div className="container mx-auto py-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Eletricidade (Escolha de Compra)</h2>
            <p className="text-muted-foreground mb-8">
                Cálculo de emissões de eletricidade adquirida pela abordagem baseada na escolha de compra (Market-based).
                Insira as fontes específicas rastreáveis na Tabela 1 e a energia não rastreada na Tabela 2.
            </p>
            <MarketElectricityForm />
        </div>
    );
}
