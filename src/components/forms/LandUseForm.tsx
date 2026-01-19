"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { calculateLandUseChange, calculateLandUseOtherTools, LandUseResult } from "@/lib/calc/land-use";
import { LAND_USE_TYPES } from "@/lib/constants/land-use";

// Constants for Tabela 3 (Specific subset of gases)
const LAND_USE_GASES = [
    { id: "di_xido_de_carbono_co2", name: "Dióxido de carbono (CO2)", gwp: 1.0 },
    { id: "metano_ch4", name: "Metano (CH4)", gwp: 28.0 },
    { id: "xido_nitroso_n2o", name: "Óxido nitroso (N2O)", gwp: 265.0 },
];

// Schema for Table 1 (Native Calculation)
const landUseCalcSchema = z.object({
    id: z.string().optional(),
    type: z.literal("calc"),
    sourceId: z.string().min(1, "Identificação da fonte obrigatória"),
    description: z.string().min(1, "Descrição da fonte obrigatória"),
    initialUse: z.string().min(1, "Uso inicial obrigatório"),
    finalUse: z.string().min(1, "Uso final obrigatório"),
    area: z.coerce.number().min(0, "Área deve ser maior que 0"),
    manual_emission_tCO2e: z.coerce.number().default(0),
    bio_co2_emission_t: z.coerce.number().optional().default(0),
    bio_co2_removal_t: z.coerce.number().optional().default(0),
});

type LandUseCalcData = z.infer<typeof landUseCalcSchema>;

// Schema for Table 3 (Other Tools)
const landUseOtherSchema = z.object({
    id: z.string().optional(),
    type: z.literal("other"),
    sourceId: z.string().min(1, "Identificação da fonte obrigatória"),
    description: z.string().min(1, "Descrição da fonte obrigatória"),
    activityDescription: z.string().min(1, "Descrição da atividade obrigatória"),
    gasId: z.string().min(1, "Gás obrigatório"),
    quantity: z.coerce.number().min(0, "Quantidade deve ser maior que 0"),
    bio_co2_emission_t: z.coerce.number().optional().default(0),
    bio_co2_removal_t: z.coerce.number().optional().default(0),
});

type LandUseOtherData = z.infer<typeof landUseOtherSchema>;

// Unified Data Type
type LandUseEntry =
    | (LandUseCalcData & { details?: LandUseResult })
    | (LandUseOtherData & { details?: LandUseResult });

export function LandUseForm() {
    const [entries, setEntries] = useState<LandUseEntry[]>([]);
    const [mode, setMode] = useState<"calc" | "other">("calc");

    const formCalc = useForm<LandUseCalcData>({
        // @ts-ignore
        resolver: zodResolver(landUseCalcSchema),
        defaultValues: {
            type: "calc",
            sourceId: "",
            description: "",
            initialUse: "",
            finalUse: "",
            area: 0,
            manual_emission_tCO2e: 0,
            bio_co2_emission_t: 0,
            bio_co2_removal_t: 0,
        },
    });

    const formOther = useForm<LandUseOtherData>({
        // @ts-ignore
        resolver: zodResolver(landUseOtherSchema),
        defaultValues: {
            type: "other",
            sourceId: "",
            description: "",
            activityDescription: "",
            gasId: "",
            quantity: 0,
            bio_co2_emission_t: 0,
            bio_co2_removal_t: 0,
        },
    });

    function onSubmitCalc(data: LandUseCalcData) {
        const result = calculateLandUseChange(
            data.manual_emission_tCO2e,
            data.bio_co2_emission_t,
            data.bio_co2_removal_t
        );

        setEntries([...entries, {
            ...data,
            id: crypto.randomUUID(),
            details: result
        }]);

        formCalc.reset({
            type: "calc",
            sourceId: "",
            description: "",
            initialUse: "",
            finalUse: "",
            area: 0,
            manual_emission_tCO2e: 0,
            bio_co2_emission_t: 0,
            bio_co2_removal_t: 0,
        });
    }

    function onSubmitOther(data: LandUseOtherData) {
        const result = calculateLandUseOtherTools(
            data.gasId,
            data.quantity,
            data.bio_co2_emission_t,
            data.bio_co2_removal_t
        );

        setEntries([...entries, {
            ...data,
            id: crypto.randomUUID(),
            details: result
        }]);

        formOther.reset({
            type: "other",
            sourceId: "",
            description: "",
            activityDescription: "",
            gasId: "",
            quantity: 0,
            bio_co2_emission_t: 0,
            bio_co2_removal_t: 0,
        });
    }

    function removeEntry(index: number) {
        setEntries(entries.filter((_, i) => i !== index));
    }

    const totalEmissions = entries.reduce((acc, curr) => acc + (curr.details?.emissions_tCO2e || 0), 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-medium">Adicionar Mudança no Uso do Solo</h3>

                        <RadioGroup defaultValue="calc" value={mode} onValueChange={(v) => setMode(v as "calc" | "other")} className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="calc" id="mode-calc" />
                                <Label htmlFor="mode-calc">Mudança no Uso do Solo (Tabela 1 - Manual)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="mode-other" />
                                <Label htmlFor="mode-other">Outras Ferramentas (Tabela 3)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {mode === "calc" ? (
                        <Form {...formCalc} key="calc">
                            <form onSubmit={formCalc.handleSubmit(onSubmitCalc)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={formCalc.control}
                                        name="sourceId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Identificação da Fonte</FormLabel>
                                                <FormControl><Input {...field} /></FormControl><FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formCalc.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição da Fonte</FormLabel>
                                                <FormControl><Input {...field} /></FormControl><FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={formCalc.control}
                                        name="initialUse"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Uso Inicial</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {LAND_USE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formCalc.control}
                                        name="finalUse"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Uso Final</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {LAND_USE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={formCalc.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Área (ha)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formCalc.control}
                                        name="manual_emission_tCO2e"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Emissões Calc. (tCO2e)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        {...field}
                                                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">Preencher manualmente baseado em cálculo externo (dCarbon).</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit"><Plus className="mr-2 h-4 w-4" /> Adicionar (Mus)</Button>
                            </form>
                        </Form>
                    ) : (
                        <Form {...formOther} key="other">
                            <form onSubmit={formOther.handleSubmit(onSubmitOther)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={formOther.control}
                                        name="sourceId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Identificação da Fonte</FormLabel>
                                                <FormControl><Input {...field} /></FormControl><FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formOther.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição da Fonte</FormLabel>
                                                <FormControl><Input {...field} /></FormControl><FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={formOther.control}
                                    name="activityDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição da Atividade</FormLabel>
                                            <FormControl><Input {...field} /></FormControl><FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={formOther.control}
                                        name="gasId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Gás de Efeito Estufa</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        {LAND_USE_GASES.map((g) => (
                                                            <FormItem key={g.id} className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value={g.id} />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {g.name} (GWP: {g.gwp})
                                                                </FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formOther.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantidade (t GEE)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        {...field}
                                                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit"><Plus className="mr-2 h-4 w-4" /> Adicionar (Outras Ferramentas)</Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>

            {entries.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{totalEmissions.toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">Emissões Totais (tCO2e)</p>
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
                                    <TableHead className="text-right">Emissão (tCO2e)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, index) => {
                                    const gasName =
                                        entry.type === 'other' && entry.gasId
                                            ? LAND_USE_GASES.find(g => g.id === entry.gasId)?.name
                                            : '';

                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {entry.sourceId}
                                                <div className="text-xs text-muted-foreground">{entry.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                {entry.type === 'calc' ? 'Tabela 1 (MUS)' : 'Tabela 3 (Outras)'}
                                            </TableCell>
                                            <TableCell>
                                                {entry.type === 'calc' ? (
                                                    <div className="text-xs">
                                                        {entry.initialUse} -&gt; {entry.finalUse} ({entry.area} ha)
                                                    </div>
                                                ) : (
                                                    <div className="text-xs">
                                                        {(entry as any).activityDescription} <br />
                                                        <span className="text-muted-foreground">{gasName}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {entry.details?.emissions_tCO2e.toFixed(4)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}