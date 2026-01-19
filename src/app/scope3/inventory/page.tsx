"use client";

import { Scope3InventoryForm } from "@/components/forms/Scope3InventoryForm";

export default function Scope3InventoryPage() {
    return (
        <div className="container mx-auto py-10 pb-24">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Escopo 3: Inventário Geral (Categorias 1-15)</h2>
            <p className="text-muted-foreground mb-8">
                Esta aba consolida as emissões de todas as 15 categorias de Escopo 3.
                Utilize as abas específicas do menu lateral para calcular Transporte, Resíduos, etc., e reporte os totais finais aqui se necessário.
            </p>
            <Scope3InventoryForm />
        </div>
    );
}
