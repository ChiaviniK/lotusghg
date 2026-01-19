"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Save } from "lucide-react";
import { useMemo, useState } from "react";

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEmissions } from "@/contexts/EmissionsContext";

import { SCOPE3_CATEGORIES, GHG_GASES } from "@/lib/constants/scope3-data";

const GUIDELINES = [
    "(A) Utilize essa aba para incluir os cálculos realizados em outra ferramenta.",
    "(B) Algumas categorias possuem calculadoras específicas em outras abas (Ex: Resíduos, Efluentes).",
    "(C) Esta aba apresenta todas as 15 categorias para relato consolidado.",
    "(D) Preencha apenas as células em LARANJA CLARO (campos de entrada)."
];

// Schema: A flat map of { "catId_gasId_field": number }
// Field types: 'gee' (t GEE) or 'co2e' (t CO2e)
const inventorySchema = z.record(z.string(), z.coerce.number().min(0).optional());

export function Scope3InventoryForm() {
    const { entries, addEntry, removeEntry } = useEmissions();
    const [showSuccess, setShowSuccess] = useState(false);

    // Check if we have a saved inventory
    const savedEntry = useMemo(() => entries.find(e => e.scope === "scope3" && e.category === "inventory_matrix"), [entries]);

    const form = useForm<z.infer<typeof inventorySchema>>({
        // @ts-ignore
        resolver: zodResolver(inventorySchema),
        defaultValues: savedEntry?.data || {}
    });

    const categories = SCOPE3_CATEGORIES;
    const gases = GHG_GASES;

    const groups = ["1-4", "5-8", "9-12", "13-Other"];

    // Watch all values to allow real-time calculation in the table
    const values = form.watch();

    function onSubmit(data: z.infer<typeof inventorySchema>) {
        // Calculate total CO2e
        let totalCO2e = 0;
        let totalBio = 0;

        const effectiveData = { ...data };

        // Iterate categories and gases to calculate totals based on effective values
        categories.forEach(cat => {
            gases.forEach(gas => {
                const tgee = data[`${cat.id}_${gas.id}_tgee`];
                const manualCo2e = data[`${cat.id}_${gas.id}_co2e`];

                // Effective logic: Manual override > Calculated
                let effectiveVal = 0;
                if (manualCo2e !== undefined && manualCo2e !== null && manualCo2e !== "") {
                    effectiveVal = Number(manualCo2e);
                } else if (tgee) {
                    effectiveVal = Number(tgee) * gas.gwp;
                    // Auto-fill the saved data with the calculated value if manual is empty
                    effectiveData[`${cat.id}_${gas.id}_co2e`] = effectiveVal;
                }

                totalCO2e += effectiveVal;
            });

            // Bio totals
            const bioEmission = data[`${cat.id}_bio_co2_co2e`];
            if (bioEmission) totalBio += bioEmission;
        });

        // Save as a SINGLE entry that gets updated (Upsert logic)
        if (savedEntry) {
            removeEntry(savedEntry.id);
        }

        addEntry({
            id: savedEntry?.id || crypto.randomUUID(),
            scope: "scope3",
            category: "inventory_matrix",
            description: "Inventário Consolidado Escopo 3",
            emissions_tCO2e: totalCO2e,
            biogenic_tCO2e: totalBio,
            data: effectiveData,
            date: new Date().toISOString()
        });

        // Show success overlay
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }

    return (
        <div className="space-y-8 relative">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Orientações Gerais</AlertTitle>
                <AlertDescription>
                    <ul className="list-none space-y-1 text-sm mt-2">
                        {GUIDELINES.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="1-4">
                        <TabsList className="grid w-full grid-cols-4">
                            {groups.map(g => <TabsTrigger key={g} value={g}>Categorias {g}</TabsTrigger>)}
                        </TabsList>

                        {groups.map(group => (
                            <TabsContent key={group} value={group}>
                                <div className="space-y-8">
                                    {categories.filter(c => c.group === group).map(cat => {
                                        // Calculate category total for display
                                        let categoryTotal = 0;
                                        gases.forEach(gas => {
                                            const tgee = values[`${cat.id}_${gas.id}_tgee`];
                                            const manual = values[`${cat.id}_${gas.id}_co2e`];
                                            if (manual !== undefined && manual !== "" && manual !== null) {
                                                categoryTotal += Number(manual);
                                            } else if (tgee) {
                                                categoryTotal += Number(tgee) * gas.gwp;
                                            }
                                        });

                                        return (
                                            <Card key={cat.id}>
                                                <CardHeader className="py-4 bg-muted/20">
                                                    <CardTitle className="text-base">{cat.label}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-0 overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[200px]">Gás</TableHead>
                                                                <TableHead className="w-[150px]">t GEE (Massa)</TableHead>
                                                                <TableHead className="w-[150px]">Cálculo (tCO2e)</TableHead>
                                                                <TableHead className="w-[150px]">t CO2e (Manual)</TableHead>
                                                                <TableHead className="w-[150px] font-bold">Final (tCO2e)</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {gases.map(gas => {
                                                                const tgeeValue = values[`${cat.id}_${gas.id}_tgee`];
                                                                const manualValue = values[`${cat.id}_${gas.id}_co2e`];
                                                                const calculated = tgeeValue ? (Number(tgeeValue) * gas.gwp) : 0;

                                                                const safeManual = (manualValue !== undefined && manualValue !== "" && manualValue !== null) ? Number(manualValue) : null;
                                                                const effective = safeManual !== null ? safeManual : calculated;

                                                                return (
                                                                    <TableRow key={`${cat.id}_${gas.id}`}>
                                                                        <TableCell className="font-medium text-xs">
                                                                            {gas.label}
                                                                            <span className="text-muted-foreground ml-1">(GWP: {gas.gwp})</span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`${cat.id}_${gas.id}_tgee`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-0">
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                step="0.0001"
                                                                                                className="h-8 text-right"
                                                                                                {...field}
                                                                                                value={field.value ?? ''}
                                                                                            />
                                                                                        </FormControl>
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell className="text-right text-muted-foreground font-mono">
                                                                            {calculated > 0 ? calculated.toFixed(4) : "-"}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`${cat.id}_${gas.id}_co2e`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-0">
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                step="0.0001"
                                                                                                className="h-8 text-right"
                                                                                                {...field}
                                                                                                value={field.value ?? ''}
                                                                                            />
                                                                                        </FormControl>
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-bold text-primary">
                                                                            {effective > 0 ? effective.toFixed(4) : "-"}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                            {/* Summary Rows for Category */}
                                                            <TableRow className="bg-muted/50 font-bold">
                                                                <TableCell>Total Biogênico (Emissão)</TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground">-</TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground">-</TableCell>
                                                                <TableCell>
                                                                    <FormField control={form.control} name={`${cat.id}_bio_co2_co2e`} render={({ field }) => (
                                                                        <FormControl><Input type="number" step="0.0001" className="h-8 text-right" {...field} value={field.value ?? ''} /></FormControl>
                                                                    )} />
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow className="bg-muted/50 font-bold">
                                                                <TableCell>Total Biogênico (Remoção)</TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground">-</TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground">-</TableCell>
                                                                <TableCell>
                                                                    <FormField control={form.control} name={`${cat.id}_removed_bio_co2e`} render={({ field }) => (
                                                                        <FormControl><Input type="number" step="0.0001" className="h-8 text-right" {...field} value={field.value ?? ''} /></FormControl>
                                                                    )} />
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow className="bg-primary/10 font-bold text-primary">
                                                                <TableCell>Total Categoria (CO2e)</TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground"></TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground"></TableCell>
                                                                <TableCell className="text-right text-xs text-muted-foreground">Automático</TableCell>
                                                                <TableCell className="text-right text-lg">
                                                                    {categoryTotal.toFixed(4)}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <div className="fixed bottom-8 right-8">
                        <Button type="submit" size="lg" className="shadow-lg"><Save className="mr-2 h-4 w-4" /> Salvar Inventário</Button>
                    </div>
                </form>
            </Form>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-[400px] border-green-500 border-2 shadow-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                                <Save className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-green-700">Inventário Salvo!</CardTitle>
                            <CardDescription>
                                Seus dados foram salvos com sucesso.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    );
}
