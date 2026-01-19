import { LandUseForm } from "@/components/forms/LandUseForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LandUsePage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Menu
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Mudança no Uso do Solo</h1>
                <p className="text-muted-foreground">
                    Cálculo de emissões devido a mudanças no uso da terra (ex: Desmatamento, Conversão de Pastagem) e relato de outras ferramentas.
                </p>
            </div>

            <LandUseForm />
        </div>
    );
}
