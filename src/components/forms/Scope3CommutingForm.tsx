"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Train, Bus, Car, Ship, Laptop, Users } from "lucide-react";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEmissions } from "@/contexts/EmissionsContext";

// Logic
import { calculateCommuting } from "@/lib/calc/commuting";
import { ROAD_FUEL_TYPES } from "@/lib/constants/upstream-transport-data";

const commutingSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    date: z.string().optional(),

    // PUBLIC
    public_type: z.enum(["rail_train", "rail_subway", "bus_urban", "bus_road", "ferry"]).optional(),
    public_passengers: z.coerce.number().optional(),
    public_distance_km: z.coerce.number().optional(),
    public_trechos: z.coerce.number().optional(),
    public_days_year: z.coerce.number().optional(),

    // PRIVATE
    private_calc_method: z.enum(["fleet", "fuel", "distance"]).optional(),
    private_fuel_id: z.string().optional(),
    private_consumption_day: z.coerce.number().optional(),
    private_distance_day: z.coerce.number().optional(),
    private_avg_consumption: z.coerce.number().optional(),
    private_days_year: z.coerce.number().optional(),

    // REMOTE
    remote_employees: z.coerce.number().optional(),
    remote_days_week: z.coerce.number().optional(),
});

type CommutingFormValues = z.infer<typeof commutingSchema>;

export function Scope3CommutingForm() {
    const { addEntry, entries } = useEmissions();
    const [activeTab, setActiveTab] = useState("public");

    const commutingEntries = entries.filter(e => e.category === "commuting");
    const totalCO2e = commutingEntries.reduce((acc, curr) => acc + (curr.emissions_tCO2e || 0), 0);

    const form = useForm<CommutingFormValues>({
        resolver: zodResolver(commutingSchema) as any,
        defaultValues: {
            description: "",
            date: new Date().toISOString().split('T')[0],
            public_type: "bus_urban",
            public_passengers: undefined,
            public_trechos: undefined,
            public_days_year: undefined,
            private_calc_method: "distance",
            private_days_year: undefined,
            private_avg_consumption: undefined,
            remote_days_week: undefined,
            private_fuel_id: "",
        }
    });

    const onSubmit = (data: CommutingFormValues) => {
        let result = null;
        let typeLabel = "";

        if (activeTab === "public") {
            result = calculateCommuting({
                description: data.description,
                public_type: data.public_type,
                public_passengers: data.public_passengers ?? 1,
                public_distance_km: data.public_distance_km ?? 0,
                public_trechos_per_day: data.public_trechos ?? 2,
                public_days_per_year: data.public_days_year ?? 230
            }, "public");
            typeLabel = "Transporte Público";
        }
        else if (activeTab === "private") {
            result = calculateCommuting({
                description: data.description,
                private_calc_method: data.private_calc_method,
                private_fuel_id: data.private_fuel_id,
                private_consumption_per_day_liters: data.private_consumption_day ?? 0,
                private_distance_per_day_km: data.private_distance_day ?? 0,
                private_avg_consumption_km_l: data.private_avg_consumption ?? 10,
                private_days_per_year: data.private_days_year ?? 230
            }, "private");
            typeLabel = "Veículo Particular";
        }
        else if (activeTab === "remote") {
            result = calculateCommuting({
                description: data.description,
                remote_employees: data.remote_employees ?? 0,
                remote_days_per_week: data.remote_days_week ?? 0
            }, "remote");
            typeLabel = "Home Office";
        }

        if (result) {
            addEntry({
                id: crypto.randomUUID(),
                scope: "scope3",
                category: "commuting",
                description: `${typeLabel} - ${data.description}`,
                emissions_tCO2e: result.emissions_tCO2e,
                biogenic_tCO2e: result.emissions_tCO2_bio,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                data: { ...data, mode: activeTab }
            });
            form.reset({
                ...data,
                description: ""
            });
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Deslocamento Casa-Trabalho (Cat. 7)</CardTitle>
                    <CardDescription>
                        Calcule emissões do deslocamento de funcionários e trabalho remoto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-auto">
                            <TabsTrigger value="public" className="flex flex-col gap-2 py-3"><Bus className="h-5 w-5" /><span className="text-xs">Transporte Público</span></TabsTrigger>
                            <TabsTrigger value="private" className="flex flex-col gap-2 py-3"><Car className="h-5 w-5" /><span className="text-xs">Veículos Particulares</span></TabsTrigger>
                            <TabsTrigger value="remote" className="flex flex-col gap-2 py-3"><Laptop className="h-5 w-5" /><span className="text-xs">Trabalho Remoto</span></TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descrição / Identificação do Grupo</FormLabel>
                                                    <FormControl><Input placeholder="Ex: Funcionários ADM, Equipe TI..." {...field} value={field.value ?? ''} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Data</FormLabel>
                                                    <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* PUBLIC */}
                                    <TabsContent value="public" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="public_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Transporte</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="bus_urban">Ônibus Urbano</SelectItem>
                                                            <SelectItem value="bus_road">Ônibus Rodoviário</SelectItem>
                                                            <SelectItem value="rail_subway">Metrô / VLT</SelectItem>
                                                            <SelectItem value="rail_train">Trem</SelectItem>
                                                            <SelectItem value="ferry">Balsa</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="public_distance_km"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Distância (km) - Trecho</FormLabel>
                                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="public_trechos"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Trechos/Dia</FormLabel>
                                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                        <FormDescription>Padrão: 2 (Ida e Volta)</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="public_passengers"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passageiros</FormLabel>
                                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="public_days_year"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Dias/Ano</FormLabel>
                                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                        <FormDescription>Padrão: 230</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* PRIVATE */}
                                    <TabsContent value="private" className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="private_calc_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método de Cálculo</FormLabel>
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

                                        {form.watch("private_calc_method") === "distance" && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="private_distance_day"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Distância Média/Dia (km)</FormLabel>
                                                            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                            <FormDescription>Total (Ida + Volta)</FormDescription>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="private_avg_consumption"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Consumo Médio (km/L)</FormLabel>
                                                            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {(form.watch("private_calc_method") === "fuel" || form.watch("private_calc_method") === "fleet") && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="private_consumption_day"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Consumo Médio (Litros/Dia)</FormLabel>
                                                            <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="private_fuel_id"
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
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="private_days_year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Dias Trabalhados/Ano</FormLabel>
                                                    <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                    <FormDescription>Padrão: 230</FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    {/* REMOTE */}
                                    <TabsContent value="remote" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="remote_employees"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Número de Colaboradores</FormLabel>
                                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="remote_days_week"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Dias em Home Office / Semana</FormLabel>
                                                        <FormControl><Input type="number" max={7} {...field} value={field.value ?? ''} /></FormControl>
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
                    <CardTitle>Registros de Deslocamento</CardTitle>
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
                                {commutingEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="p-4 text-center text-muted-foreground">Nenhum registro encontrado.</td>
                                    </tr>
                                ) : (
                                    commutingEntries.map(entry => (
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
