import { EffluentsForm } from "@/components/forms/EffluentsForm";

export default function EffluentsPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Efluentes Líquidos (Escopo 1.8)</h1>
            <EffluentsForm />
        </div>
    );
}
