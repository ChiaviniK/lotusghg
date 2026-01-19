"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
    calculateLandfillEmissions,
    calculateCompostEmissions,
    calculateIncinerationEmissions,
    LandfillInput,
    WasteResult,
    MCF_DEFAULTS
} from "@/lib/calc/waste";

// --------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------

// Landfilling
const landfillSchema = z.object({
    id: z.string().optional(),
    type: z.literal("landfill"),
    description: z.string().min(1, "Descrição obrigatória"),
    state: z.string().min(2, "UF obrigatória"),
    city: z.string().min(1, "Município obrigatório"),
    temp_avg: z.coerce.number(),
    precip_annual: z.coerce.number(),
    evapo: z.coerce.number(),
    // History
    history: z.array(z.object({
        year: z.coerce.number().min(1900).max(2100),
        amount_t: z.coerce.number().min(0),
        mcf_type: z.enum(["managed", "unmanaged_deep", "unmanaged_shallow", "uncategorized"]),
        methane_recovery_t: z.coerce.number().min(0).default(0)
    })).min(1, "Adicione pelo menos 1 ano de histórico"),
    // Composition
    composition: z.object({
        food_waste: z.coerce.number().min(0).max(100),
        garden: z.coerce.number().min(0).max(100),
        paper: z.coerce.number().min(0).max(100),
        wood: z.coerce.number().min(0).max(100),
        textile: z.coerce.number().min(0).max(100),
        nappies: z.coerce.number().min(0).max(100),
        sludge: z.coerce.number().min(0).max(100),
        other: z.coerce.number().min(0).max(100),
    }).refine((data) => {
        const sum = Object.values(data).reduce((a, b) => a + b, 0);
        return Math.abs(sum - 100) < 0.1;
    }, "A soma da composição deve ser 100%"),
});

// Composting
const compostSchema = z.object({
    id: z.string().optional(),
    type: z.literal("compost"),
    description: z.string().min(1),
    amount_t: z.coerce.number().min(0),
    recovery_ch4_t: z.coerce.number().min(0).default(0),
    ch4_factor: z.coerce.number().optional(),
    n2o_factor: z.coerce.number().optional(),
});

// Incineration
const incinerationSchema = z.object({
    id: z.string().optional(),
    type: z.literal("incineration"),
    description: z.string().min(1),
    amount_t: z.coerce.number().min(0),
    ch4_factor: z.coerce.number().optional(),
    n2o_factor: z.coerce.number().optional(),
    composition: z.object({
        paper: z.coerce.number().default(0),
        textile: z.coerce.number().default(0),
        wood: z.coerce.number().default(0),
        food: z.coerce.number().default(0),
        garden: z.coerce.number().default(0),
        sludge: z.coerce.number().default(0),
        plastic: z.coerce.number().default(0),
        metal: z.coerce.number().default(0),
        glass: z.coerce.number().default(0),
        other: z.coerce.number().default(0),
    }).refine((data) => {
        const sum = Object.values(data).reduce((a, b) => a + b, 0);
        return Math.abs(sum - 100) < 0.1;
    }, "A soma da composição deve ser 100%"),
});

// Other Tools
const otherSchema = z.object({
    id: z.string().optional(),
    type: z.literal("other"),
    description: z.string().min(1),
    gas_name: z.string().min(1),
    total_emissions_tCO2e: z.coerce.number(),
    biogenic_emissions_tCO2e: z.coerce.number().default(0),
});

export function WasteForm() {
    const { entries, addEntry, removeEntry } = useEmissions();

    // Filter for Solid Waste entries
    const wasteEntries = useMemo(() =>
        entries.filter(e => e.scope === "scope1" && e.category === "waste"),
        [entries]);

    const [activeTab, setActiveTab] = useState("landfill");

    // 1. LANDFILL FORM
    const formLandfill = useForm<z.infer<typeof landfillSchema>>({
        resolver: zodResolver(landfillSchema),
        defaultValues: {
            type: "landfill",
            state: "", city: "", temp_avg: 20, precip_annual: 1200, evapo: 1000,
            history: [{ year: new Date().getFullYear(), amount_t: 0, mcf_type: "managed", methane_recovery_t: 0 }],
            composition: {
                food_waste: 0, garden: 0, paper: 0, wood: 0, textile: 0, nappies: 0, sludge: 0, other: 100
            }
        }
    });

    const { fields: historyFields, append: appendHistory, remove: removeHistory } = useFieldArray({
        control: formLandfill.control,
        name: "history"
    });

    function onSubmitLandfill(data: z.infer<typeof landfillSchema>) {
        const input: LandfillInput = {
            site: {
                state: data.state,
                city: data.city,
                temp_avg: data.temp_avg,
                precip_annual: data.precip_annual,
                evapo: data.evapo
            },
            history: data.history,
            composition: data.composition
        };
        const currentYear = new Date().getFullYear();
        const res = calculateLandfillEmissions(input, currentYear);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "waste",
            description: data.description,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, details: res },
            date: new Date().toISOString()
        });

        formLandfill.reset();
    }

    // 2. COMPOST FORM
    const formCompost = useForm<z.infer<typeof compostSchema>>({
        resolver: zodResolver(compostSchema),
        defaultValues: { type: "compost", description: "", amount_t: 0, recovery_ch4_t: 0 }
    });

    function onSubmitCompost(data: z.infer<typeof compostSchema>) {
        const res = calculateCompostEmissions(data);
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "waste",
            description: data.description,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, details: res },
            date: new Date().toISOString()
        });
        formCompost.reset();
    }

    // 3. INCINERATION FORM
    const formIncineration = useForm<z.infer<typeof incinerationSchema>>({
        resolver: zodResolver(incinerationSchema),
        defaultValues: {
            type: "incineration", description: "", amount_t: 0,
            composition: { paper: 0, textile: 0, wood: 0, food: 0, garden: 0, sludge: 0, plastic: 0, metal: 0, glass: 0, other: 100 }
        }
    });

    function onSubmitIncineration(data: z.infer<typeof incinerationSchema>) {
        const res = calculateIncinerationEmissions(data);
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "waste",
            description: data.description,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, details: res },
            date: new Date().toISOString()
        });
        formIncineration.reset();
    }

    // 4. OTHER FORM
    const formOther = useForm<z.infer<typeof otherSchema>>({
        resolver: zodResolver(otherSchema),
        defaultValues: { type: "other", description: "", gas_name: "", total_emissions_tCO2e: 0, biogenic_emissions_tCO2e: 0 }
    });

    function onSubmitOther(data: z.infer<typeof otherSchema>) {
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "waste",
            description: data.description,
            emissions_tCO2e: data.total_emissions_tCO2e,
            biogenic_tCO2e: data.biogenic_emissions_tCO2e,
            data: { ...data, details: { emissions_tCO2e: data.total_emissions_tCO2e, biogenic_emissions_tCO2e: data.biogenic_emissions_tCO2e } },
            date: new Date().toISOString()
        });
        formOther.reset();
    }

    const totalEmissions = wasteEntries.reduce((s, e) => s + e.emissions_tCO2e, 0);
    const totalBio = wasteEntries.reduce((s, e) => s + e.biogenic_tCO2e, 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Gestão de Resíduos Sólidos (Escopo 1.7 / 3.x)</CardTitle>
                    <CardDescription>Calcule emissões de descarte em aterros, compostagem e incineração.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="landfill">Aterro (Landfill)</TabsTrigger>
                            <TabsTrigger value="compost">Compostagem</TabsTrigger>
                            <TabsTrigger value="incineration">Incineração</TabsTrigger>
                            <TabsTrigger value="other">Outras</TabsTrigger>
                        </TabsList>

                        {/* 1. LANDFILL */}
                        <TabsContent value="landfill">
                            <Form {...formLandfill}>
                                <form onSubmit={formLandfill.handleSubmit(onSubmitLandfill)} className="space-y-6 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formLandfill.control} name="description" render={({ field }) => (
                                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="state" render={({ field }) => (
                                            <FormItem><FormLabel>Estado (UF)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="city" render={({ field }) => (
                                            <FormItem><FormLabel>Município</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="precip_annual" render={({ field }) => (
                                            <FormItem><FormLabel>Precipitação (mm/ano)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    {/* History Table */}
                                    <div className="border rounded p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium">Histórico de Disposição (30 Anos)</h4>
                                            <Button type="button" variant="outline" size="sm" onClick={() => appendHistory({ year: 2024, amount_t: 0, mcf_type: "managed", methane_recovery_t: 0 })}>Add Ano</Button>
                                        </div>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Ano</TableHead><TableHead>Qtd (t)</TableHead><TableHead>Tipo Aterro (MCF)</TableHead><TableHead>Recuperação (tCH4)</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {historyFields.map((field, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell><FormField control={formLandfill.control} name={`history.${index}.year`} render={({ field }) => <Input type="number" {...field} />} /></TableCell>
                                                        <TableCell><FormField control={formLandfill.control} name={`history.${index}.amount_t`} render={({ field }) => <Input type="number" {...field} />} /></TableCell>
                                                        <TableCell>
                                                            <FormField control={formLandfill.control} name={`history.${index}.mcf_type`} render={({ field }) =>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="managed">Gerenciado (MCF 1.0)</SelectItem>
                                                                        <SelectItem value="unmanaged_deep">Não Ger. {">"}5m (0.8)</SelectItem>
                                                                        <SelectItem value="unmanaged_shallow">Não Ger. {"<"}5m (0.4)</SelectItem>
                                                                        <SelectItem value="uncategorized">Outro (0.6)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            } />
                                                        </TableCell>
                                                        <TableCell><FormField control={formLandfill.control} name={`history.${index}.methane_recovery_t`} render={({ field }) => <Input type="number" {...field} />} /></TableCell>
                                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeHistory(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Composition */}
                                    <div className="gap-4 grid grid-cols-4 p-4 border rounded">
                                        <h4 className="col-span-4 font-medium">Composição (%) - Deve somar 100%</h4>
                                        {Object.keys(formLandfill.getValues().composition).map((key) => (
                                            <FormField key={key} control={formLandfill.control} name={`composition.${key as any}`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize">{key.replace('_', ' ')}</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        ))}
                                        <FormMessage>{formLandfill.formState.errors.composition?.root?.message}</FormMessage>
                                    </div>

                                    <Button type="submit">Calcular Aterro</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* 2. COMPOST */}
                        <TabsContent value="compost">
                            <Form {...formCompost}>
                                <form onSubmit={formCompost.handleSubmit(onSubmitCompost)} className="space-y-6 pt-4">
                                    <FormField control={formCompost.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formCompost.control} name="amount_t" render={({ field }) => (
                                            <FormItem><FormLabel>Quantidade Compostada (t)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formCompost.control} name="recovery_ch4_t" render={({ field }) => (
                                            <FormItem><FormLabel>Recuperação CH4 (t)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Calcular Compostagem</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* 3. INCINERATION */}
                        <TabsContent value="incineration">
                            <Form {...formIncineration}>
                                <form onSubmit={formIncineration.handleSubmit(onSubmitIncineration)} className="space-y-6 pt-4">
                                    <FormField control={formIncineration.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={formIncineration.control} name="amount_t" render={({ field }) => (
                                        <FormItem><FormLabel>Quantidade Incinerada (t)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div className="grid grid-cols-4 gap-4 p-4 border rounded">
                                        <h4 className="col-span-4 font-medium">Composição (%) - Deve somar 100%</h4>
                                        {Object.keys(formIncineration.getValues().composition).map((key) => (
                                            <FormField key={key} control={formIncineration.control} name={`composition.${key as any}`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="capitalize">{key}</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        ))}
                                    </div>
                                    <Button type="submit">Calcular Incineração</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* 4. OTHER */}
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
                                        <FormField control={formOther.control} name="biogenic_emissions_tCO2e" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões Biogênicas (tCO2e)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Relatar Outros</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* RESULTS TABLE */}
            {wasteEntries.length > 0 && (
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Card className="flex-1">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{totalEmissions.toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">Emissões Fósseis (tCO2e)</p>
                            </CardContent>
                        </Card>
                        <Card className="flex-1">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{totalBio.toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">Emissões Biogênicas (tCO2e)</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fonte</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead className="text-right">Fóssil (tCO2e)</TableHead>
                                    <TableHead className="text-right">Biogênico</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wasteEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.description}</TableCell>
                                        <TableCell className="capitalize">{entry.data.type || entry.category}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {/* Render details based on type */}
                                            {entry.data.type === 'landfill' && `${(entry.data as any).city} - ${entry.data.details?.emissions_tCO2e.toFixed(2)}t`}
                                            {entry.data.type === 'compost' && `${(entry.data as any).amount_t}t compostado`}
                                            {entry.data.type === 'incineration' && `${(entry.data as any).amount_t}t incinerado`}
                                            {entry.data.type === 'other' && `${(entry.data as any).gas_name}`}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.biogenic_tCO2e.toFixed(4)}</TableCell>
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
