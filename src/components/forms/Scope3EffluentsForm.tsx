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
    FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useEmissions } from "@/contexts/EmissionsContext";

import {
    calculateEffluentTreatment,
    calculateEffluentDisposal,
    calculateScope3DomesticAlt2,
    EFFLUENT_MCF
} from "@/lib/calc/effluents";

// --------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------

// Domestic Alt 1 (Detailed)
const domesticAlt1Schema = z.object({
    description: z.string().min(1, "Descrição obrigatória"),
    // Treatment 1
    flow_m3_year: z.coerce.number().min(0),
    organic_load: z.coerce.number().min(0), // mg/L
    load_type: z.enum(["bod", "cod"]),
    nitrogen_load: z.coerce.number().min(0), // mg/L
    treatment_type: z.string(),
    methane_recovery: z.coerce.number().default(0),
    // Sequential
    has_sequential: z.boolean().default(false),
    treatment_type_2: z.string().optional(),
    methane_recovery_2: z.coerce.number().optional(),
    // Disposal
    has_disposal: z.boolean().default(false),
    disposal_type: z.string().optional(),
});

// Domestic Alt 2 (Population)
const domesticAlt2Schema = z.object({
    description: z.string().min(1),
    population: z.coerce.number().min(1),
    treatment_type: z.string(),
    // Sequential
    has_sequential: z.boolean().default(false),
    treatment_type_2: z.string().optional(),
    // Disposal
    has_disposal: z.boolean().default(false),
    disposal_type: z.string().optional(),
});

// Industrial
const industrialSchema = z.object({
    description: z.string().min(1),
    effluent_type: z.string().optional(),
    // Treatment 1
    flow_m3_year: z.coerce.number().min(0),
    organic_load: z.coerce.number().min(0),
    load_type: z.enum(["bod", "cod"]),
    nitrogen_load: z.coerce.number().min(0),
    treatment_type: z.string(),
    methane_recovery: z.coerce.number().default(0),
    // Sequential
    has_sequential: z.boolean().default(false),
    treatment_type_2: z.string().optional(),
    methane_recovery_2: z.coerce.number().optional(),
    // Disposal
    has_disposal: z.boolean().default(false),
    disposal_type: z.string().optional(),
});

export function Scope3EffluentsForm() {
    const { addEntry, entries, removeEntry } = useEmissions();
    const [domesticTab, setDomesticTab] = useState("alt2"); // Default to simplified
    const [mainTab, setMainTab] = useState("domestic");

    // Filter relevant entries
    const effEntries = useMemo(() => entries.filter(e => e.category === "scope3_effluents"), [entries]);

    const formDomAlt1 = useForm<z.infer<typeof domesticAlt1Schema>>({
        resolver: zodResolver(domesticAlt1Schema),
        defaultValues: {
            description: "", flow_m3_year: 0, organic_load: 0, load_type: "bod", nitrogen_load: 0,
            treatment_type: "anaerobic_reactor", has_sequential: false, has_disposal: false
        }
    });

    const formDomAlt2 = useForm<z.infer<typeof domesticAlt2Schema>>({
        resolver: zodResolver(domesticAlt2Schema),
        defaultValues: {
            description: "", population: 0, treatment_type: "anaerobic_reactor",
            has_sequential: false, has_disposal: false
        }
    });

    const formInd = useForm<z.infer<typeof industrialSchema>>({
        resolver: zodResolver(industrialSchema),
        defaultValues: {
            description: "", flow_m3_year: 0, organic_load: 0, load_type: "cod", nitrogen_load: 0,
            treatment_type: "anaerobic_reactor", has_sequential: false, has_disposal: false
        }
    });

    // --- HANDLERS ---

    const onSubmitDomAlt1 = (data: z.infer<typeof domesticAlt1Schema>) => {
        let ch4 = 0, n2o = 0;

        // T1
        const r1 = calculateEffluentTreatment({
            flow_m3_year: data.flow_m3_year,
            organic_load_mg_l: data.organic_load,
            load_type: data.load_type,
            nitrogen_load_mg_l: data.nitrogen_load,
            treatment_type: data.treatment_type,
            sludge_removed_kg: 0,
            methane_recovered_t: data.methane_recovery
        });
        ch4 += r1.ch4_emissions_t;
        n2o += r1.n2o_emissions_t;

        // T2
        if (data.has_sequential && data.treatment_type_2) {
            // Assume 60% removal for now as inputs for T2 aren't explicitly asked for in simplified Plan
            const load2 = data.organic_load * 0.4;
            const r2 = calculateEffluentTreatment({
                flow_m3_year: data.flow_m3_year,
                organic_load_mg_l: load2,
                load_type: data.load_type,
                nitrogen_load_mg_l: data.nitrogen_load, // N assumes maintained
                treatment_type: data.treatment_type_2,
                sludge_removed_kg: 0,
                methane_recovered_t: data.methane_recovery_2 || 0
            });
            ch4 += r2.ch4_emissions_t;
            n2o += r2.n2o_emissions_t;
        }

        // Disposal
        if (data.has_disposal && data.disposal_type) {
            const rd = calculateEffluentDisposal({
                flow_m3_year: data.flow_m3_year,
                nitrogen_load_mg_l: data.nitrogen_load,
                discharge_type: data.disposal_type
            });
            ch4 += rd.ch4_emissions_t;
            n2o += rd.n2o_emissions_t;
        }

        const totalCO2e = (ch4 * 28) + (n2o * 265);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "scope3_effluents",
            description: `Doméstico (Det): ${data.description}`,
            emissions_tCO2e: totalCO2e,
            biogenic_tCO2e: 0,
            data: { ...data, type: "domestic_alt1", details: { ch4, n2o } },
            date: new Date().toISOString()
        });
        formDomAlt1.reset();
    };

    const onSubmitDomAlt2 = (data: z.infer<typeof domesticAlt2Schema>) => {
        const res = calculateScope3DomesticAlt2({
            population: data.population,
            treatment_type: data.treatment_type,
            treatment_type_2: data.has_sequential ? data.treatment_type_2 : undefined,
            disposal_type: data.has_disposal ? data.disposal_type : undefined
        });

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "scope3_effluents",
            description: `Doméstico (Pop): ${data.description}`,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: 0,
            data: { ...data, type: "domestic_alt2", details: { ch4: res.ch4_emissions_t, n2o: res.n2o_emissions_t } },
            date: new Date().toISOString()
        });
        formDomAlt2.reset();
    };

    const onSubmitInd = (data: z.infer<typeof industrialSchema>) => {
        // Reuse same logic style as Dom Alt 1
        let ch4 = 0, n2o = 0;

        const r1 = calculateEffluentTreatment({
            flow_m3_year: data.flow_m3_year,
            organic_load_mg_l: data.organic_load,
            load_type: data.load_type,
            nitrogen_load_mg_l: data.nitrogen_load,
            treatment_type: data.treatment_type,
            sludge_removed_kg: 0,
            methane_recovered_t: data.methane_recovery
        });
        ch4 += r1.ch4_emissions_t;
        n2o += r1.n2o_emissions_t;

        if (data.has_sequential && data.treatment_type_2) {
            const load2 = data.organic_load * 0.4;
            const r2 = calculateEffluentTreatment({
                flow_m3_year: data.flow_m3_year,
                organic_load_mg_l: load2,
                load_type: data.load_type,
                nitrogen_load_mg_l: data.nitrogen_load,
                treatment_type: data.treatment_type_2,
                sludge_removed_kg: 0,
                methane_recovered_t: data.methane_recovery_2 || 0
            });
            ch4 += r2.ch4_emissions_t;
            n2o += r2.n2o_emissions_t;
        }

        if (data.has_disposal && data.disposal_type) {
            const rd = calculateEffluentDisposal({
                flow_m3_year: data.flow_m3_year,
                nitrogen_load_mg_l: data.nitrogen_load,
                discharge_type: data.disposal_type
            });
            ch4 += rd.ch4_emissions_t;
            n2o += rd.n2o_emissions_t;
        }

        const totalCO2e = (ch4 * 28) + (n2o * 265);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "scope3_effluents",
            description: `Industrial: ${data.description}`,
            emissions_tCO2e: totalCO2e,
            biogenic_tCO2e: 0,
            data: { ...data, type: "industrial", details: { ch4, n2o } },
            date: new Date().toISOString()
        });
        formInd.reset();
    };

    const totalEmissions = effEntries.reduce((s, e) => s + e.emissions_tCO2e, 0);

    // --- RENDER ---
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Efluentes Líquidos (Escopo 3)</CardTitle>
                    <CardDescription>
                        Tratamento de efluentes em operações de terceiros (não controladas).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={mainTab} onValueChange={setMainTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="domestic">Doméstico</TabsTrigger>
                            <TabsTrigger value="industrial">Industrial</TabsTrigger>
                        </TabsList>

                        <TabsContent value="domestic">
                            <Tabs value={domesticTab} onValueChange={setDomesticTab}>
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="alt2">Alternativa 2 (População)</TabsTrigger>
                                    <TabsTrigger value="alt1">Alternativa 1 (Detalhado)</TabsTrigger>
                                </TabsList>

                                {/* ALT 2: POPULATION */}
                                <TabsContent value="alt2">
                                    <Form {...formDomAlt2}>
                                        <form onSubmit={formDomAlt2.handleSubmit(onSubmitDomAlt2)} className="space-y-4 pt-4">
                                            <FormField control={formDomAlt2.control} name="description" render={({ field }) => (
                                                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={formDomAlt2.control} name="population" render={({ field }) => (
                                                <FormItem><FormLabel>População Atendida</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={formDomAlt2.control} name="treatment_type" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Tratamento</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {Object.entries(EFFLUENT_MCF).map(([k, v]) => (
                                                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />

                                            <div className="border p-4 rounded bg-muted/20 space-y-4">
                                                <FormField control={formDomAlt2.control} name="has_disposal" render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="pb-2">Lançamento ao Ambiente?</FormLabel></FormItem>
                                                )} />
                                                {formDomAlt2.watch("has_disposal") && (
                                                    <FormField control={formDomAlt2.control} name="disposal_type" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tipo de Disposição Final</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="untreated_discharge">Lançamento em Rio/Mar</SelectItem>
                                                                    <SelectItem value="stagnant_discharge">Lançamento em Corpo Estagnado</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )} />
                                                )}
                                            </div>

                                            <Button type="submit">Calcular e Adicionar</Button>
                                        </form>
                                    </Form>
                                </TabsContent>

                                {/* ALT 1: DETAILED */}
                                <TabsContent value="alt1">
                                    <div className="text-sm text-yellow-600 mb-4 bg-yellow-50 p-2 rounded">
                                        Utilize esta opção se possuir dados exatos de vazão e carga orgânica.
                                    </div>
                                    <Form {...formDomAlt1}>
                                        <form onSubmit={formDomAlt1.handleSubmit(onSubmitDomAlt1)} className="space-y-4 pt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={formDomAlt1.control} name="description" render={({ field }) => (
                                                    <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={formDomAlt1.control} name="flow_m3_year" render={({ field }) => (
                                                    <FormItem><FormLabel>Vazão (m³/ano)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={formDomAlt1.control} name="organic_load" render={({ field }) => (
                                                    <FormItem><FormLabel>Carga Orgânica (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={formDomAlt1.control} name="nitrogen_load" render={({ field }) => (
                                                    <FormItem><FormLabel>Nitrogênio (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <FormField control={formDomAlt1.control} name="treatment_type" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Tratamento</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {Object.entries(EFFLUENT_MCF).map(([k, v]) => (
                                                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />

                                            <div className="border p-4 rounded bg-muted/20 space-y-4">
                                                <FormField control={formDomAlt1.control} name="has_disposal" render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="pb-2">Lançamento ao Ambiente?</FormLabel></FormItem>
                                                )} />
                                                {formDomAlt1.watch("has_disposal") && (
                                                    <FormField control={formDomAlt1.control} name="disposal_type" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tipo de Disposição Final</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="untreated_discharge">Lançamento em Rio/Mar</SelectItem>
                                                                    <SelectItem value="stagnant_discharge">Lançamento em Corpo Estagnado</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )} />
                                                )}
                                            </div>

                                            <Button type="submit">Calcular e Adicionar</Button>
                                        </form>
                                    </Form>
                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        {/* INDUSTRIAL */}
                        <TabsContent value="industrial">
                            <Form {...formInd}>
                                <form onSubmit={formInd.handleSubmit(onSubmitInd)} className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formInd.control} name="description" render={({ field }) => (
                                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formInd.control} name="flow_m3_year" render={({ field }) => (
                                            <FormItem><FormLabel>Vazão (m³/ano)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formInd.control} name="organic_load" render={({ field }) => (
                                            <FormItem><FormLabel>Carga Orgânica (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formInd.control} name="nitrogen_load" render={({ field }) => (
                                            <FormItem><FormLabel>Nitrogênio (mg/L)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={formInd.control} name="treatment_type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Tratamento</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.entries(EFFLUENT_MCF).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />

                                    <div className="border p-4 rounded bg-muted/20 space-y-4">
                                        <FormField control={formInd.control} name="has_disposal" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="pb-2">Lançamento ao Ambiente?</FormLabel></FormItem>
                                        )} />
                                        {formInd.watch("has_disposal") && (
                                            <FormField control={formInd.control} name="disposal_type" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Disposição Final</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="untreated_discharge">Lançamento em Rio/Mar</SelectItem>
                                                            <SelectItem value="stagnant_discharge">Lançamento em Corpo Estagnado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        )}
                                    </div>

                                    <Button type="submit">Calcular e Adicionar</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* RESULTS */}
            {effEntries.length > 0 && (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{totalEmissions.toFixed(4)}</div>
                            <p className="text-sm text-muted-foreground">Emissões Totais de Efluentes - Escopo 3 (tCO2e)</p>
                        </CardContent>
                    </Card>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead className="text-right">CH4 (t)</TableHead>
                                    <TableHead className="text-right">N2O (t)</TableHead>
                                    <TableHead className="text-right">tCO2e</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {effEntries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell className="capitalize text-xs text-muted-foreground">
                                            {entry.data.type === 'domestic_alt2' ? 'Doméstico (Pop)' : 'Detalhado'}
                                        </TableCell>
                                        <TableCell className="text-right">{(entry.data.details as any)?.ch4?.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{(entry.data.details as any)?.n2o?.toFixed(4)}</TableCell>
                                        <TableCell className="text-right font-medium">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
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
