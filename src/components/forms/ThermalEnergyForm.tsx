"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmissions } from "@/contexts/EmissionsContext";

import { THERMAL_FACTORS } from "@/lib/constants/thermal-fluids";
import { calculateThermalEmissions, ThermalInput } from "@/lib/calc/scope2-market";

const GUIDELINES = [
    "(A) Esta seção permite calcular as emissões relacionadas a compra de energia térmica (vapor).",
    "(B) Preencha somente as células em LARANJA CLARO de acordo com o solicitado.",
    "(C) Os dados consolidados são apresentados na Tabela 3.",
    "(D) Os fatores de emissão padrão constam na tabela, mas podem ser ajustados se houver dados do fornecedor."
];

const thermalSchema = z.object({
    description: z.string().min(1, "Descrição obrigatória"),
    fuel_id: z.string().min(1, "Selecione o combustível"),
    steam_purchased_gj: z.coerce.number().min(0.0001, "Quantidade necessária"),
    boiler_efficiency: z.coerce.number().min(0.1).max(1, "Eficiência entre 0.1 (10%) e 1.0 (100%)").default(0.8),
    // Custom factors
    custom_co2: z.coerce.number().min(0).optional(),
    custom_ch4: z.coerce.number().min(0).optional(),
    custom_n2o: z.coerce.number().min(0).optional(),
});

export function ThermalEnergyForm() {
    const { entries, addEntry, removeEntry } = useEmissions();

    // Scope 2 Market based Thermal
    const thermalEntries = useMemo(() =>
        entries.filter(e => e.scope === "scope2" && e.category === "thermal_market"),
        [entries]);

    const form = useForm<z.infer<typeof thermalSchema>>({
        resolver: zodResolver(thermalSchema),
        defaultValues: {
            description: "",
            fuel_id: "",
            steam_purchased_gj: 0,
            boiler_efficiency: 0.8,
        }
    });

    const selectedFuelId = form.watch("fuel_id");
    const selectedFuel = useMemo(() => THERMAL_FACTORS.find(f => f.id === selectedFuelId), [selectedFuelId]);

    function onSubmit(data: z.infer<typeof thermalSchema>) {
        const input: ThermalInput = {
            fuel_id: data.fuel_id,
            description: data.description,
            steam_purchased_gj: data.steam_purchased_gj,
            boiler_efficiency: data.boiler_efficiency,
            custom_factors: {
                co2_kg_gj: data.custom_co2,
                ch4_kg_gj: data.custom_ch4,
                n2o_kg_gj: data.custom_n2o
            }
        };

        const res = calculateThermalEmissions(input);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "thermal_market",
            description: data.description,
            emissions_tCO2e: res.emissions.total_co2e_t,
            biogenic_tCO2e: res.emissions.biogenic_co2_t,
            data: { ...data, input, res },
            date: new Date().toISOString()
        });

        form.reset({
            description: "",
            fuel_id: "",
            steam_purchased_gj: 0,
            boiler_efficiency: 0.8,
            custom_co2: undefined, custom_ch4: undefined, custom_n2o: undefined
        });
    }

    return (
        <div className="space-y-8">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Orientações Gerais</AlertTitle>
                <AlertDescription>
                    <ul className="list-none space-y-1 text-sm mt-2">
                        {GUIDELINES.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Tabela 1. Dados de Combustível, Fervedor e Vapor</CardTitle>
                    <CardDescription>Insira os dados referentes ao vapor comprado e o combustível utilizado na geração.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Descrição da Fonte</FormLabel><FormControl><Input {...field} placeholder="Ex: Caldeira Auxiliar" /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="fuel_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Combustível Utilizado</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {THERMAL_FACTORS.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="boiler_efficiency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Eficiência do Fervedor (0-1)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" min="0.1" max="1" {...field} /></FormControl>
                                        <FormDescription>Padrão: 0.80 (80%) se desconhecido.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="steam_purchased_gj" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vapor Comprado (Energia em GJ)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    <FormDescription>Quantidade de energia contida no vapor adquirido.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {selectedFuel && (
                                <div className="border rounded p-4 bg-muted/20 space-y-4">
                                    <h4 className="font-medium text-sm">Fatores de Emissão (kg/GJ) - Tabela 4</h4>
                                    <p className="text-xs text-muted-foreground">Edite se possuir dados específicos do fornecedor.</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField control={form.control} name="custom_co2" render={({ field }) => (
                                            <FormItem><FormLabel>CO2 (Padrão: {selectedFuel.co2_kg_gj})</FormLabel><FormControl><Input type="number" step="0.0001" placeholder={selectedFuel.co2_kg_gj.toString()} {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="custom_ch4" render={({ field }) => (
                                            <FormItem><FormLabel>CH4 (Padrão: {selectedFuel.ch4_kg_gj})</FormLabel><FormControl><Input type="number" step="0.0001" placeholder={selectedFuel.ch4_kg_gj.toString()} {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="custom_n2o" render={({ field }) => (
                                            <FormItem><FormLabel>N2O (Padrão: {selectedFuel.n2o_kg_gj})</FormLabel><FormControl><Input type="number" step="0.0001" placeholder={selectedFuel.n2o_kg_gj.toString()} {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </div>
                            )}

                            <Button type="submit">Calcular Emissões Térmicas</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* RESULTS */}
            {thermalEntries.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{thermalEntries.reduce((a, b) => a + (b.emissions_tCO2e || 0), 0).toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">Total Emissões CO2e (Fóssil + Eq)</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{thermalEntries.reduce((a, b) => a + (b.biogenic_tCO2e || 0), 0).toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">Total CO2 Biogênico</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fonte</TableHead>
                                    <TableHead>Combustível</TableHead>
                                    <TableHead>Vapor (GJ)</TableHead>
                                    <TableHead>Consumo Comb. (GJ)</TableHead>
                                    <TableHead className="text-right">CO2 (t)</TableHead>
                                    <TableHead className="text-right">CH4 (t)</TableHead>
                                    <TableHead className="text-right">N2O (t)</TableHead>
                                    <TableHead className="text-right">Total (tCO2e)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {thermalEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.description}</TableCell>
                                        <TableCell>{entry.data.input.fuel_id}</TableCell>
                                        <TableCell>{entry.data.input.steam_purchased_gj}</TableCell>
                                        <TableCell>{entry.data.res.fuel_consumption_gj.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.data.res.emissions.co2_t.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.data.res.emissions.ch4_t.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.data.res.emissions.n2o_t.toFixed(4)}</TableCell>
                                        <TableCell className="text-right font-bold">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
