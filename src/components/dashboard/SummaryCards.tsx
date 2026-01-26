"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Factory, Zap, Truck, Leaf, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils"; // Assuming you have utils, if not will fix

interface KPICardsProps {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
    biogenic: number;
    lastYearTotal?: number; // For evolution comparison
}

export function KPICards({ total, scope1, scope2, scope3, biogenic, lastYearTotal }: KPICardsProps) {

    // Calculate percentage change if lastYearTotal exists
    const change = lastYearTotal ? ((total - lastYearTotal) / lastYearTotal) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emissões Totais</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">tCO2e</span></div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {lastYearTotal && (
                            <span className={change > 0 ? "text-red-500" : "text-green-500"}>
                                {change > 0 ? "+" : ""}{change.toFixed(1)}% vs anterior
                            </span>
                        )}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Escopo 1</CardTitle>
                    <Factory className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{scope1.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {total > 0 ? ((scope1 / total) * 100).toFixed(1) : 0}% do total
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Escopo 2</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{scope2.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {total > 0 ? ((scope2 / total) * 100).toFixed(1) : 0}% do total
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Escopo 3</CardTitle>
                    <Truck className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{scope3.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {total > 0 ? ((scope3 / total) * 100).toFixed(1) : 0}% do total
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Biogênicas</CardTitle>
                    <Leaf className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{biogenic.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Neutras em carbono
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
