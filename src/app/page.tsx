"use client";

import { useState, useMemo } from "react";
import { useEmissions } from "@/contexts/EmissionsContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICards } from "@/components/dashboard/SummaryCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { IntensityMetrics } from "@/components/dashboard/IntensityMetrics";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { entries, organization } = useEmissions();
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  // 1. Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set(entries.map(e => e.date ? new Date(e.date).getFullYear().toString() : ""));
    // Fix: Clean implementation of year extraction
    const validYears = new Set<string>();
    validYears.add(new Date().getFullYear().toString());

    entries.forEach(e => {
      if (e.date) {
        const y = new Date(e.date).getFullYear().toString();
        if (y && y !== 'NaN') validYears.add(y);
      }
    });

    return Array.from(validYears).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  // 2. Filter data by year
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (!e.date) return false;
      return new Date(e.date).getFullYear().toString() === year;
    });
  }, [entries, year]);

  // 3. Calculate Aggregates
  const totals = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => ({
      total: acc.total + curr.emissions_tCO2e,
      scope1: acc.scope1 + (curr.scope === 'scope1' ? curr.emissions_tCO2e : 0),
      scope2: acc.scope2 + (curr.scope === 'scope2' ? curr.emissions_tCO2e : 0),
      scope3: acc.scope3 + (curr.scope === 'scope3' ? curr.emissions_tCO2e : 0),
      biogenic: acc.biogenic + (curr.biogenic_tCO2e || 0)
    }), { total: 0, scope1: 0, scope2: 0, scope3: 0, biogenic: 0 });
  }, [filteredEntries]);

  // 4. Export Function
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Data,Escopo,Categoria,Descricao,Emissao(tCO2e),Biogênica(tCO2e)\n"
      + filteredEntries.map(e => `${e.date?.split('T')[0] || ''},${e.scope},"${e.category}","${e.description}",${e.emissions_tCO2e},${e.biogenic_tCO2e}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_ghg_${organization?.name || 'empresa'}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Carregando organização...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        orgName={organization.name}
        year={year}
        setYear={setYear}
        availableYears={availableYears}
        onExport={handleExport}
      />

      <KPICards
        total={totals.total}
        scope1={totals.scope1}
        scope2={totals.scope2}
        scope3={totals.scope3}
        biogenic={totals.biogenic}
      // Optional: Pass last year total if we calculate it
      />

      <IntensityMetrics
        totalEmissions={totals.total}
        employees={organization.employees}
        revenue={organization.revenue}
        production={organization.productionVolume}
        productionUnit={organization.productionUnit}
      />

      <DashboardCharts data={filteredEntries} />
    </div>
  );
}
