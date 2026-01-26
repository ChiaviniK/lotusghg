"use client";

import { useEmissions } from "@/contexts/EmissionsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2 } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrganizationsPage() {
    const { organizations, selectOrganization, organization: currentOrg } = useEmissions();
    const [isOpen, setIsOpen] = useState(false);

    // New Org Form State
    const [newOrgName, setNewOrgName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName })
            });

            if (res.ok) {
                // Reload page to refresh list (or context could handle it)
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Suas Organizações</h2>
                    <p className="text-muted-foreground">Gerencie as empresas e inventários.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nova Empresa
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Organização</DialogTitle>
                            <DialogDescription>
                                Cadastre uma nova empresa para gerenciar suas emissões.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Empresa</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Minha Indústria Ltda"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Criando..." : "Criar Organização"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                    <Card
                        key={org.id}
                        className={`cursor-pointer hover:border-primary transition ${currentOrg?.id === org.id ? 'border-primary ring-1 ring-primary' : ''}`}
                        onClick={() => selectOrganization(org.id)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {org.name}
                            </CardTitle>
                            <Building2 className={`h-4 w-4 ${currentOrg?.id === org.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mt-2">
                                {currentOrg?.id === org.id ? 'Selecionada Atualmente' : 'Clique para selecionar'}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
