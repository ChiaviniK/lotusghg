"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Save } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEmissions } from "@/contexts/EmissionsContext";

const orgSchema = z.object({
    name: z.string().min(2, "Nome da organização é obrigatório"),
    address: z.string().min(5, "Endereço é obrigatório"),
    inventoryYear: z.string().regex(/^\d{4}$/, "Ano deve ter 4 dígitos"),
    responsibleName: z.string().min(3, "Nome do responsável é obrigatório"),
    responsiblePhone: z.string().min(8, "Telefone inválido"),
    fillingDate: z.string().min(1, "Data é obrigatória"),
    // Intensity Metrics
    employees: z.coerce.number().min(0).optional(),
    revenue: z.coerce.number().min(0).optional(),
    productionVolume: z.coerce.number().min(0).optional(),
    productionUnit: z.string().optional(),
});



export function OrganizationInfoDialog() {
    const { organization, updateOrganization, showOrgSettings, setShowOrgSettings } = useEmissions();

    // Controlled by both local open (for initial check) and context (for manual trigger)
    // Actually simpler: just rely on context for manual, and internal logic for auto-open
    // But Dialog component takes 'open' prop.
    // Let's rely on internal state 'open', but sync it with context changes.

    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof orgSchema>>({
        resolver: zodResolver(orgSchema),
        defaultValues: {
            name: "",
            address: "",
            inventoryYear: new Date().getFullYear().toString(),
            responsibleName: "",
            responsiblePhone: "",
            fillingDate: new Date().toISOString().split("T")[0],
            employees: 0,
            revenue: 0,
            productionVolume: 0,
            productionUnit: "",
        },
    });

    // Sync with context trigger
    useEffect(() => {
        if (showOrgSettings) {
            setOpen(true);
        }
    }, [showOrgSettings]);

    // Auto-open if no organization data exists (only once on mount ideally, but here reactive)
    useEffect(() => {
        if (!organization) {
            setOpen(true);
        } else {
            form.reset({
                name: organization.name || "",
                address: organization.address || "",
                inventoryYear: organization.inventoryYear || new Date().getFullYear().toString(),
                responsibleName: organization.responsibleName || "",
                responsiblePhone: organization.responsiblePhone || "",
                fillingDate: organization.fillingDate || new Date().toISOString().split("T")[0],
                employees: organization.employees || 0,
                revenue: organization.revenue || 0,
                productionVolume: organization.productionVolume || 0,
                productionUnit: organization.productionUnit || "",
            });
        }
    }, [organization, form]);

    function onOpenChange(isOpen: boolean) {
        setOpen(isOpen);
        if (!isOpen) {
            setShowOrgSettings(false); // Reset context trigger when closed
        }
    }

    function onSubmit(data: z.infer<typeof orgSchema>) {
        if (organization) {
            updateOrganization({ ...organization, ...data });
        }
        setOpen(false);
        setShowOrgSettings(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Dados da Organização</DialogTitle>
                    <DialogDescription>
                        Por favor, forneça as informações da organização para o relatório do inventário.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 sm:col-span-2">
                                        <FormLabel>Nome da Organização</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Minha Empresa S.A." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 sm:col-span-2">
                                        <FormLabel>Endereço da Organização</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Rua, Número, Cidade, Estado" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="inventoryYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano Inventariado</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="2024" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fillingDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Preenchimento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold mb-3 text-sm text-primary">Métricas de Intensidade (Opcional)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="employees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nº Funcionários</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="revenue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Faturamento (R$)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="productionVolume"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Volume Produtivo</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="productionUnit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unidade (ex: ton, peças)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ton" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="responsibleName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Responsável</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome Completo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="responsiblePhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone do Responsável</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Informações
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function OrganizationSettingsTrigger() {
    const { organization } = useEmissions();

    // We can use the same Dialog component logic or a separate trigger mechanism.
    // For simplicity, let's just create a button that creates a localized instance of the dialog logic 
    // OR better: Lift the state up? 
    // Actually, simply rendering OrganizationInfoDialog inside Layout handles the auto-open.
    // To manually open it, we might need a context trigger or a separate component.
    // Let's keep it simple: OrganizationInfoDialog handles "Auto Open".
    // We will create a separate "Edit Button" later if needed that sets a global state? 
    // For now, let's just focus on the Overlay requested by the user.
    return null;
}
