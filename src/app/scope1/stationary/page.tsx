import { StationaryCombustionForm } from "@/components/forms/StationaryCombustionForm";

export default function StationaryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Stationary Combustion</h2>
                <p className="text-muted-foreground">
                    Scope 1 - Direct emissions from stationary sources (generators, boilers, etc.)
                </p>
            </div>
            <StationaryCombustionForm />
        </div>
    );
}
