import { Scope3DownstreamForm } from "@/components/forms/Scope3DownstreamForm";
import { Separator } from "@/components/ui/separator";

export default function Scope3DownstreamPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Transporte e Distribuição (Downstream)</h3>
                <p className="text-sm text-muted-foreground">
                    Cálculo de emissões do transporte de produtos vendidos em veículos e instalações não operados pela organização.
                </p>
            </div>
            <Separator />
            <Scope3DownstreamForm />
        </div>
    );
}
