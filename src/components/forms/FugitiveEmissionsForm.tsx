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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { calculateFugitiveEmissions, CalculationMethod } from "@/lib/calc/fugitive"
import { FUGITIVE_GASES } from "@/lib/constants/gases"
import { useEmissions } from "@/contexts/EmissionsContext"

// Schema
const fugitiveEntrySchema = z.object({
    description: z.string().min(1, "Description is required"),
    gasId: z.string().min(1, "Gas is required"),
    method: z.enum(["balance", "direct"]),

    // Balance fields
    stockStart: z.coerce.number().optional(),
    stockEnd: z.coerce.number().optional(),
    purchased: z.coerce.number().optional(),

    // Direct fields
    emissionsInput: z.coerce.number().optional(),
})

type FugitiveEntryFormValues = z.infer<typeof fugitiveEntrySchema>

const GAS_OPTIONS = Object.values(FUGITIVE_GASES);

export function FugitiveEmissionsForm() {
    const { addEntry, removeEntry, entries } = useEmissions()
    const [method, setMethod] = useState<CalculationMethod>("balance")

    // Filter for this specific category
    const fugitiveEntries = entries.filter(e => e.category === "fugitive_emissions");

    const form = useForm<FugitiveEntryFormValues>({
        resolver: zodResolver(fugitiveEntrySchema),
        defaultValues: {
            description: "",
            gasId: "",
            method: "balance",
            stockStart: 0,
            stockEnd: 0,
            purchased: 0,
            emissionsInput: 0,
        },
    })

    function onSubmit(data: FugitiveEntryFormValues) {
        const result = calculateFugitiveEmissions({
            gasId: data.gasId,
            method: data.method,
            stockStart: data.stockStart,
            stockEnd: data.stockEnd,
            purchased: data.purchased,
            emissions: data.emissionsInput
        });

        addEntry({
            id: crypto.randomUUID(),
            scope: "scope1",
            category: "fugitive_emissions",
            description: `${data.description} (${data.gasId})`,
            emissions_tCO2e: result.emissions_tCO2e,
            biogenic_tCO2e: 0,
            date: new Date().toISOString(),
            data: {
                ...data,
                calculatedEmissions: result.emissions_tCO2e
            }
        });

        // Reset core fields but keep method
        form.reset({
            description: "",
            gasId: "",
            method: data.method,
            stockStart: 0,
            stockEnd: 0,
            purchased: 0,
            emissionsInput: 0,
        })
    }

    return (
        <div className="space-y-8">
            <div className="rounded-md border p-4 bg-muted/20">
                <h3 className="mb-4 text-lg font-medium">Add Fugitive Emission Source</h3>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Calculation Method</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setMethod(val as CalculationMethod);
                                            }}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="balance" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Balance (Stock Change)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="direct" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Direct Input (Known Emissions)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. AC Unit 01, Transformer A" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gasId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gas</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gas" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {GAS_OPTIONS.map((gas) => (
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
                        </div>

                        {method === "balance" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="stockStart"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock Start (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stockEnd"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock End (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="purchased"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purchased (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="emissionsInput"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emitted Amount (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}


                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Add Entry
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Gas</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Emissions (tCO2e)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fugitiveEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No entries added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            fugitiveEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.data.description}</TableCell>
                                    <TableCell>{entry.data.gasId}</TableCell>
                                    <TableCell className="capitalize">{entry.data.method}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {entry.emissions_tCO2e?.toFixed(4)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        {fugitiveEntries.length > 0 && (
                            <TableRow className="bg-muted/50 font-bold">
                                <TableCell colSpan={3} className="text-right">Total:</TableCell>
                                <TableCell className="text-right">
                                    {fugitiveEntries.reduce((acc, curr) => acc + (curr.emissions_tCO2e || 0), 0).toFixed(4)}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
