import { Scope3WasteForm } from "@/components/forms/Scope3WasteForm";

export default function Scope3WastePage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Resíduos Sólidos da Operação (Escopo 3)</h1>
            <p className="mb-8 text-muted-foreground">
                Cálculo de emissões de GEE para tratamento de resíduos sólidos (aterro, compostagem, incineração).
            </p>
            <Scope3WasteForm />
        </div>
    );
}
