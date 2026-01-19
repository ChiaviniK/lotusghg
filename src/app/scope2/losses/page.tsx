"use client";

import { TdLossesForm } from "@/components/forms/TdLossesForm";

export default function Scope2LossesPage() {
    return (
        <div className="container mx-auto py-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">2.2 Perdas T&D (Localização)</h2>
            <p className="text-muted-foreground mb-8">
                Cálculo de emissões indiretas devido a perdas técnicas na transmissão e distribuição de energia elétrica comprada.
                Esta categoria contabiliza as emissões "rio acima" da eletricidade perdida na rede antes de chegar à unidade consumidora.
            </p>
            <TdLossesForm />
        </div>
    );
}
