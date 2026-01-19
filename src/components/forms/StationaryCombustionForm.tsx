"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { calculateStationaryEmissions, CalculationResult } from "@/lib/calc/stationary"
import { STATIONARY_FUELS } from "@/lib/constants/fuels"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const combustionEntrySchema = z.object({
    id: z.string().optional(),
    sourceId: z.string().min(1, "Source ID is required"),
    description: z.string().min(1, "Description is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    quantity: z.preprocess((val) => Number(val), z.number().min(0, "Quantity must be positive")),
    unit: z.string().min(1, "Unit is required"),
    // Results
    emissions_tCO2e: z.number().optional(),
    emissions_bio_t: z.number().optional(),
})

type CombustionEntry = z.infer<typeof combustionEntrySchema> & {
    details?: CalculationResult
}

const FUEL_OPTIONS = Object.keys(STATIONARY_FUELS);
const UNIT_OPTIONS = ["Litros", "m³", "kg", "Toneladas"]

export function StationaryCombustionForm() {
    const [entries, setEntries] = useState<CombustionEntry[]>([])

    const form = useForm<CombustionEntry>({
        resolver: zodResolver(combustionEntrySchema),
        defaultValues: {
            sourceId: "",
            description: "",
            fuelType: "",
            quantity: 0,
            unit: "",
        },
    })

    function onSubmit(data: CombustionEntry) {
        const result = calculateStationaryEmissions(data.fuelType, data.quantity);

        setEntries([...entries, {
            ...data,
            id: crypto.randomUUID(),
            emissions_tCO2e: result.emissions_tCO2e,
            emissions_bio_t: result.emissions_CO2_bio_t,
            details: result
        }])

        form.reset({
            sourceId: "",
            description: "",
            fuelType: "",
            quantity: 0,
            unit: "",
        })
    }

    function removeEntry(index: number) {
        setEntries(entries.filter((_, i) => i !== index))
    }

    const totalFossil = entries.reduce((acc, curr) => acc + (curr.emissions_tCO2e || 0), 0);
    const totalBio = entries.reduce((acc, curr) => acc + (curr.emissions_bio_t || 0), 0);

    return (
        <div className="space-y-8">
            <div className="rounded-md border p-4 bg-muted/20">
                <h3 className="mb-4 text-lg font-medium">Add Emission Source</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-6 items-end">
                        <FormField
                            control={form.control}
                            name="sourceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. GEN-01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Generator description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fuelType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fuel</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fuel" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {FUEL_OPTIONS.map((fuel) => (
                                                <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
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
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
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
                                    <FormLabel>Unit</FormLabel>
                                    {" "}
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Unit" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {UNIT_OPTIONS.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Source</TableHead>
                            <TableHead>Fuel</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">CO2 Fossil (t)</TableHead>
                            <TableHead className="text-right">CH4 (t)</TableHead>
                            <TableHead className="text-right">N2O (t)</TableHead>
                            <TableHead className="text-right">Bio CO2 (t)</TableHead>
                            <TableHead className="text-right font-bold">Total (tCO2e)</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No entries added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            entries.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {entry.sourceId}<br />
                                        <span className="text-xs text-muted-foreground">{entry.description}</span>
                                    </TableCell>
                                    <TableCell>{entry.fuelType}</TableCell>
                                    <TableCell className="text-right">{entry.quantity} {entry.unit}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {entry.details?.emissions_CO2_fossil_t.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {entry.details?.emissions_CH4_t.toFixed(5)}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {entry.details?.emissions_N2O_t.toFixed(5)}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        {entry.details?.emissions_CO2_bio_t.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {entry.emissions_tCO2e?.toFixed(4)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {entries.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Scope 1 (tCO2e)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalFossil.toFixed(4)}</div>
                            <p className="text-xs text-muted-foreground">Excludes biogenic CO2</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Biogenic Emissions (tCO2)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{totalBio.toFixed(4)}</div>
                            <p className="text-xs text-muted-foreground">Reported separately</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
