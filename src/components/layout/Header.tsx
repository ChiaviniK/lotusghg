"use client";

import { useEmissions } from "@/contexts/EmissionsContext";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

export function Header() {
    const { organization, setShowOrgSettings } = useEmissions();

    return (
        <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                    Organização: <strong>{organization?.name || "Não definida"}</strong>
                </span>
                <span className="mx-1">|</span>
                <span>
                    Ano: <strong>{organization?.inventoryYear || "----"}</strong>
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2"
                    onClick={() => setShowOrgSettings(true)}
                    title="Editar Informações da Organização"
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {organization?.responsibleName
                        ? organization.responsibleName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        : "JD"}
                </div>
            </div>
        </header>
    );
}
