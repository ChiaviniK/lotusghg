"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface EmissionEntry {
    id: string;
    organizationId?: string;
    scope: "scope1" | "scope2" | "scope3";
    category: string;
    description: string;
    emissions_tCO2e: number;
    biogenic_tCO2e: number;
    data: any;
    date: string;
}

export interface OrganizationData {
    id: string;
    name: string;
    address: string;
    inventoryYear: string;
    responsibleName: string;
    responsiblePhone: string;
    fillingDate: string;
    // Intensity Metrics
    employees?: number;
    revenue?: number;
    productionVolume?: number;
    productionUnit?: string;
}

interface EmissionsContextType {
    entries: EmissionEntry[];
    addEntry: (entry: Partial<EmissionEntry>) => Promise<void>;
    removeEntry: (id: string) => Promise<void>;
    clearAll: () => void;
    // Current Org compatibility
    organization: OrganizationData | null;
    updateOrganization: (data: OrganizationData) => void;
    showOrgSettings: boolean;
    setShowOrgSettings: (show: boolean) => void;
    // Multi Org
    organizations: OrganizationData[];
    selectOrganization: (id: string) => void;
}

const EmissionsContext = createContext<EmissionsContextType | undefined>(undefined);

export function EmissionsProvider({ children }: { children: React.ReactNode }) {
    const [entries, setEntries] = useState<EmissionEntry[]>([]);

    // Multi-Org State
    const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
    const [currentOrg, setCurrentOrg] = useState<OrganizationData | null>(null);
    const [showOrgSettings, setShowOrgSettings] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch User's Organizations
                const resOrgs = await fetch('/api/organizations');
                if (resOrgs.ok) {
                    const orgs = await resOrgs.json();
                    setOrganizations(orgs);

                    // Default to first org if none selected or try to restore from local
                    const storedOrgId = localStorage.getItem("ghg_selected_org_id");
                    const found = orgs.find((o: OrganizationData) => o.id === storedOrgId) || orgs[0];

                    if (found) {
                        setCurrentOrg(found);
                    }
                }
            } catch (e) {
                console.error("Failed to init", e);
            } finally {
                setIsLoaded(true);
            }
        };
        init();
    }, []);

    // Fetch Emissions when Current Org changes
    useEffect(() => {
        if (!currentOrg) return;

        const fetchEmissions = async () => {
            try {
                const res = await fetch(`/api/emissions?organizationId=${currentOrg.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data);
                }
            } catch (error) {
                console.error("Failed to fetch emissions", error);
            }
        };
        fetchEmissions();
        localStorage.setItem("ghg_selected_org_id", currentOrg.id);

    }, [currentOrg]);

    const selectOrganization = (orgId: string) => {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            setCurrentOrg(org);
        }
    };

    const addEntry = async (entry: Partial<EmissionEntry>) => {
        if (!currentOrg) {
            alert("Selecione uma organização primeiro.");
            return;
        }

        // We cast to EmissionEntry for state optimistically, but ID/Date might be missing
        const tempId = entry.id || crypto.randomUUID();
        // @ts-ignore
        const optimisticEntry: EmissionEntry = { ...entry, id: tempId, organizationId: currentOrg.id, date: entry.date || new Date().toISOString() };

        setEntries(prev => [optimisticEntry, ...prev]);

        try {
            const res = await fetch('/api/emissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...entry, organizationId: currentOrg.id }),
            });

            if (!res.ok) throw new Error('Failed to save');

            const saved = await res.json();
            setEntries(prev => prev.map(e => e.id === tempId ? saved : e));

        } catch (error) {
            console.error(error);
            setEntries(prev => prev.filter(e => e.id !== tempId));
            alert("Erro ao salvar.");
        }
    };

    const removeEntry = async (id: string) => {
        const backup = entries.find(e => e.id === id);
        setEntries(prev => prev.filter(e => e.id !== id));

        try {
            const res = await fetch(`/api/emissions/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
        } catch (e) {
            if (backup) setEntries(prev => [...prev, backup]);
            alert("Erro ao excluir.");
        }
    };

    const clearAll = () => setEntries([]);

    const updateOrganization = async (data: OrganizationData) => {
        // Optimistic update
        if (currentOrg) {
            const updated = { ...currentOrg, ...data };
            setCurrentOrg(updated);
            setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));

            try {
                await fetch('/api/organizations', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error("Failed to sync org update", e);
                // Revert or notify? For now just log.
            }
        }
    };

    return (
        <EmissionsContext.Provider value={{
            entries,
            addEntry,
            removeEntry,
            clearAll,
            organization: currentOrg,
            updateOrganization,
            showOrgSettings,
            setShowOrgSettings,
            organizations,
            selectOrganization
        }}>
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
