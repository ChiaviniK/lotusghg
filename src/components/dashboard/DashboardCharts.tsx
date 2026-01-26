"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmissionEntry } from "@/contexts/EmissionsContext";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface DashboardChartsProps {
    data: EmissionEntry[];
}

const COLORS = ['#f97316', '#eab308', '#3b82f6', '#22c55e', '#a855f7'];
const SCOPE_COLORS = {
    scope1: '#f97316', // Orange
    scope2: '#eab308', // Yellow
    scope3: '#3b82f6', // Blue
};

export function DashboardCharts({ data }: DashboardChartsProps) {

    // 1. Prepare Data for Pie Chart (Scope Distribution)
    const scopeData = [
        { name: 'Escopo 1', value: data.filter(e => e.scope === 'scope1').reduce((acc, curr) => acc + curr.emissions_tCO2e, 0), color: SCOPE_COLORS.scope1 },
        { name: 'Escopo 2', value: data.filter(e => e.scope === 'scope2').reduce((acc, curr) => acc + curr.emissions_tCO2e, 0), color: SCOPE_COLORS.scope2 },
        { name: 'Escopo 3', value: data.filter(e => e.scope === 'scope3').reduce((acc, curr) => acc + curr.emissions_tCO2e, 0), color: SCOPE_COLORS.scope3 },
    ].filter(d => d.value > 0);

    // 2. Prepare Data for Top 5 Sources (Bar Chart)
    // Group by category or description
    const sourceMap = new Map<string, number>();
    data.forEach(e => {
        const key = e.description || e.category; // Use description for finer grain, or category for broad
        sourceMap.set(key, (sourceMap.get(key) || 0) + e.emissions_tCO2e);
    });

    const topSources = Array.from(sourceMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // 3. Prepare Data for Monthly Evolution (Bar/Line)
    // We need to parse dates. Assuming entries have 'date' field (ISO string)
    const monthMap = new Map<string, { name: string, scope1: number, scope2: number, scope3: number }>();
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Initialize months (optional, or just show active months)
    months.forEach((m, i) => {
        // We'll actually key by index to sort correctly 0-11
        monthMap.set(i.toString(), { name: m, scope1: 0, scope2: 0, scope3: 0 });
    });

    data.forEach(e => {
        if (!e.date) return;
        const d = new Date(e.date);
        const monthIndex = d.getMonth().toString();
        const existing = monthMap.get(monthIndex);
        if (existing) {
            existing[e.scope] += e.emissions_tCO2e;
        }
    });

    const monthlyData = Array.from(monthMap.values()); // Array from map values is sufficient if inserted in order, but map insertion order is preserved. 
    // Actually map.values() iteration order is insertion order. We inserted Jan...Dez. So it's sorted.

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Pie Chart: Scope Distribution */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Distribuição por Escopo</CardTitle>
                    <CardDescription>Participação de cada escopo no total de emissões.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={scopeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {scopeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => value.toFixed(2) + " tCO2e"} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bar Chart: Monthly Evolution */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Evolução Mensal</CardTitle>
                    <CardDescription>Emissões ao longo do ano por escopo.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip formatter={(value: number) => value.toFixed(2)} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="scope1" name="Escopo 1" stackId="a" fill={SCOPE_COLORS.scope1} radius={[0, 0, 4, 4]} />
                                <Bar dataKey="scope2" name="Escopo 2" stackId="a" fill={SCOPE_COLORS.scope2} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="scope3" name="Escopo 3" stackId="a" fill={SCOPE_COLORS.scope3} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Horizontal Bar: Top Sources */}
            <Card className="col-span-7">
                <CardHeader>
                    <CardTitle>Top 5 Fontes Emissoras (Hotspots)</CardTitle>
                    <CardDescription>Onde focar seus esforços de redução.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topSources.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <div className="min-w-[40%] text-sm font-medium truncate pr-4">{item.name}</div>
                                <div className="flex-1 flex items-center gap-2">
                                    <div className="h-4 rounded-full bg-primary/20 flex-1 overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(item.value / topSources[0].value) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-20 text-right">{item.value.toFixed(2)} t</span>
                                </div>
                            </div>
                        ))}
                        {topSources.length === 0 && <div className="text-center text-muted-foreground py-8">Sem dados suficientes.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
