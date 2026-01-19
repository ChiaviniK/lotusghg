import { WasteForm } from "@/components/forms/WasteForm";

export default function WastePage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Gestão de Resíduos Sólidos</h1>
            <WasteForm />
        </div>
    );
}
