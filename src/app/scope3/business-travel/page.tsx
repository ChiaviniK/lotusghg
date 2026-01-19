
import { Scope3BusinessTravelForm } from "@/components/forms/Scope3BusinessTravelForm";

export default function Scope3BusinessTravelPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Viagens a Negócios (Escopo 3)</h1>
            <p className="text-muted-foreground mb-8">
                Inventário de emissões categoria 6 do GHG Protocol (Viagens a Negócios).
            </p>
            <Scope3BusinessTravelForm />
        </div>
    );
}
