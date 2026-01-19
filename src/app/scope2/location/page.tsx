"use client";

import { LocationBasedForm } from "@/components/forms/LocationBasedForm";

export default function Scope2LocationPage() {
    return (
        <div className="container mx-auto py-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Escopo 2: Energia Elétrica (Localização)</h2>
            <p className="text-muted-foreground mb-8">
                Cálculo de emissões indiretas pelo consumo de energia elétrica da rede (SIN), veículos elétricos (não abastecidos internamente) ou sistemas isolados.
            </p>
            <LocationBasedForm />
        </div>
    );
}
