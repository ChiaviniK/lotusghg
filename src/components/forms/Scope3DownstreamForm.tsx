"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, AlertCircle, Truck, Train, Ship, Plane } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEmissions } from "@/contexts/EmissionsContext";

import {
    UPSTREAM_MODES,
    ROAD_VEHICLE_TYPES,
    ROAD_FUEL_TYPES,
    ROAD_CALC_METHODS,
    RAIL_CONCESSIONAIRES,
    RAIL_FUEL_TYPES,
    WATER_SHIP_TYPES,
    WATER_FUEL_TYPES,
    AIR_DISTANCES_DB,
    AIR_FUEL_TYPES
} from "@/lib/constants/upstream-transport-data";

const downstreamSchema = z.object({
    description: z.string().optional(),

    // Road Transport Fields
    road_calc_method: z.string().optional(),
    road_fuel_id: z.string().optional(),
    road_fuel_amount: z.coerce.number().optional(),
    road_dist_vehicle_type: z.string().optional(),
    road_dist_distance: z.coerce.number().optional(),
    road_dist_weight: z.coerce.number().optional(),
    road_fleet_type: z.string().optional(),
    road_fleet_year: z.string().optional(),
    road_dist_age_year: z.string().optional(),

    // Rail Transport Fields
    rail_calc_method: z.string().optional(),
    rail_dist_concessionaire: z.string().optional(),
    rail_dist_distance: z.coerce.number().optional(),
    rail_dist_weight: z.coerce.number().optional(),
    rail_fuel_id: z.string().optional(),
    rail_fuel_amount: z.coerce.number().optional(),

    // Water Transport Fields
    water_calc_method: z.string().optional(),
    water_ship_type: z.string().optional(),
    water_dist_distance: z.coerce.number().optional(),
    water_dist_weight: z.coerce.number().optional(),
    water_fuel_id: z.string().optional(),
    water_fuel_amount: z.coerce.number().optional(),

    // Air Transport Fields
    air_calc_method: z.string().optional(),
    air_dist_origin: z.string().optional(),
    air_dist_dest: z.string().optional(),
    air_dist_weight: z.coerce.number().optional(),
    air_fuel_id: z.string().optional(),
    air_fuel_amount: z.coerce.number().optional(),
});

export function Scope3DownstreamForm() {
    const { addEntry, entries } = useEmissions();
    const [activeTab, setActiveTab] = useState("road");

    // Filter relevant entries
    const downstreamEntries = entries.filter(e => e.category === "downstream_transport_dist");

    // Calculate totals
    const totalFossil = downstreamEntries.reduce((sum, e) => sum + (e.emissions_tCO2e || 0), 0);
    const totalBio = downstreamEntries.reduce((sum, e) => sum + (e.biogenic_tCO2e || 0), 0);

    const form = useForm<z.infer<typeof downstreamSchema>>({
        resolver: zodResolver(downstreamSchema),
        defaultValues: {
            road_calc_method: "fuel",
            // Initialize possibly undefined fields to undefined to match schema
            road_fuel_amount: undefined,
            road_dist_distance: undefined,
            road_dist_weight: undefined,
        },
    });

    function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function onSubmit(data: z.infer<typeof downstreamSchema>) {
        console.log("Submit Downstream Data", data);

        let calculatedCO2 = 0; // tCO2e
        let calculatedBioCO2 = 0; // tCO2e (Biogenic)
        let methodUsed = "";
        let details = "";

        // --- Road Transport Calculations ---
        if (activeTab === "road") {
            if (data.road_calc_method === "fuel") {
                const fuel = ROAD_FUEL_TYPES.find(f => f.id === data.road_fuel_id);
                if (fuel && data.road_fuel_amount) {
                    calculatedCO2 = (data.road_fuel_amount * (fuel.ef_co2 || 0)) / 1000;
                    calculatedBioCO2 = (data.road_fuel_amount * (fuel.ef_bio || 0)) / 1000;
                    methodUsed = `Rodoviário - Combustível: ${fuel.label}`;
                }
            } else if (data.road_calc_method === "dist_weight" || data.road_calc_method === "dist_age" || data.road_calc_method === "fleet_year") {
                // Using general emission factors (kgCO2e/t.km or kgCO2e/km)
                // For simplified Scope 3, we adhere to average factors if specific fleet data is missing
                const factor = 0.150; // kgCO2e/t.km (Average example)

                let distance = data.road_dist_distance || 0;
                let weight = data.road_dist_weight || 0;

                // For Fleet/Year option (Option 1) & Option 4, we might need more complex logic. 
                // Here we simplify to Dist * Weight * Factor for demonstration as specifics depend on vehicle type factor mapping
                if (data.road_calc_method === "fleet_year") {
                    // In a real app, look up factor based on data.road_fleet_type and data.road_fleet_year
                    // Assuming 'fuel consumption' was also asked in Option 1, we use that if available, otherwise fallback
                    if (data.road_fuel_amount) {
                        // Fallback to fuel calculation if amount is provided in Option 1
                        // Assuming Diesel for fleet
                        calculatedCO2 = (data.road_fuel_amount * 2.603) / 1000;
                        methodUsed = `Rodoviário - Frota (Estimado p/ diesel)`;
                    }
                } else {
                    calculatedCO2 = (distance * weight * factor) / 1000;
                    methodUsed = `Rodoviário - Distância/Peso`;
                }
            }
        }

        // --- Rail Transport Calculations ---
        else if (activeTab === "rail") {
            if (data.rail_calc_method === "fuel") {
                const fuel = RAIL_FUEL_TYPES.find(f => f.id === data.rail_fuel_id);
                if (fuel && data.rail_fuel_amount) {
                    calculatedCO2 = (data.rail_fuel_amount * (fuel.ef_co2 || 0)) / 1000;
                    methodUsed = `Ferroviário - Combustível: ${fuel.label}`;
                }
            } else if (data.rail_calc_method === "dist_weight") {
                const factor = 0.025; // kgCO2e/t.km
                if (data.rail_dist_distance && data.rail_dist_weight) {
                    calculatedCO2 = (data.rail_dist_distance * data.rail_dist_weight * factor) / 1000;
                    methodUsed = `Ferroviário - Distância: ${data.rail_dist_distance}km`;
                }
            }
        }

        // --- Water Transport Calculations ---
        else if (activeTab === "water") {
            if (data.water_calc_method === "fuel") {
                const fuel = WATER_FUEL_TYPES.find(f => f.id === data.water_fuel_id);
                if (fuel && data.water_fuel_amount) {
                    calculatedCO2 = (data.water_fuel_amount * (fuel.ef_co2 || 0)) / 1000;
                    methodUsed = `Hidroviário - Combustível: ${fuel.label}`;
                }
            } else if (data.water_calc_method === "ship_dist") {
                const factor = 0.015; // kgCO2e/t.km
                if (data.water_dist_distance && data.water_dist_weight) {
                    calculatedCO2 = (data.water_dist_distance * data.water_dist_weight * factor) / 1000;
                    methodUsed = `Hidroviário - Distância: ${data.water_dist_distance}km`;
                }
            }
        }

        // --- Air Transport Calculations ---
        else if (activeTab === "air") {
            if (data.air_calc_method === "fuel") {
                const fuel = AIR_FUEL_TYPES.find(f => f.id === data.air_fuel_id);
                if (fuel && data.air_fuel_amount) {
                    calculatedCO2 = (data.air_fuel_amount * (fuel.ef_co2 || 0)) / 1000;
                    methodUsed = `Aéreo - Combustível: ${fuel.label}`;
                }
            } else if (data.air_calc_method === "dist_weight") {
                let distance = 0;
                if (data.air_dist_origin && data.air_dist_dest) {
                    // Check if IATA codes exist in DB
                    const origin = AIR_DISTANCES_DB[data.air_dist_origin.toUpperCase()];
                    const dest = AIR_DISTANCES_DB[data.air_dist_dest.toUpperCase()];

                    if (origin && dest) {
                        distance = calculateHaversineDistance(origin.lat, origin.lon, dest.lat, dest.lon);
                        details = `Distância calculada (IATA): ${distance.toFixed(1)} km`;
                    } else {
                        // Fallback or alert user (simple implementation just logs)
                        console.warn("IATA code not found");
                    }
                }

                const factor = 0.800; // kgCO2e/t.km
                if (distance && data.air_dist_weight) {
                    calculatedCO2 = (distance * data.air_dist_weight * factor) / 1000;
                    methodUsed = `Aéreo - IATA: ${data.air_dist_origin} -> ${data.air_dist_dest} (${distance.toFixed(0)}km)`;
                }
            }
        }

        // Save to Context
        addEntry({
            id: crypto.randomUUID(),
            scope: "scope3",
            category: "downstream_transport_dist", // Category 9
            description: details || data.description || methodUsed,
            emissions_tCO2e: calculatedCO2,
            biogenic_tCO2e: calculatedBioCO2,
            date: new Date().toISOString(),
            data: data, // Save raw inputs for future editing/reference
        });

        // Optional: Show success feedback (toast/alert)
        alert("Dados salvos com sucesso!");
    }

    return (
        <div className="space-y-8">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Orientações Gerais</AlertTitle>
                <AlertDescription>
                    Esta seção permite calcular as emissões por Transporte e Distribuição (Downstream) de produtos vendidos.
                    Escolha o modal abaixo para iniciar.
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto">
                    <TabsTrigger value="road" className="flex flex-col gap-2 py-4">
                        <Truck className="h-6 w-6" />
                        <span className="text-xs">Rodoviário</span>
                    </TabsTrigger>
                    <TabsTrigger value="rail" className="flex flex-col gap-2 py-4">
                        <Train className="h-6 w-6" />
                        <span className="text-xs">Ferroviário</span>
                    </TabsTrigger>
                    <TabsTrigger value="water" className="flex flex-col gap-2 py-4">
                        <Ship className="h-6 w-6" />
                        <span className="text-xs">Hidroviário</span>
                    </TabsTrigger>
                    <TabsTrigger value="air" className="flex flex-col gap-2 py-4">
                        <Plane className="h-6 w-6" />
                        <span className="text-xs">Aéreo</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <TabsContent value="road">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transporte Rodoviário</CardTitle>
                                        <CardDescription>
                                            Escolha o método de cálculo mais adequado aos seus dados.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="road_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método de Cálculo</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o método" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {ROAD_CALC_METHODS.map(m => (
                                                                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Option 1: Fleet Type & Year */}
                                        {form.watch("road_calc_method") === "fleet_year" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <h3 className="font-semibold text-sm text-primary">Opção 1: Tipo e Ano da Frota</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="road_fleet_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Tipo de Veículo</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {ROAD_VEHICLE_TYPES.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="road_fleet_year"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Ano de Fabricação</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.watch("road_fleet_type")?.includes("truck")}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {/* Mock years for example */}
                                                                        {Array.from({ length: 20 }, (_, i) => (
                                                                            <SelectItem key={i} value={String(2024 - i)}>{2024 - i}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="road_fuel_amount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Consumo (Litros)</FormLabel>
                                                                <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Option 2: Fuel Consumption */}
                                        {form.watch("road_calc_method") === "fuel" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <h3 className="font-semibold text-sm text-primary">Opção 2: Cálculo por Consumo de Combustível</h3>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="road_fuel_id"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Tipo de Combustível</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Selecione..." />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {ROAD_FUEL_TYPES.map(f => (
                                                                            <SelectItem key={f.id} value={f.id}>{f.label} ({f.unit})</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="road_fuel_amount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantidade</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormItem>
                                                        <FormLabel>CO2 Fóssil (Estimado)</FormLabel>
                                                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                                                            {(() => {
                                                                const fuelId = form.watch("road_fuel_id");
                                                                const amount = Number(form.watch("road_fuel_amount") || 0);
                                                                const fuel = ROAD_FUEL_TYPES.find(f => f.id === fuelId);
                                                                if (!fuel || !amount) return "-";
                                                                const co2 = (amount * (fuel.ef_co2 || 0)) / 1000; // tCO2e
                                                                return `${co2.toFixed(4)} tCO2`;
                                                            })()}
                                                        </div>
                                                    </FormItem>
                                                </div>
                                            </div>
                                        )}

                                        {/* Option 3: Distance & Weight */}
                                        {form.watch("road_calc_method") === "dist_weight" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <h3 className="font-semibold text-sm text-primary">Opção 3: Distância e Peso</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="road_dist_vehicle_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Tipo de Veículo</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {ROAD_VEHICLE_TYPES.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="road_dist_distance"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Distância (km)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="road_dist_weight"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Peso (t)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Option 4: Distance & Age */}
                                        {form.watch("road_calc_method") === "dist_age" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <h3 className="font-semibold text-sm text-primary">Opção 4: Distância e Idade da Frota</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="road_dist_distance"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Distância (km)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="road_dist_age_year"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Ano de Fabricação</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 20 }, (_, i) => (
                                                                            <SelectItem key={i} value={String(2024 - i)}>{2024 - i}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!form.watch("road_calc_method") && (
                                            <div className="p-4 border rounded-md bg-muted/20 text-center text-muted-foreground text-sm">
                                                Selecione um método acima.
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Rail Transport Content */}
                            <TabsContent value="rail">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transporte Ferroviário</CardTitle>
                                        <CardDescription>
                                            Escolha o método de cálculo (Distância/Peso ou Combustível).
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="rail_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método de Cálculo</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o método" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="dist_weight">Opção 1: Distância e Peso</SelectItem>
                                                            <SelectItem value="fuel">Opção 2: Consumo de Combustível</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("rail_calc_method") === "dist_weight" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="rail_dist_concessionaire"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Concessionária</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {RAIL_CONCESSIONAIRES.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="rail_dist_distance"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Distância (km)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="rail_dist_weight"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Carga (t)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {form.watch("rail_calc_method") === "fuel" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="rail_fuel_id"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Combustível</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {RAIL_FUEL_TYPES?.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="rail_fuel_amount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantidade</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Water Transport Content */}
                            <TabsContent value="water">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transporte Hidroviário</CardTitle>
                                        <CardDescription>Escolha o método de cálculo.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="water_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método de Cálculo</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o método" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="ship_dist">Opção 1: Tipo de Navio, Distância e Carga</SelectItem>
                                                            <SelectItem value="fuel">Opção 2: Consumo de Combustível</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("water_calc_method") === "ship_dist" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="water_ship_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Tipo de Navio</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {WATER_SHIP_TYPES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="water_dist_distance"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Distância (km)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="water_dist_weight"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Carga (t)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {form.watch("water_calc_method") === "fuel" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="water_fuel_id"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Combustível</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {WATER_FUEL_TYPES?.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="water_fuel_amount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantidade</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Air Transport Content */}
                            <TabsContent value="air">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transporte Aéreo</CardTitle>
                                        <CardDescription>Escolha o método de cálculo.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="air_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método de Cálculo</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o método" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="dist_weight">Opção 1: Distância e Peso (IATA)</SelectItem>
                                                            <SelectItem value="fuel">Opção 2: Consumo de Combustível</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("air_calc_method") === "dist_weight" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="air_dist_origin"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Origem (IATA)</FormLabel>
                                                                <FormControl><Input placeholder="EX: GRU" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="air_dist_dest"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Destino (IATA)</FormLabel>
                                                                <FormControl><Input placeholder="EX: JFK" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="air_dist_weight"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Carga (t)</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {form.watch("air_calc_method") === "fuel" && (
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="air_fuel_id"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Combustível</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {AIR_FUEL_TYPES.map(f => (
                                                                            <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="air_fuel_amount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantidade</FormLabel>
                                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <Button type="submit" className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Registro
                            </Button>
                        </form>
                    </Form>

                    {/* Summary Table */}
                    <div className="mt-12">
                        <h2 className="text-xl font-bold mb-4">Registros Adicionados</h2>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="p-3">Descrição / Método</th>
                                        <th className="p-3">Emisssões (tCO2e)</th>
                                        <th className="p-3">Biogênico (tCO2)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {downstreamEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhum registro adicionado.</td>
                                        </tr>
                                    ) : (
                                        downstreamEntries.map(e => (
                                            <tr key={e.id} className="hover:bg-muted/5">
                                                <td className="p-3">{e.description}</td>
                                                <td className="p-3 font-semibold">{e.emissions_tCO2e?.toFixed(5)}</td>
                                                <td className="p-3 text-muted-foreground">{e.biogenic_tCO2e?.toFixed(5)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-muted/50 font-semibold">
                                    <tr>
                                        <td className="p-3">Total</td>
                                        <td className="p-3">{totalFossil.toFixed(4)}</td>
                                        <td className="p-3">{totalBio.toFixed(4)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
