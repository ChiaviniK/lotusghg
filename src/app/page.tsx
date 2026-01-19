"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmissions } from "@/contexts/EmissionsContext";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns"; // Check if date-fns is available, if not use native Intl

// Fallback for native date formatting if date-fns not installed
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Home() {
  const { entries } = useEmissions();

  const stats = useMemo(() => {
    const total = entries.reduce((acc, curr) => acc + curr.emissions_tCO2e, 0);
    const scope1 = entries.filter(e => e.scope === 'scope1').reduce((acc, curr) => acc + curr.emissions_tCO2e, 0);
    const scope2 = entries.filter(e => e.scope === 'scope2').reduce((acc, curr) => acc + curr.emissions_tCO2e, 0);
    const scope3 = entries.filter(e => e.scope === 'scope3').reduce((acc, curr) => acc + curr.emissions_tCO2e, 0);

    const byCategory = entries.reduce((acc, curr) => {
      const cat = curr.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + curr.emissions_tCO2e;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    const barData = [
      { name: 'Scope 1', value: scope1 },
      { name: 'Scope 2', value: scope2 },
      { name: 'Scope 3', value: scope3 },
    ];

    return { total, scope1, scope2, scope3, pieData, barData };
  }, [entries]);

  const recentEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [entries]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Emissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toFixed(2)} tCO2e</div>
            <p className="text-xs text-muted-foreground">Total Inventariado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escopo 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scope1.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Emissões Diretas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escopo 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scope2.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Energia Elétrica</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escopo 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scope3.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cadeia de Valor</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Emissões por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {stats.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados para exibir</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Por Escopo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Ultimos lançamentos no inventário.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Emissão (tCO2e)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="capitalize">{entry.category}</TableCell>
                    <TableCell className="text-right font-bold">{entry.emissions_tCO2e.toFixed(4)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum lançamento recente.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
