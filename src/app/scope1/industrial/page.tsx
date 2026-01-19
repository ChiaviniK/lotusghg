import { IndustrialProcessesForm } from "@/components/forms/IndustrialProcessesForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function IndustrialProcessesPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Menu
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Processos Industriais</h1>
                <p className="text-muted-foreground">
                    Cálculo de emissões provenientes de processos industriais (transformação física ou química de materiais).
                </p>
            </div>

            <IndustrialProcessesForm />
        </div>
    );
}
