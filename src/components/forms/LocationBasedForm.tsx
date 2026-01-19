"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEmissions } from "@/contexts/EmissionsContext";

import { SIN_CHARGES_2024, EV_TYPES } from "@/lib/constants/grid-factors";
import { calculateSinEmissions, calculateEvEmissions, calculateIsolatedEmissions, SinInput, EvInput } from "@/lib/calc/scope2";

// --------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------

// SIN Schema
const sinSchema = z.object({
    description: z.string().min(1, "Descrição obrigatória"),
    method: z.enum(["monthly", "annual"]),
    // Monthly inputs
    jan: z.coerce.number().min(0).optional(),
    feb: z.coerce.number().min(0).optional(),
    mar: z.coerce.number().min(0).optional(),
    apr: z.coerce.number().min(0).optional(),
    may: z.coerce.number().min(0).optional(),
    jun: z.coerce.number().min(0).optional(),
    jul: z.coerce.number().min(0).optional(),
    aug: z.coerce.number().min(0).optional(),
    sep: z.coerce.number().min(0).optional(),
    oct: z.coerce.number().min(0).optional(),
    nov: z.coerce.number().min(0).optional(),
    dec: z.coerce.number().min(0).optional(),
    // Annual input
    annual_mwh: z.coerce.number().min(0).optional(),
}).refine(data => {
    if (data.method === "annual") return data.annual_mwh !== undefined && data.annual_mwh >= 0;
    // If monthly, at least one month has data? technically allow 0 to start
    return true;
}, { message: "Preencha o consumo anual", path: ["annual_mwh"] });

// EV Schema
const evSchema = z.object({
    description: z.string().min(1),
    vehicle_type: z.string().min(1),
    distance_km: z.coerce.number().min(0),
});

// Isolated Schema
const isolatedSchema = z.object({
    description: z.string().min(1),
    consumption_mwh: z.coerce.number().min(0),
    emission_factor: z.coerce.number().min(0), // user provided logic implies manual factor or looked up
});

export function LocationBasedForm() {
    const { entries, addEntry, removeEntry } = useEmissions();

    // Filter for Scope 2 Location based
    const scope2Entries = useMemo(() =>
        entries.filter(e => e.scope === "scope2" && e.category === "location"),
        [entries]);

    const [activeTab, setActiveTab] = useState("sin");

    const formSin = useForm<z.infer<typeof sinSchema>>({
        resolver: zodResolver(sinSchema),
        defaultValues: {
            method: "monthly",
            description: "",
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
            annual_mwh: 0
        }
    });

    const formEv = useForm<z.infer<typeof evSchema>>({
        resolver: zodResolver(evSchema),
        defaultValues: { description: "", distance_km: 0 }
    });

    const formIsolated = useForm<z.infer<typeof isolatedSchema>>({
        resolver: zodResolver(isolatedSchema),
        defaultValues: { description: "", consumption_mwh: 0, emission_factor: 0 }
    });

    // Submits
    function onSubmitSin(data: z.infer<typeof sinSchema>) {
        const input: SinInput = {
            year: 2024,
            use_monthly: data.method === "monthly",
            annual_mwh: data.annual_mwh,
            consumption_mwh: {
                jan: data.jan, feb: data.feb, mar: data.mar, apr: data.apr, may: data.may, jun: data.jun,
                jul: data.jul, aug: data.aug, sep: data.sep, oct: data.oct, nov: data.nov, dec: data.dec
            }
        };

        const res = calculateSinEmissions(input);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "location",
            description: data.description,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, type: "sin", input, res },
            date: new Date().toISOString()
        });

        formSin.reset({ method: "monthly", description: "", annual_mwh: 0, jan: 0 }); // Reset partially
    }

    function onSubmitEv(data: z.infer<typeof evSchema>) {
        const input: EvInput = {
            vehicle_type: data.vehicle_type as any,
            distance_km: data.distance_km,
            use_monthly: false // simplified for this form version
        };

        const res = calculateEvEmissions(input);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "location",
            description: data.description,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, type: "ev", res },
            date: new Date().toISOString()
        });

        formEv.reset();
    }

    function onSubmitIsolated(data: z.infer<typeof isolatedSchema>) {
        const res = calculateIsolatedEmissions(data.consumption_mwh, data.emission_factor);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "location",
            description: data.description,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, type: "isolated", res },
            date: new Date().toISOString()
        });
        formIsolated.reset();
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Eletricidade - Abordagem Baseada na Localização</CardTitle>
                    <CardDescription>Cálculo de emissões pelo Sistema Interligado Nacional (SIN) e Sistemas Isolados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="sin">SIN (Tabela 1)</TabsTrigger>
                            <TabsTrigger value="ev">Veículos Elétricos (Tabela 2)</TabsTrigger>
                            <TabsTrigger value="isolated">Sistemas Isolados (Tabela 4)</TabsTrigger>
                        </TabsList>

                        {/* SIN FORM */}
                        <TabsContent value="sin">
                            <Form {...formSin}>
                                <form onSubmit={formSin.handleSubmit(onSubmitSin)} className="space-y-6 pt-4">
                                    <FormField control={formSin.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição da Fonte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <FormField control={formSin.control} name="method" render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Método de Entrada</FormLabel>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4">
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="monthly" /></FormControl>
                                                    <FormLabel className="font-normal">Mensal (Recomendado)</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="annual" /></FormControl>
                                                    <FormLabel className="font-normal">Anual</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormItem>
                                    )} />

                                    {formSin.watch("method") === "monthly" ? (
                                        <div className="grid grid-cols-3 gap-4 border p-4 rounded">
                                            {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(month => (
                                                <FormField key={month} control={formSin.control} name={month as any} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="uppercase">{month}</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                    ) : (
                                        <FormField control={formSin.control} name="annual_mwh" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Consumo Anual (MWh)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}

                                    <Button type="submit">Calcular SIN</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* EV FORM */}
                        <TabsContent value="ev">
                            <Form {...formEv}>
                                <form onSubmit={formEv.handleSubmit(onSubmitEv)} className="space-y-6 pt-4">
                                    <FormField control={formEv.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição da Frota</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formEv.control} name="vehicle_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Veículo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {EV_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={formEv.control} name="distance_km" render={({ field }) => (
                                            <FormItem><FormLabel>Distância (km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Calcular Veículos Elétricos</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* ISOLATED FORM */}
                        <TabsContent value="isolated">
                            <Form {...formIsolated}>
                                <form onSubmit={formIsolated.handleSubmit(onSubmitIsolated)} className="space-y-6 pt-4">
                                    <FormField control={formIsolated.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Fonte Isolada</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formIsolated.control} name="consumption_mwh" render={({ field }) => (
                                            <FormItem><FormLabel>Consumo (MWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formIsolated.control} name="emission_factor" render={({ field }) => (
                                            <FormItem><FormLabel>Fator (tCO2/MWh)</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Calcular Isolado</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* RESULTS */}
            {scope2Entries.length > 0 && (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{scope2Entries.reduce((a, b) => a + (b.emissions_tCO2e || 0), 0).toFixed(4)} t</div>
                            <p className="text-xs text-muted-foreground">Total Emissões Escopo 2 (Location)</p>
                        </CardContent>
                    </Card>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fonte</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead className="text-right">Emissão (tCO2e)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scope2Entries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.description}</TableCell>
                                        <TableCell className="capitalize">{entry.data.type || 'location'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {entry.data.type === 'sin' && (entry.data.input.use_monthly ? 'Mensal' : `${entry.data.input.annual_mwh} MWh Anual`)}
                                            {entry.data.type === 'ev' && `Distância: ${entry.data.distance_km} km`}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
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
