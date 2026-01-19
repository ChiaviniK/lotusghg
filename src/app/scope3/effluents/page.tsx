import { Scope3EffluentsForm } from "@/components/forms/Scope3EffluentsForm";

export default function Scope3EffluentsPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Efluentes Líquidos (Escopo 3)</h1>
            <p className="mb-8 text-muted-foreground">
                Cálculo de emissões do tratamento e disposição final de efluentes gerados na operação (Category 5).
            </p>
            <Scope3EffluentsForm />
        </div>
    );
}
