import { MobileCombustionForm } from "@/components/forms/MobileCombustionForm";

export default function MobileCombustionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Scope 1: Mobile Combustion</h1>
                <p className="text-muted-foreground">
                    Calculate emissions from fleet vehicles and mobile equipment (Option 2: Fuel-based).
                </p>
            </div>

            <MobileCombustionForm />
        </div>
    )
}
