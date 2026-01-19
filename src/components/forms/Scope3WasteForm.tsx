"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Save } from "lucide-react";
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
import { useEmissions } from "@/contexts/EmissionsContext";

import {
    calculateScope3LandfillEmissions,
    calculateCompostEmissions,
    calculateIncinerationEmissions,
    Scope3LandfillInput,
    WasteResult
} from "@/lib/calc/waste";

// --------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------

// Landfill Schema (Scope 3)
const landfillSchema = z.object({
    description: z.string().min(1, "Descrição obrigatória"),
    state: z.string().min(2, "UF obrigatória"),
    city: z.string().min(1, "Município obrigatório"),
    temp_avg: z.coerce.number(),
    precip_annual: z.coerce.number(),
    // Activity Data (Year 0)
    amount_t: z.coerce.number().min(0),
    mcf_type: z.enum(["managed", "unmanaged_deep", "unmanaged_shallow", "uncategorized"]),
    methane_recovery_t: z.coerce.number().min(0).default(0),
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

// Composting Schema
const compostSchema = z.object({
    description: z.string().min(1),
    amount_t: z.coerce.number().min(0),
    recovery_ch4_t: z.coerce.number().min(0).default(0),
    ch4_factor: z.coerce.number().optional(),
    n2o_factor: z.coerce.number().optional(),
});

// Incineration Schema
const incinerationSchema = z.object({
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

export function Scope3WasteForm() {
    const { addEntry, entries, removeEntry } = useEmissions();
    const [activeTab, setActiveTab] = useState("landfill");

    // Filter relevant entries
    const wasteEntries = useMemo(() => entries.filter(e => e.category === "scope3_waste"), [entries]);

    const formLandfill = useForm<z.infer<typeof landfillSchema>>({
        resolver: zodResolver(landfillSchema),
        defaultValues: {
            state: "", city: "", temp_avg: 20, precip_annual: 1200, amount_t: 0, mcf_type: "managed", methane_recovery_t: 0,
            composition: { food_waste: 0, garden: 0, paper: 0, wood: 0, textile: 0, nappies: 0, sludge: 0, other: 100 }
        }
    });

    const formCompost = useForm<z.infer<typeof compostSchema>>({
        resolver: zodResolver(compostSchema),
        defaultValues: { description: "", amount_t: 0, recovery_ch4_t: 0 }
    });

    const formIncineration = useForm<z.infer<typeof incinerationSchema>>({
        resolver: zodResolver(incinerationSchema),
        defaultValues: {
            description: "", amount_t: 0,
            composition: { paper: 0, textile: 0, wood: 0, food: 0, garden: 0, sludge: 0, plastic: 0, metal: 0, glass: 0, other: 100 }
        }
    });

    function onSubmitLandfill(data: z.infer<typeof landfillSchema>) {
        const input: Scope3LandfillInput = {
            amount_t: data.amount_t,
            composition: data.composition,
            site: { temp_avg: data.temp_avg, precip_annual: data.precip_annual },
            mcf_type: data.mcf_type,
            methane_recovery_t: data.methane_recovery_t
        };
        const res = calculateScope3LandfillEmissions(input);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "scope3_waste",
            description: `Aterro: ${data.description}`,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, type: "landfill", details: res },
            date: new Date().toISOString()
        });
        formLandfill.reset();
    }

    function onSubmitCompost(data: z.infer<typeof compostSchema>) {
        const res = calculateCompostEmissions(data);
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "scope3_waste",
            description: `Compostagem: ${data.description}`,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, type: "compost", details: res },
            date: new Date().toISOString()
        });
        formCompost.reset();
    }

    function onSubmitIncineration(data: z.infer<typeof incinerationSchema>) {
        const res = calculateIncinerationEmissions(data);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "scope3_waste",
            description: `Incineração: ${data.description}`,
            emissions_tCO2e: res.emissions_tCO2e,
            biogenic_tCO2e: res.biogenic_emissions_tCO2e,
            data: { ...data, type: "incineration", details: res },
            date: new Date().toISOString()
        });
        formIncineration.reset();
    }

    const totalFossil = wasteEntries.reduce((acc, curr) => acc + curr.emissions_tCO2e, 0);
    const totalBio = wasteEntries.reduce((acc, curr) => acc + curr.biogenic_tCO2e, 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Resíduos Sólidos da Operação (Escopo 3)</CardTitle>
                    <CardDescription>
                        Esta categoria inclui as emissões do tratamento e/ou disposição final dos resíduos sólidos gerados na operação.
                        As emissões futuras (Aterros) são alocadas no ano de geração.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="landfill">Aterro (Resíduos Aterrados)</TabsTrigger>
                            <TabsTrigger value="compost">Compostagem</TabsTrigger>
                            <TabsTrigger value="incineration">Incineração</TabsTrigger>
                        </TabsList>

                        {/* LANDFILL */}
                        <TabsContent value="landfill">
                            <Form {...formLandfill}>
                                <form onSubmit={formLandfill.handleSubmit(onSubmitLandfill)} className="space-y-6 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formLandfill.control} name="description" render={({ field }) => (
                                            <FormItem><FormLabel>Descrição / Local</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="amount_t" render={({ field }) => (
                                            <FormItem><FormLabel>Quantidade enviada ao Aterro (t/ano)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="state" render={({ field }) => (
                                            <FormItem><FormLabel>Estado (UF)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="city" render={({ field }) => (
                                            <FormItem><FormLabel>Município</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="precip_annual" render={({ field }) => (
                                            <FormItem><FormLabel>Precipitação (mm/ano) - Define decaimento</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="mcf_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Qualidade do Aterro (MCF)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="managed">Aterro Sanitário (Gerenciado) - 1.0</SelectItem>
                                                        <SelectItem value="unmanaged_deep">Não Gerenciado ({">"}5m) - 0.8</SelectItem>
                                                        <SelectItem value="unmanaged_shallow">Não Gerenciado ({"<"}5m) - 0.4</SelectItem>
                                                        <SelectItem value="uncategorized">Não Categorizado - 0.6</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={formLandfill.control} name="methane_recovery_t" render={({ field }) => (
                                            <FormItem><FormLabel>Recuperação de CH4 (t) - Opcional</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <div className="p-4 border rounded-md">
                                        <h4 className="mb-4 font-medium">Composição (%)</h4>
                                        <div className="grid grid-cols-4 gap-4">
                                            {Object.keys(formLandfill.getValues().composition).map((key) => (
                                                <FormField key={key} control={formLandfill.control} name={`composition.${key as any}`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="capitalize text-xs">{key.replace('_', ' ')}</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                        <FormMessage>{formLandfill.formState.errors.composition?.root?.message}</FormMessage>
                                    </div>

                                    <Button type="submit">Calcular e Adicionar</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* COMPOST */}
                        <TabsContent value="compost">
                            <Form {...formCompost}>
                                <form onSubmit={formCompost.handleSubmit(onSubmitCompost)} className="space-y-6 pt-4">
                                    <FormField control={formCompost.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formCompost.control} name="amount_t" render={({ field }) => (
                                            <FormItem><FormLabel>Quantidade Compostada (t)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formCompost.control} name="recovery_ch4_t" render={({ field }) => (
                                            <FormItem><FormLabel>Recuperação CH4 (t)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Calcular e Adicionar</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* INCINERATION */}
                        <TabsContent value="incineration">
                            <Form {...formIncineration}>
                                <form onSubmit={formIncineration.handleSubmit(onSubmitIncineration)} className="space-y-6 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formIncineration.control} name="description" render={({ field }) => (
                                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formIncineration.control} name="amount_t" render={({ field }) => (
                                            <FormItem><FormLabel>Quantidade Incinerada (t)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <div className="p-4 border rounded-md">
                                        <h4 className="mb-4 font-medium">Composição (%)</h4>
                                        <div className="grid grid-cols-5 gap-4">
                                            {Object.keys(formIncineration.getValues().composition).map((key) => (
                                                <FormField key={key} control={formIncineration.control} name={`composition.${key as any}`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="capitalize text-xs">{key}</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                    </div>
                                    <Button type="submit">Calcular e Adicionar</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* RESULTS */}
            {wasteEntries.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Tabela 4. Emissões totais de resíduos sólidos (Escopo 3)</h3>

                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold">{totalFossil.toFixed(4)}</div>
                                <p className="text-sm text-muted-foreground">Emissões Fósseis Totais (tCO2e)</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold">{totalBio.toFixed(4)}</div>
                                <p className="text-sm text-muted-foreground">Emissões Biogênicas Totais (tCO2e)</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">Fóssil (tCO2e)</TableHead>
                                    <TableHead className="text-right">Biogênico (tCO2e)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wasteEntries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell className="capitalize">
                                            {entry.data.type === 'landfill' && 'Aterro'}
                                            {entry.data.type === 'compost' && 'Compostagem'}
                                            {entry.data.type === 'incineration' && 'Incineração'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
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

                    {/* Show Decay Curve Table for Landfill Entries */}
                    {activeTab === 'landfill' && wasteEntries.some(e => e.data.type === 'landfill') && (
                        <div className="mt-8">
                            <h4 className="text-md font-semibold mb-2">Projeção de Decomposição (Tabela 1 - Exemplo do último registro)</h4>
                            <Card className="bg-muted/20">
                                <CardContent className="pt-6 overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ano</TableHead>
                                                {Array.from({ length: 15 }).map((_, i) => <TableHead key={i} className="min-w-[50px] text-xs text-center">{i}</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {wasteEntries.filter(e => e.data.type === 'landfill').slice(-1).map(entry => {
                                                const years = (entry.data.details as any)?.yearly_emissions || [];
                                                return (
                                                    <TableRow key={entry.id}>
                                                        <TableCell className="font-medium whitespace-nowrap">{entry.description}</TableCell>
                                                        {years.slice(0, 15).map((val: number, i: number) => (
                                                            <TableCell key={i} className="text-xs text-right">{val.toFixed(3)}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    <p className="text-xs text-muted-foreground mt-2">Exibindo curva de decomposição para os primeiros 15 anos (tCO2e/ano).</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
