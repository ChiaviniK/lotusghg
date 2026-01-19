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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEmissions } from "@/contexts/EmissionsContext";

import { TD_LOSS_FACTOR_2024, SIN_CHARGES_2024, SIN_CH4_FACTOR, SIN_N2O_FACTOR } from "@/lib/constants/grid-factors";

// Guidelines
const GUIDELINES = [
    "(A) A unidade de entrada para os cálculos é MWh (megawatt-hora). Se necessário, faça a conversão.",
    "(B) Preencha somente as células em LARANJA CLARO da ferramenta.",
    "(C) Utilize os botões \"+\" à esquerda para escolher as subseções da ferramenta que deseja inserir informações.",
    "(D) Os fatores de emissão de GEE por geração de eletricidade estão disponíveis na aba \"Fatores variáveis\".",
    "(E) Relate apenas uma das duas opções (mensal OU anual) para a estimativa das emissões. A opção mensal é mais indicada que a anual."
];

// --------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------

const sinLossSchema = z.object({
    description: z.string().min(1, "Descrição obrigatória"),
    method: z.enum(["monthly", "annual"]),
    // Monthly Loss inputs (MWh) - Directly inputting LOSS or CONSUMPTION? 
    // User text says "Relate aqui a perda mensal". I will assume user inputs LOSS directly as per their request text, 
    // BUT usually they know Consumption. I'll add "Consumption" input and auto-calc Loss for UX, but focus on the Loss result.
    // Let's stick to "Consumption Input" -> "Detailed Breakdown of Loss".
    input_type: z.enum(["consumption", "direct_loss"]).default("consumption"),

    // Monthly MWh (Consumption or Loss depending on mode)
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

const isolatedLossSchema = z.object({
    description: z.string().min(1),
    co2_emissions: z.coerce.number().min(0),
    ch4_emissions: z.coerce.number().min(0),
    n2o_emissions: z.coerce.number().min(0),
    biogenic_co2_emissions: z.coerce.number().min(0),
});

export function TdLossesForm() {
    const { entries, addEntry, removeEntry } = useEmissions();

    // Filter for Scope 2 Location T&D
    const tdEntries = useMemo(() =>
        entries.filter(e => e.category === "td_losses_location"),
        [entries]);

    const [activeTab, setActiveTab] = useState("sin");

    const formSin = useForm<z.infer<typeof sinLossSchema>>({
        resolver: zodResolver(sinLossSchema),
        defaultValues: {
            method: "monthly",
            input_type: "consumption",
            description: "",
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
            annual_mwh: 0
        }
    });

    const formIsolated = useForm<z.infer<typeof isolatedLossSchema>>({
        resolver: zodResolver(isolatedLossSchema),
        defaultValues: {
            description: "",
            co2_emissions: 0, ch4_emissions: 0, n2o_emissions: 0, biogenic_co2_emissions: 0
        }
    });

    function calculateSinRow(mwh: number, month: string | 'avg') {
        // 1. Calculate Loss MWh
        // If input is Consumption, Loss = MWh * 0.15. If input is Direct Loss, Loss = MWh.
        const inputType = formSin.getValues("input_type");
        const lossMwh = inputType === "consumption" ? mwh * TD_LOSS_FACTOR_2024 : mwh;

        // 2. Emissions from Loss
        const factor = month === 'avg' ? SIN_CHARGES_2024.average : (SIN_CHARGES_2024[month as keyof typeof SIN_CHARGES_2024] || SIN_CHARGES_2024.average);

        return {
            lossMwh,
            co2: lossMwh * factor,
            ch4: lossMwh * SIN_CH4_FACTOR,
            n2o: lossMwh * SIN_N2O_FACTOR
        };
    }

    function onSubmitSin(data: z.infer<typeof sinLossSchema>) {
        let totalLossMwh = 0;
        let totalCO2 = 0;
        let totalCH4 = 0;
        let totalN2O = 0;

        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

        if (data.method === "monthly") {
            months.forEach(m => {
                const val = (data as any)[m] || 0;
                if (val > 0) {
                    const res = calculateSinRow(val, m);
                    totalLossMwh += res.lossMwh;
                    totalCO2 += res.co2;
                    totalCH4 += res.ch4;
                    totalN2O += res.n2o;
                }
            });
        } else {
            const res = calculateSinRow(data.annual_mwh || 0, 'avg');
            totalLossMwh = res.lossMwh;
            totalCO2 = res.co2;
            totalCH4 = res.ch4;
            totalN2O = res.n2o;
        }

        // GWP (using AR5 or standard - typically CO2=1, CH4=28, N2O=265) - hardcoding standard 100y GWP for now
        const tCO2e = totalCO2 + (totalCH4 * 28) + (totalN2O * 265);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2", // or scope 3.3
            category: "td_losses_location",
            description: data.description,
            emissions_tCO2e: tCO2e,
            biogenic_tCO2e: 0,
            data: {
                ...data,
                type: "sin",
                totalLossMwh,
                details: { totalCO2, totalCH4, totalN2O }
            },
            date: new Date().toISOString()
        });

        formSin.reset({ method: "monthly", input_type: "consumption", description: "", annual_mwh: 0, jan: 0, feb: 0 });
    }

    function onSubmitIsolated(data: z.infer<typeof isolatedLossSchema>) {
        const tCO2e = data.co2_emissions + (data.ch4_emissions * 28) + (data.n2o_emissions * 265);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope2",
            category: "td_losses_location",
            description: data.description,
            emissions_tCO2e: tCO2e,
            biogenic_tCO2e: data.biogenic_co2_emissions,
            data: {
                ...data,
                type: "isolated",
                details: {
                    totalCO2: data.co2_emissions,
                    totalCH4: data.ch4_emissions,
                    totalN2O: data.n2o_emissions
                }
            },
            date: new Date().toISOString()
        });
        formIsolated.reset();
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
                    <CardTitle>2.2 Perdas T&D (Abordagem Localização)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="sin">SIN (Tabela 1)</TabsTrigger>
                            <TabsTrigger value="isolated">Sistemas Isolados (Tabela 3)</TabsTrigger>
                        </TabsList>

                        {/* SIN TAB */}
                        <TabsContent value="sin">
                            <Form {...formSin}>
                                <form onSubmit={formSin.handleSubmit(onSubmitSin)} className="space-y-6 pt-4">
                                    <FormField control={formSin.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Registro da Fonte / Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-muted/20">
                                        <FormField control={formSin.control} name="input_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Dado</FormLabel>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="consumption" /></FormControl><FormLabel className="font-normal">Consumo (Calcula Perda)</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="direct_loss" /></FormControl><FormLabel className="font-normal">Perda Direta (Já calculada)</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormItem>
                                        )} />

                                        <FormField control={formSin.control} name="method" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Periodicidade</FormLabel>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="monthly" /></FormControl><FormLabel className="font-normal">Mensal</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="annual" /></FormControl><FormLabel className="font-normal">Anual</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormItem>
                                        )} />
                                    </div>

                                    {formSin.watch("method") === "monthly" ? (
                                        <div className="grid grid-cols-4 gap-4">
                                            {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(month => (
                                                <FormField key={month} control={formSin.control} name={month as any} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="uppercase">{month}</FormLabel>
                                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                    ) : (
                                        <FormField control={formSin.control} name="annual_mwh" render={({ field }) => (
                                            <FormItem><FormLabel>Quantidade Manual (MWh)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                        )} />
                                    )}

                                    <Button type="submit">Calcular Perdas SIN</Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* ISOLATED TAB */}
                        <TabsContent value="isolated">
                            <Form {...formIsolated}>
                                <form onSubmit={formIsolated.handleSubmit(onSubmitIsolated)} className="space-y-6 pt-4">
                                    <FormField control={formIsolated.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição da Fonte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField control={formIsolated.control} name="co2_emissions" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões CO2 (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={formIsolated.control} name="ch4_emissions" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões CH4 (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={formIsolated.control} name="n2o_emissions" render={({ field }) => (
                                            <FormItem><FormLabel>Emissões N2O (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={formIsolated.control} name="biogenic_co2_emissions" render={({ field }) => (
                                        <FormItem><FormLabel>CO2 Biogênico (t)</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem>
                                    )} />

                                    <Button type="submit">Registrar Sistema Isolado</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* RESULTS */}
            {tdEntries.length > 0 && (
                <div className="space-y-4">
                    <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{tdEntries.reduce((a, b) => a + b.emissions_tCO2e, 0).toFixed(4)} t</div><p className="text-xs text-muted-foreground">Total Emissões T&D (tCO2e)</p></CardContent></Card>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fonte</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">Perda (MWh)</TableHead>
                                    <TableHead className="text-right">CO2 (t)</TableHead>
                                    <TableHead className="text-right">CH4 (t)</TableHead>
                                    <TableHead className="text-right">N2O (t)</TableHead>
                                    <TableHead className="text-right">Total (tCO2e)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tdEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.description}</TableCell>
                                        <TableCell className="capitalize">{entry.data.type}</TableCell>
                                        <TableCell className="text-right">{entry.data.totalLossMwh?.toFixed(4) || '-'}</TableCell>
                                        <TableCell className="text-right">{entry.data.details.totalCO2.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.data.details.totalCH4.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{entry.data.details.totalN2O.toFixed(4)}</TableCell>
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
