"use client";

import { UpstreamTransportForm } from "@/components/forms/UpstreamTransportForm";

export default function UpstreamTransportPage() {
    return (
        <div className="container mx-auto py-10 pb-24">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Transporte e Distribuição (Upstream)</h2>
            <p className="text-muted-foreground mb-8">
                Calcule as emissões da Categoria 4 (Transporte de produtos comprados, logística de entrada/saída terceirizada).
            </p>
            <UpstreamTransportForm />
        </div>
    );
}
