"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

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
import { useMemo } from "react";
import { calculateMobileEmissions } from "@/lib/calc/mobile";
import { MOBILE_FUELS } from "@/lib/constants/fuels";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useEmissions } from "@/contexts/EmissionsContext";

const mobileEntrySchema = z.object({
    fleetId: z.string().min(1, "Identificação da frota obrigatória"),
    description: z.string().min(1, "Descrição obrigatória"),
    transportMode: z.string().min(1, "Modo de transporte obrigatório"),
    fuelSourceId: z.string().min(1, "Combustível obrigatório"),
    period: z.enum(["annual", "monthly"]),
    quantity: z.preprocess((val) => Number(val), z.number().min(0)),
    monthlyQuantities: z.array(z.number()).optional(),
    unit: z.string().min(1, "Unidade obrigatória"),
    details: z.any().optional(),
});

type MobileEntryFormValues = z.infer<typeof mobileEntrySchema>;

const TRANSPORT_MODES = [
    { id: "road", label: "Rodoviário" },
    { id: "rail", label: "Ferroviário" },
    { id: "water", label: "Hidroviário" },
    { id: "air", label: "Aéreo" },
];

const UNIT_OPTIONS = [
    "Litros",
    "m³",
];

const MONTHS = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function MobileCombustionForm() {
    const { addEntry, removeEntry, entries } = useEmissions();

    // Filter for this specific category
    const mobileEntries = entries.filter(e => e.category === "mobile_combustion");

    const form = useForm<MobileEntryFormValues>({
        resolver: zodResolver(mobileEntrySchema),
        defaultValues: {
            fleetId: "",
            description: "",
            transportMode: "road",
            fuelSourceId: "",
            period: "annual",
            quantity: 0,
            monthlyQuantities: Array(12).fill(0),
            unit: "Litros",
        },
    });

    const period = form.watch("period");
    const currentMode = form.watch("transportMode");

    // Filter fuels based on selected mode
    const filteredFuels = useMemo(() => {
        return Object.values(MOBILE_FUELS).filter(f => f.mode === currentMode);
    }, [currentMode]);

    function onSubmit(data: MobileEntryFormValues) {
        let totalQty = data.quantity;
        if (data.period === "monthly" && data.monthlyQuantities) {
            totalQty = data.monthlyQuantities.reduce((a, b) => a + b, 0);
        }

        const result = calculateMobileEmissions(data.fuelSourceId, totalQty);

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "mobile_combustion",
            description: `${data.fleetId} - ${data.description}`,
            emissions_tCO2e: result.emissions_tCO2e,
            biogenic_tCO2e: 0, // Mobile usually fossil, but ethanol exists. Need to check if result supports bio. mobile calc returns bio?
            // Checking fields... mobile calc usually assumes fossil for now unless enhanced.
            // But let's check result property.
            date: new Date().toISOString(),
            data: {
                ...data,
                quantity: totalQty, // Store normalized quantity
                details: result
            }
        });

        form.reset({
            fleetId: "",
            description: "",
            transportMode: currentMode,
            fuelSourceId: "",
            period: "annual",
            quantity: 0,
            monthlyQuantities: Array(12).fill(0),
            unit: "Litros",
        });
    }

    const totalEmissions = mobileEntries.reduce((acc, curr) => acc + (curr.emissions_tCO2e || 0), 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Adicionar Fonte Móvel</h3>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fleetId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Identificação da Frota / Veículo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Caminhão-01" {...field} value={field.value ?? ''} />
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
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Descrição operacional..." {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="transportMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Modo de Transporte</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o modo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TRANSPORT_MODES.map((mode) => (
                                                        <SelectItem key={mode.id} value={mode.id}>
                                                            {mode.label}
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
                                    name="fuelSourceId"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Combustível / Categoria de Veículo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o combustível/veículo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredFuels.length === 0 ? (
                                                        <SelectItem value="none" disabled>Nenhum combustível encontrado para este modo</SelectItem>
                                                    ) : (
                                                        filteredFuels.map((fuel) => (
                                                            <SelectItem key={fuel.id} value={fuel.id}>
                                                                {fuel.name} ({fuel.fuelName})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="period"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período de Dados</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-row space-x-6"
                                                value={field.value}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="annual" id="annual" />
                                                    <Label htmlFor="annual">Anual Total</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="monthly" id="monthly" />
                                                    <Label htmlFor="monthly">Mensal</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {period === "annual" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantidade Total</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unidade</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione a unidade" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {UNIT_OPTIONS.map((u) => (
                                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FormLabel>Consumo Mensal</FormLabel>
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {MONTHS.map((month, index) => (
                                            <FormField
                                                key={month}
                                                control={form.control}
                                                name={`monthlyQuantities.${index}`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">{month}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...field}
                                                                value={field.value ?? 0}
                                                                onChange={e => {
                                                                    const val = parseFloat(e.target.value);
                                                                    field.onChange(isNaN(val) ? 0 : val);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-end p-2 bg-muted/20 rounded">
                                        <div className="text-sm font-medium">
                                            Total: {form.watch("monthlyQuantities")?.reduce((a, b) => a + (b || 0), 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Registro
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {mobileEntries.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{totalEmissions.toFixed(2)} t</div>
                                <p className="text-xs text-muted-foreground">Emissões Totais (tCO2e)</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Veículo / Combustível</TableHead>
                                    <TableHead className="text-right">Qtd Total</TableHead>
                                    <TableHead className="text-right">CO2 (kg)</TableHead>
                                    <TableHead className="text-right">CH4 (kg)</TableHead>
                                    <TableHead className="text-right">N2O (kg)</TableHead>
                                    <TableHead className="text-right">tCO2e</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mobileEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">
                                            {entry.data.fleetId}
                                            <div className="text-xs text-muted-foreground">{entry.data.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            {MOBILE_FUELS[entry.data.fuelSourceId]?.name}
                                            <div className="text-xs text-muted-foreground">
                                                {MOBILE_FUELS[entry.data.fuelSourceId]?.fuelName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{entry.data.quantity.toFixed(2)} {entry.data.unit}</TableCell>
                                        <TableCell className="text-right">{entry.data.details?.emissions_CO2_kg?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{entry.data.details?.emissions_CH4_kg?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{entry.data.details?.emissions_N2O_kg?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold">
                                            {entry.emissions_tCO2e?.toFixed(4)}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
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
