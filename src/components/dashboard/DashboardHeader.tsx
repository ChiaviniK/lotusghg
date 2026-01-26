"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";

interface DashboardHeaderProps {
    orgName: string;
    year: string;
    setYear: (year: string) => void;
    availableYears: string[];
    onExport: () => void;
}

export function DashboardHeader({
    orgName,
    year,
    setYear,
    availableYears,
    onExport,
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard ESG</h1>
                <p className="text-muted-foreground">
                    Visão geral das emissões de <span className="font-semibold text-foreground">{orgName}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map((y) => (
                            <SelectItem key={y} value={y}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            </div>
        </div>
    );
}
