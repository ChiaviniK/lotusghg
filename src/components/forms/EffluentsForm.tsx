"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2 } from "lucide-react";
import { useState, useMemo } from "react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmissions } from "@/contexts/EmissionsContext";

import {
    calculateEffluentTreatment,
    calculateEffluentDisposal,
    EffluentResult,
    EFFLUENT_MCF
} from "@/lib/calc/effluents";

// --------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------

// 1. Treatment Schema
const treatmentSchema = z.object({
    id: z.string().optional(),
    type: z.literal("treatment"),
    description: z.string().min(1, "Descrição obrigatória"),
    flow_m3_year: z.coerce.number().min(0).default(0),
    organic_load_mg_l: z.coerce.number().min(0).default(0),
    load_type: z.enum(["bod", "cod"]),
    treatment_type: z.string().min(1),
    sludge_removed_kg: z.coerce.number().min(0).default(0),
    methane_recovered_t: z.coerce.number().min(0).default(0),
    nitrogen_load_mg_l: z.coerce.number().min(0).default(0),
});

// 2. Disposal Schema
const disposalSchema = z.object({
    id: z.string().optional(),
    type: z.literal("disposal"),
    description: z.string().min(1, "Descrição obrigatória"),
    flow_m3_year: z.coerce.number().min(0).default(0),
    nitrogen_load_mg_l: z.coerce.number().min(0).default(0),
    discharge_type: z.string().optional(), // For future expansion
});

// 3. Other Tools
const otherSchema = z.object({
    id: z.string().optional(),
    type: z.literal("other"),
    description: z.string().min(1),
    gas_name: z.string().min(1),
    total_emissions_tCO2e: z.coerce.number().min(0).default(0),
    biogenic_emissions_tCO2e: z.coerce.number().min(0).default(0),
});

export function EffluentsForm() {
    const { entries, addEntry, removeEntry } = useEmissions();

    // Filter for Effluents entries
    const effluentEntries = useMemo(() =>
        entries.filter(e => e.scope === "scope1" && e.category === "effluents"),
        [entries]);

    const [activeTab, setActiveTab] = useState("treatment");

    // Forms
    const formTreatment = useForm<z.infer<typeof treatmentSchema>>({
        resolver: zodResolver(treatmentSchema),
        defaultValues: {
            type: "treatment",
            description: "",
            flow_m3_year: 0,
            organic_load_mg_l: 0,
            load_type: "cod",
            treatment_type: "anaerobic_reactor",
            sludge_removed_kg: 0,
            methane_recovered_t: 0,
            nitrogen_load_mg_l: 0
        }
    });

    const formDisposal = useForm<z.infer<typeof disposalSchema>>({
        resolver: zodResolver(disposalSchema),
        defaultValues: {
            type: "disposal",
            description: "",
            flow_m3_year: 0,
            nitrogen_load_mg_l: 0,
            discharge_type: "untreated_discharge"
        }
    });

    const formOther = useForm<z.infer<typeof otherSchema>>({
        resolver: zodResolver(otherSchema),
        defaultValues: {
            type: "other",
            description: "",
            gas_name: "",
            total_emissions_tCO2e: 0,
            biogenic_emissions_tCO2e: 0
        }
    });

    // Handlers
    function onSubmitTreatment(data: z.infer<typeof treatmentSchema>) {
        const result = calculateEffluentTreatment(data);
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "effluents",
            description: data.description,
            emissions_tCO2e: result.emissions_tCO2e,
            biogenic_tCO2e: result.biogenic_emissions_tCO2e,
            data: { ...data, details: result },
            date: new Date().toISOString()
        });
        formTreatment.reset();
    }

    function onSubmitDisposal(data: z.infer<typeof disposalSchema>) {
        // @ts-ignore
        const result = calculateEffluentDisposal(data);
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "effluents",
            description: data.description,
            emissions_tCO2e: result.emissions_tCO2e,
            biogenic_tCO2e: result.biogenic_emissions_tCO2e,
            data: { ...data, details: result },
            date: new Date().toISOString()
        });
        formDisposal.reset();
    }

    function onSubmitOther(data: z.infer<typeof otherSchema>) {
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "effluents",
            description: data.description,
            emissions_tCO2e: data.total_emissions_tCO2e,
            biogenic_tCO2e: data.biogenic_emissions_tCO2e,
            data: {
                ...data,
                details: {
                    emissions_tCO2e: data.total_emissions_tCO2e,
                    biogenic_emissions_tCO2e: data.biogenic_emissions_tCO2e,
                    ch4_emissions_t: 0,
                    n2o_emissions_t: 0
                }
            },
            date: new Date().toISOString()
        });
        formOther.reset();
    }

    const totalEmissions = effluentEntries.reduce((s, e) => s + e.emissions_tCO2e, 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Efluentes Líquidos (Escopo 1.8)</CardTitle>
                    <CardDescription>Tratamento e/ou disposição final de efluentes líquidos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="treatment">Tratamento</TabsTrigger>
                            <TabsTrigger value="disposal">Disposição Final</TabsTrigger>
                            <TabsTrigger value="other">Outros</TabsTrigger>
                        </TabsList>

                        {/* TREATMENT */}
                        <TabsContent value="treatment">
                            <Form {...formTreatment}>
                                <form onSubmit={formTreatment.handleSubmit(onSubmitTreatment)} className="space-y-6 pt-4">
                                    <FormField control={formTreatment.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formTreatment.control} name="flow_m3_year" render={({ field }) => (
                                            <FormItem><FormLabel>Vazão (m³/ano)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />

                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField control={formTreatment.control} name="organic_load_mg_l" render={({ field }) => (
                                                <FormItem><FormLabel>Carga Orgânica (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={formTreatment.control} name="load_type" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Carga</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="cod">DQO (COD)</SelectItem>
                                                            <SelectItem value="bod">DBO (BOD)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <FormField control={formTreatment.control} name="treatment_type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Tratamento</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.entries(EFFLUENT_MCF).map(([key, val]) => (
                                                        <SelectItem key={key} value={key}>{val.label} (MCF {val.mcf})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField control={formTreatment.control} name="sludge_removed_kg" render={({ field }) => (
                                            <FormItem><FormLabel>Lodo Removido (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formTreatment.control} name="methane_recovered_t" render={({ field }) => (
                                            <FormItem><FormLabel>CH4 Recuperado (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formTreatment.control} name="nitrogen_load_mg_l" render={({ field }) => (
                                            <FormItem><FormLabel>Nitrogênio no Efluente (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <Button type="submit">Calcular Tratamento</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* DISPOSAL */}
                        <TabsContent value="disposal">
                            <Form {...formDisposal}>
                                <form onSubmit={formDisposal.handleSubmit(onSubmitDisposal)} className="space-y-6 pt-4">
                                    <FormField control={formDisposal.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formDisposal.control} name="flow_m3_year" render={({ field }) => (
                                            <FormItem><FormLabel>Vazão Lançada (m³/ano)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formDisposal.control} name="nitrogen_load_mg_l" render={({ field }) => (
                                            <FormItem><FormLabel>Nitrogênio no Efluente (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Nota: Cálculo de emissões de N2O direto pelo lançamento em corpos hídricos.</p>

                                    <Button type="submit">Calcular Disposição Final</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* OTHER */}
                        <TabsContent value="other">
                            <Form {...formOther}>
                                <form onSubmit={formOther.handleSubmit(onSubmitOther)} className="space-y-6 pt-4">
                                    <FormField control={formOther.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formOther.control} name="gas_name" render={({ field }) => (
                                            <FormItem><FormLabel>Gás Relatado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formOther.control} name="total_emissions_tCO2e" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões (tCO2e)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Relatar Outros</Button>
                                </form>
                            </Form>
                        </TabsContent>

                    </Tabs>
                </CardContent>
            </Card>

            {/* RESULTS */}
            {effluentEntries.length > 0 && (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{totalEmissions.toFixed(4)} t</div>
                            <p className="text-xs text-muted-foreground">Total Emissões (tCO2e)</p>
                        </CardContent>
                    </Card>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fonte</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead className="text-right">CH4 (t)</TableHead>
                                    <TableHead className="text-right">N2O (t)</TableHead>
                                    <TableHead className="text-right">tCO2e</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {effluentEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.description}</TableCell>
                                        <TableCell className="capitalize">{entry.data.type || entry.category}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {/* Render details */}
                                            {entry.data.type === 'treatment' && `${(entry.data as any).flow_m3_year} m³/yr`}
                                            {entry.data.type === 'disposal' && `${(entry.data as any).flow_m3_year} m³/yr`}
                                            {entry.data.type === 'other' && `${(entry.data as any).gas_name}`}
                                        </TableCell>
                                        <TableCell className="text-right">{entry.data.details?.ch4_emissions_t.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.data.details?.n2o_emissions_t.toFixed(4)}</TableCell>
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
