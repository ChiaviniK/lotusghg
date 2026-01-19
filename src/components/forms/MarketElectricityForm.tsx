"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, AlertCircle, Plus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEmissions } from "@/contexts/EmissionsContext";

import { THERMAL_FACTORS } from "@/lib/constants/thermal-fluids";
import { calculateMarketElectricity, MarketElectricityInput } from "@/lib/calc/scope2-market-electricity";

const GUIDELINES = [
    "(A) A unidade de entrada para os cálculos é MWh (megawatt-hora). Se necessário, faça a conversão.",
    "(B) Preencha somente as células em LARANJA CLARO da ferramenta.",
    "(C) Utilize os botões \"+\" à esquerda/direita para inserir novas subseções ou liberar mais linhas.",
    "(D) Os fatores de emissão de GEE por geração de eletricidade estão disponíveis na aba \"Fatores variáveis\".",
    "(E) Relate apenas uma das duas opções (mensal OU anual).",
    "(F) Os fatores de emissão referente ao tipo de fonte devem ser preenchidas pelo usuário."
];

// Schema for Tabela 1 (Specific Source)
const sourceSchema = z.object({
    description: z.string().min(1, "Descrição obrigatória"),
    source_type: z.enum(["thermal", "renewable", "other"]),

    // Thermal specifics
    fuel_id: z.string().optional(),
    boiler_efficiency: z.coerce.number().min(0.1).max(1).optional(),

    // Factors inputs
    has_factor: z.enum(["yes", "no"]),
    custom_co2: z.coerce.number().min(0).optional(),
    custom_ch4: z.coerce.number().min(0).optional(),
    custom_n2o: z.coerce.number().min(0).optional(),
    custom_bio: z.coerce.number().min(0).optional(),

    // Consumption
    method: z.enum(["monthly", "annual"]),
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
    annual_mwh: z.coerce.number().min(0).optional(),
});

// Schema for Tabela 2 (Non-tracked)
const nonTrackedSchema = z.object({
    description: z.string().min(1),
    co2_t: z.coerce.number().min(0),
    ch4_t: z.coerce.number().min(0),
    n2o_t: z.coerce.number().min(0),
    bio_t: z.coerce.number().min(0),
});

export function MarketElectricityForm() {
    const { entries, addEntry, removeEntry } = useEmissions();

    // Filter Entries
    const trackedEntries = useMemo(() => entries.filter(e => e.scope === "scope2" && e.category === "market_electricity_tracked"), [entries]);
    const nonTrackedEntries = useMemo(() => entries.filter(e => e.scope === "scope2" && e.category === "market_electricity_nontracked"), [entries]);

    const [activeTab, setActiveTab] = useState("tracked");

    const formSource = useForm<z.infer<typeof sourceSchema>>({
        resolver: zodResolver(sourceSchema),
        defaultValues: {
            method: "monthly",
            source_type: "thermal",
            has_factor: "no",
            boiler_efficiency: 0.8
        }
    });

    const formNonTracked = useForm<z.infer<typeof nonTrackedSchema>>({
        resolver: zodResolver(nonTrackedSchema),
        defaultValues: { description: "", co2_t: 0, ch4_t: 0, n2o_t: 0, bio_t: 0 }
    });

    function onSubmitSource(data: z.infer<typeof sourceSchema>) {
        // Calculate Total Consumption
        let consumption_mwh = 0;
        if (data.method === "monthly") {
            const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            months.forEach(m => consumption_mwh += (data as any)[m] || 0);
        } else {
            consumption_mwh = data.annual_mwh || 0;
        }

        if (consumption_mwh <= 0) return; // Validation technically handles this but safe check

        const input: MarketElectricityInput = {
            description: data.description,
            source_type: data.source_type as any,
            fuel_id: data.fuel_id,
            boiler_efficiency: data.boiler_efficiency,
            consumption_mwh,
            custom_factors: data.has_factor === "yes" ? {
                co2_t_mwh: data.custom_co2,
                ch4_t_mwh: data.custom_ch4,
                n2o_t_mwh: data.custom_n2o,
                biogenic_co2_t_mwh: data.custom_bio,
            } : undefined
        };

        const res = calculateMarketElectricity(input);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "market_electricity_tracked",
            description: data.description,
            emissions_tCO2e: res.emissions.total_co2e_t,
            biogenic_tCO2e: res.emissions.biogenic_co2_t,
            data: { ...data, input, res },
            date: new Date().toISOString()
        });

        // Reset
        formSource.reset({
            method: "monthly", source_type: "thermal", has_factor: "no", boiler_efficiency: 0.8,
            description: "", fuel_id: ""
        });
    }

    function onSubmitNonTracked(data: z.infer<typeof nonTrackedSchema>) {
        const total_co2e_t = data.co2_t + (data.ch4_t * 28) + (data.n2o_t * 265);
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "market_electricity_nontracked",
            description: data.description,
            emissions_tCO2e: total_co2e_t,
            biogenic_tCO2e: data.bio_t,
            data: { ...data, emissions: { total_co2e_t } },
            date: new Date().toISOString()
        });
        formNonTracked.reset();
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
                    <CardTitle>Abordagem baseada em escolha de compra</CardTitle>
                    <CardDescription>Informe as fontes específicas (Tabela 1) ou parecela não rastreada (Tabela 2).</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="tracked">Tabela 1: Fontes Rastreáveis</TabsTrigger>
                            <TabsTrigger value="nontracked">Tabela 2: Energia Não Rastreada</TabsTrigger>
                        </TabsList>

                        {/* TRACKED TAB */}
                        <TabsContent value="tracked">
                            <Form {...formSource}>
                                <form onSubmit={formSource.handleSubmit(onSubmitSource)} className="space-y-6 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={formSource.control} name="description" render={({ field }) => (
                                            <FormItem><FormLabel>Descrição da Fonte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={formSource.control} name="source_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Fonte</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="thermal">Termoelétrica</SelectItem>
                                                        <SelectItem value="renewable">Renovável (Eólica, Solar, Hidro)</SelectItem>
                                                        <SelectItem value="other">Outra</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </div>

                                    {formSource.watch("source_type") === "thermal" && (
                                        <div className="border p-4 rounded bg-muted/20 grid grid-cols-2 gap-4">
                                            <FormField control={formSource.control} name="fuel_id" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Combustível</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                        <SelectContent className="max-h-[200px]">
                                                            {THERMAL_FACTORS.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={formSource.control} name="boiler_efficiency" render={({ field }) => (
                                                <FormItem><FormLabel>Eficiência da Planta (0-1)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    )}

                                    <FormField control={formSource.control} name="has_factor" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Possui Fator de Emissão Específico?</FormLabel>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">Não (Estimar)</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormItem>
                                    )} />

                                    {formSource.watch("has_factor") === "yes" && (
                                        <div className="grid grid-cols-4 gap-4">
                                            <FormField control={formSource.control} name="custom_co2" render={({ field }) => (
                                                <FormItem><FormLabel>tCO2/MWh</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={formSource.control} name="custom_ch4" render={({ field }) => (
                                                <FormItem><FormLabel>tCH4/MWh</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={formSource.control} name="custom_n2o" render={({ field }) => (
                                                <FormItem><FormLabel>tN2O/MWh</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={formSource.control} name="custom_bio" render={({ field }) => (
                                                <FormItem><FormLabel>Bio tCO2/MWh</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <FormField control={formSource.control} name="method" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registro de Compra</FormLabel>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="monthly" /></FormControl><FormLabel className="font-normal">Mensal</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="annual" /></FormControl><FormLabel className="font-normal">Anual</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormItem>
                                        )} />

                                        {formSource.watch("method") === "monthly" ? (
                                            <div className="grid grid-cols-4 gap-4 border p-4 rounded">
                                                {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(month => (
                                                    <FormField key={month} control={formSource.control} name={month as any} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="uppercase text-xs">{month}</FormLabel>
                                                            <FormControl><Input type="number" {...field} /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                ))}
                                            </div>
                                        ) : (
                                            <FormField control={formSource.control} name="annual_mwh" render={({ field }) => (
                                                <FormItem><FormLabel>Consumo Anual (MWh)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                            )} />
                                        )}
                                    </div>

                                    <Button type="submit">Adicionar Fonte Rastreável</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* NON-TRACKED TAB */}
                        <TabsContent value="nontracked">
                            <Form {...formNonTracked}>
                                <form onSubmit={formNonTracked.handleSubmit(onSubmitNonTracked)} className="space-y-6 pt-4">
                                    <FormField control={formNonTracked.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição (ex: Energia Residual)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <div className="grid grid-cols-4 gap-4">
                                        <FormField control={formNonTracked.control} name="co2_t" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões CO2 (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={formNonTracked.control} name="ch4_t" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões CH4 (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={formNonTracked.control} name="n2o_t" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões N2O (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={formNonTracked.control} name="bio_t" render={({ field }) => (
                                            <FormItem><FormLabel>Bio CO2 (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <Button type="submit">Adicionar Energia Não Rastreada</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* SUMMARY TABLES */}
            {(trackedEntries.length > 0 || nonTrackedEntries.length > 0) && (
                <div className="space-y-8">
                    {/* Tabela 1 Results */}
                    {trackedEntries.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Fontes Rastreáveis (Tabela 1)</h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fonte</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>MWh</TableHead>
                                            <TableHead>Fator CO2 (t/MWh)</TableHead>
                                            <TableHead className="text-right">Total (tCO2e)</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trackedEntries.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell className="font-medium">{entry.description}</TableCell>
                                                <TableCell className="capitalize">{entry.data.input.source_type}</TableCell>
                                                <TableCell>{entry.data.input.consumption_mwh.toFixed(2)}</TableCell>
                                                <TableCell>{entry.data.res.used_factors.co2_t_mwh.toFixed(4)} {entry.data.res.is_estimated ? '(Est)' : ''}</TableCell>
                                                <TableCell className="text-right font-bold">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
                                                <TableCell><Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Tabela 3 Summary */}
                    <Card>
                        <CardHeader><CardTitle>Total Consolidados (Tabela 3 & 4)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Total Compra de Eletricidade (Tabela 4)</h4>
                                    <div className="text-3xl font-bold">
                                        {(trackedEntries.reduce((a, b) => a + (b.emissions_tCO2e || 0), 0) + nonTrackedEntries.reduce((a, b) => a + (b.emissions_tCO2e || 0), 0)).toFixed(4)} tCO2e
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Rastreada: {trackedEntries.reduce((a, b) => a + (b.emissions_tCO2e || 0), 0).toFixed(4)} t</p>
                                    <p>Não Rastreada: {nonTrackedEntries.reduce((a, b) => a + (b.emissions_tCO2e || 0), 0).toFixed(4)} t</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
