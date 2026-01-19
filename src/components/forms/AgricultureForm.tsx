"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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

import { calculateAgricultureEmissions, AgricultureResult } from "@/lib/calc/agriculture";
import { FUGITIVE_GASES } from "@/lib/constants/gases";

const agricultureEntrySchema = z.object({
    id: z.string().optional(),
    sourceId: z.string().min(1, "Identificação da fonte obrigatória"),
    description: z.string().min(1, "Descrição da fonte obrigatória"),
    activityDescription: z.string().min(1, "Descrição da atividade obrigatória"),
    gasId: z.string().min(1, "Gás obrigatório"),
    quantity: z.coerce.number({ invalid_type_error: "Deve ser um número" }).min(0, "A quantidade deve ser maior ou igual a 0"),
    bio_co2_emission_t: z.coerce.number().min(0).optional().default(0),
    bio_co2_removal_t: z.coerce.number().min(0).optional().default(0),
    details: z.any().optional(),
});

type AgricultureEntry = z.infer<typeof agricultureEntrySchema>;

export function AgricultureForm() {
    const [entries, setEntries] = useState<AgricultureEntry[]>([]);

    // Convert gases object to array and sort by name
    const gasOptions = useMemo(() => {
        return Object.values(FUGITIVE_GASES).sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const form = useForm<AgricultureEntry>({
        resolver: zodResolver(agricultureEntrySchema),
        defaultValues: {
            sourceId: "",
            description: "",
            activityDescription: "",
            gasId: "",
            quantity: 0,
            bio_co2_emission_t: 0,
            bio_co2_removal_t: 0,
        },
    });

    function onSubmit(data: AgricultureEntry) {
        const result = calculateAgricultureEmissions(
            data.gasId,
            data.quantity,
            data.bio_co2_emission_t || 0,
            data.bio_co2_removal_t || 0
        );

        setEntries([...entries, {
            ...data,
            id: crypto.randomUUID(),
            details: result
        }]);

        form.reset({
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
    const totalBioEmissions = entries.reduce((acc, curr) => acc + (curr.bio_co2_emission_t || 0), 0);
    const totalBioRemovals = entries.reduce((acc, curr) => acc + (curr.bio_co2_removal_t || 0), 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Adicionar Atividade Agrícola</h3>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sourceId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Identificação da Fonte</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: CULT-01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição da Fonte</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Área de cultivo soja" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="activityDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição da Atividade</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Aplicação de fertilizante nitrogenado..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gasId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gás de Efeito Estufa (GEE)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o gás gerado" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[300px]">
                                                    {gasOptions.map((gas) => (
                                                        <SelectItem key={gas.id} value={gas.id}>
                                                            {gas.name} (GWP: {gas.gwp})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Emissões do Gás (t)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.0001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                                <FormField
                                    control={form.control}
                                    name="bio_co2_emission_t"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Emissões de CO2 Biogênico (t)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.0001" {...field} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">Opcional - Informativo</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bio_co2_removal_t"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remoções de CO2 Biogênico (t)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.0001" {...field} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">Opcional - Informativo</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Atividade
                            </Button>
                        </form>
                    </Form>
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
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-green-600">{totalBioEmissions.toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">CO2 Biogênico Emitido</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-blue-600">{totalBioRemovals.toFixed(4)} t</div>
                                <p className="text-xs text-muted-foreground">CO2 Biogênico Removido</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fonte</TableHead>
                                    <TableHead>Atividade</TableHead>
                                    <TableHead>Gás</TableHead>
                                    <TableHead className="text-right">Qtd (t)</TableHead>
                                    <TableHead className="text-right">GWP</TableHead>
                                    <TableHead className="text-right">tCO2e</TableHead>
                                    <TableHead className="text-right">Bio CO2 (t)</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {entry.sourceId}
                                            <div className="text-xs text-muted-foreground">{entry.description}</div>
                                        </TableCell>
                                        <TableCell>{entry.activityDescription}</TableCell>
                                        <TableCell>
                                            {FUGITIVE_GASES[entry.gasId]?.name || entry.gasId}
                                        </TableCell>
                                        <TableCell className="text-right">{entry.quantity.toFixed(4)}</TableCell>
                                        <TableCell className="text-right">{FUGITIVE_GASES[entry.gasId]?.gwp}</TableCell>
                                        <TableCell className="text-right font-bold">
                                            {entry.details?.emissions_tCO2e.toFixed(4)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="text-xs">
                                                E: {entry.bio_co2_emission_t?.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-blue-600">
                                                R: {entry.bio_co2_removal_t?.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive text-red-500" />
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
    )
}
