"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Package, Activity } from "lucide-react";

interface IntensityMetricsProps {
    totalEmissions: number;
    employees?: number;
    revenue?: number; // In currency units
    production?: number;
    productionUnit?: string;
}

export function IntensityMetrics({ totalEmissions, employees, revenue, production, productionUnit }: IntensityMetricsProps) {
    if (totalEmissions === 0) return null;

    // Only show if denominator exists and is > 0
    const showEmployees = employees && employees > 0;
    const showRevenue = revenue && revenue > 0;
    const showProduction = production && production > 0;

    if (!showEmployees && !showRevenue && !showProduction) return null;

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-4">
            {showEmployees && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Intensidade por Colaborador</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalEmissions / employees!).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">tCO2e / funcionário</p>
                    </CardContent>
                </Card>
            )}

            {showRevenue && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Intensidade Econômica</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {/* Usually tCO2e per Million or Thousand. Let's do raw for now or per 1k if large */}
                        {/* If revenue > 1,000,000, show per Million */}
                        <div className="text-2xl font-bold">{(totalEmissions / (revenue! / 1000000)).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">tCO2e / Milhão R$</p>
                    </CardContent>
                </Card>
            )}

            {showProduction && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Intensidade Produtiva</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalEmissions / production!).toFixed(4)}</div>
                        <p className="text-xs text-muted-foreground">tCO2e / {productionUnit || "unidade"}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
