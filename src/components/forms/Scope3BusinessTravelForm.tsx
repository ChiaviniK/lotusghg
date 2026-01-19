"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Plane, Train, Bus, Car, Ship } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
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
import { useEmissions } from "@/contexts/EmissionsContext";

// Constants & Calc
import { calculateBusinessTravel } from "@/lib/calc/business-travel";
import {
    ROAD_FUEL_TYPES,
} from "@/lib/constants/upstream-transport-data";

const businessTravelSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),

    // Tab tracking - manual handling in component, but good to have in schema
    active_tab: z.string(),

    // AIR
    air_calc_method: z.enum(["airport_iata", "distance"]).optional(),
    air_origin_iata: z.string().optional(),
    air_dest_iata: z.string().optional(),
    air_distance_km: z.coerce.number().optional(),
    air_passengers: z.coerce.number().optional(),
    air_trechos: z.coerce.number().optional(),

    // RAIL
    rail_type: z.enum(["train", "subway"]).optional(),
    rail_passengers: z.coerce.number().optional(),
    rail_distance_km: z.coerce.number().optional(),
    rail_trechos: z.coerce.number().optional(),

    // BUS
    bus_type: z.enum(["intercity", "urban"]).optional(),
    bus_passengers: z.coerce.number().optional(),
    bus_distance_km: z.coerce.number().optional(),
    bus_trechos: z.coerce.number().optional(),

    // CAR
    car_calc_method: z.enum(["fleet", "fuel", "distance"]).optional(),
    car_fuel_id: z.string().optional(),
    car_fuel_amount_liters: z.coerce.number().optional(),
    car_distance_km: z.coerce.number().optional(),
    car_fleet_type: z.string().optional(),

    // FERRY
    ferry_passengers: z.coerce.number().optional(),
    ferry_distance_km: z.coerce.number().optional(),
    ferry_trechos: z.coerce.number().optional(),
});

type BusinessTravelFormValues = z.infer<typeof businessTravelSchema>;

export function Scope3BusinessTravelForm() {
    const { addEntry, entries } = useEmissions();
    const [activeTab, setActiveTab] = useState("air");

    // Filter relevant entries
    const travelEntries = entries.filter(e => e.category === "business_travel");
    const totalCO2e = travelEntries.reduce((acc, curr) => acc + (curr.emissions_tCO2e || 0), 0);

    const form = useForm<BusinessTravelFormValues>({
        resolver: zodResolver(businessTravelSchema),
        defaultValues: {
            active_tab: "air",
            description: "",
            air_calc_method: "airport_iata",
            air_passengers: 1,
            air_trechos: 1,
            rail_passengers: 1,
            rail_trechos: 1,
            bus_passengers: 1,
            bus_trechos: 1,
            car_calc_method: "distance",
            ferry_passengers: 1,
            ferry_trechos: 1,
            // Initialize optional strings to empty string to avoid uncontrolled input warnings
            air_origin_iata: "",
            air_dest_iata: "",
            rail_type: "train",
            bus_type: "intercity",
            car_fuel_id: "",
            car_fleet_type: "",
        }
    });

    const onSubmit = (data: BusinessTravelFormValues) => {
        let result = null;
        let typeLabel = "";
        const calculationData: any = { ...data, mode: activeTab };

        if (activeTab === "air") {
            result = calculateBusinessTravel({
                description: data.description,
                air_calc_method: data.air_calc_method,
                air_origin_iata: data.air_origin_iata,
                air_dest_iata: data.air_dest_iata,
                air_distance_km: data.air_distance_km,
                air_passengers: data.air_passengers,
                air_trechos: data.air_trechos
            }, "air");
            typeLabel = "Aéreo";
        }
        else if (activeTab === "rail") {
            result = calculateBusinessTravel({
                description: data.description,
                rail_type: data.rail_type,
                rail_distance_km: data.rail_distance_km,
                rail_passengers: data.rail_passengers,
                rail_trechos: data.rail_trechos
            }, "rail");
            typeLabel = "Ferroviário";
        }
        else if (activeTab === "bus") {
            result = calculateBusinessTravel({
                description: data.description,
                bus_type: data.bus_type,
                bus_distance_km: data.bus_distance_km,
                bus_passengers: data.bus_passengers,
                bus_trechos: data.bus_trechos
            }, "bus");
            typeLabel = "Ônibus";
        }
        else if (activeTab === "car") {
            result = calculateBusinessTravel({
                description: data.description,
                car_calc_method: data.car_calc_method,
                car_fuel_id: data.car_fuel_id,
                car_fuel_amount_liters: data.car_fuel_amount_liters,
                car_distance_km: data.car_distance_km,
                car_fleet_type: data.car_fleet_type
            }, "car");
            typeLabel = "Automóvel";
        }
        else if (activeTab === "ferry") {
            result = calculateBusinessTravel({
                description: data.description,
                ferry_distance_km: data.ferry_distance_km,
                ferry_passengers: data.ferry_passengers,
                ferry_trechos: data.ferry_trechos
            }, "ferry");
            typeLabel = "Hidroviário (Balsa)";
        }

        if (result) {
            addEntry({
                id: crypto.randomUUID(),
                scope: "scope3",
                category: "business_travel",
                description: `${typeLabel} - ${data.description}`,
                emissions_tCO2e: result.emissions_tCO2e,
                biogenic_tCO2e: result.emissions_tCO2_bio,
                date: new Date().toISOString(),
                data: {
                    ...calculationData,
                    source_label: typeLabel
                }
            });
            form.reset({
                ...data,
                description: ""
            });
            // Keep the active tab selection
            form.setValue("active_tab", activeTab);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Emissões por Viagens a Negócios (Cat. 6)</CardTitle>
                    <CardDescription>
                        Calcule emissões do transporte de funcionários em veículos de terceiros (avião, ônibus, etc).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); form.setValue("active_tab", v); }} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 h-auto">
                            <TabsTrigger value="air" className="flex flex-col gap-2 py-3"><Plane className="h-5 w-5" /><span className="text-xs">Aéreo</span></TabsTrigger>
                            <TabsTrigger value="rail" className="flex flex-col gap-2 py-3"><Train className="h-5 w-5" /><span className="text-xs">Trem/Metrô</span></TabsTrigger>
                            <TabsTrigger value="bus" className="flex flex-col gap-2 py-3"><Bus className="h-5 w-5" /><span className="text-xs">Ônibus</span></TabsTrigger>
                            <TabsTrigger value="car" className="flex flex-col gap-2 py-3"><Car className="h-5 w-5" /><span className="text-xs">Automóvel</span></TabsTrigger>
                            <TabsTrigger value="ferry" className="flex flex-col gap-2 py-3"><Ship className="h-5 w-5" /><span className="text-xs">Balsa</span></TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição da Viagem / Passageiro</FormLabel>
                                                <FormControl><Input placeholder="Ex: Conferência SP, Equipe de Vendas..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* AIR */}
                                    <TabsContent value="air" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="air_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método de Cálculo</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="airport_iata">Opção 1: Código IATA (Origem/Destino)</SelectItem>
                                                            <SelectItem value="distance">Opção 2: Distância (km)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("air_calc_method") === "airport_iata" ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="air_origin_iata"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Origem (IATA)</FormLabel>
                                                            <FormControl><Input placeholder="Ex: GRU" {...field} maxLength={3} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="air_dest_iata"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Destino (IATA)</FormLabel>
                                                            <FormControl><Input placeholder="Ex: JFK" {...field} maxLength={3} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        ) : (
                                            <FormField
                                                control={form.control}
                                                name="air_distance_km"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Distância Total do Trecho (km)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="air_trechos"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Trechos (Voos)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="air_passengers"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passageiros</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* RAIL */}
                                    <TabsContent value="rail" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="rail_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Transporte</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="train">Trem (Ferrovia)</SelectItem>
                                                            <SelectItem value="subway">Metrô/VLT</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="rail_distance_km"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Distância (km)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="rail_trechos"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Trechos</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="rail_passengers"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passageiros</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* BUS */}
                                    <TabsContent value="bus" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="bus_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Ônibus</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="intercity">Rodoviário (Viagem)</SelectItem>
                                                            <SelectItem value="urban">Urbano (Municipal)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="bus_distance_km"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Distância (km)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bus_trechos"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Trechos</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bus_passengers"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passageiros</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* CAR */}
                                    <TabsContent value="car" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="car_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="distance">Opção 3: Distância Percorrida</SelectItem>
                                                            <SelectItem value="fuel">Opção 2: Consumo Combustível</SelectItem>
                                                            <SelectItem value="fleet">Opção 1: Tipo de Frota (Simulado)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("car_calc_method") === "distance" && (
                                            <FormField
                                                control={form.control}
                                                name="car_distance_km"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Distância Total (km)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormDescription>Assume consumo médio (ex: 10km/L gasolina)</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {form.watch("car_calc_method") === "fuel" && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="car_fuel_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Combustível</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {ROAD_FUEL_TYPES.map(f => (
                                                                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="car_fuel_amount_liters"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantidade (Litros)</FormLabel>
                                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* FERRY */}
                                    <TabsContent value="ferry" className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="ferry_distance_km"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Distância (km)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ferry_trechos"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Trechos</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ferry_passengers"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passageiros</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Calcular e Adicionar</Button>
                                </form>
                            </Form>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registros de Viagens</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted font-medium">
                                <tr className="text-left border-b">
                                    <th className="p-3">Descrição / Detalhes</th>
                                    <th className="p-3 text-right">tCO2e</th>
                                </tr>
                            </thead>
                            <tbody>
                                {travelEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="p-4 text-center text-muted-foreground">Nenhum registro encontrado.</td>
                                    </tr>
                                ) : (
                                    travelEntries.map(entry => (
                                        <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-3">{entry.description}</td>
                                            <td className="p-3 text-right font-medium">{entry.emissions_tCO2e.toFixed(4)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-muted font-medium border-t">
                                <tr>
                                    <td className="p-3">Total</td>
                                    <td className="p-3 text-right">{totalCO2e.toFixed(4)} tCO2e</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
