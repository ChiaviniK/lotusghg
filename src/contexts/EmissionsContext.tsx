"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface EmissionEntry {
    id: string;
    scope: "scope1" | "scope2" | "scope3";
    category: string; // e.g., "stationary", "mobile", "waste", "effluents", "land-use"
    description: string;
    emissions_tCO2e: number;
    biogenic_tCO2e: number;
    data: any; // The raw input data
    date: string; // ISO date string
}

interface EmissionsContextType {
    entries: EmissionEntry[];
    addEntry: (entry: EmissionEntry) => void;
    removeEntry: (id: string) => void;
    clearAll: () => void;
}

const EmissionsContext = createContext<EmissionsContextType | undefined>(undefined);

export function EmissionsProvider({ children }: { children: React.ReactNode }) {
    const [entries, setEntries] = useState<EmissionEntry[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("ghg_data");
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse emissions data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("ghg_data", JSON.stringify(entries));
        }
    }, [entries, isLoaded]);

    const addEntry = (entry: EmissionEntry) => {
        setEntries(prev => [...prev, entry]);
    };

    const removeEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const clearAll = () => {
        setEntries([]);
    };

    return (
        <EmissionsContext.Provider value={{ entries, addEntry, removeEntry, clearAll }}>
            {children}
        </EmissionsContext.Provider>
    );
}

export function useEmissions() {
    const context = useContext(EmissionsContext);
    if (!context) {
        throw new Error("useEmissions must be used within an EmissionsProvider");
    }
    return context;
}
