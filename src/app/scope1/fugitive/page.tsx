import { FugitiveEmissionsForm } from "@/components/forms/FugitiveEmissionsForm";

export default function FugitiveEmissionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Scope 1: Fugitive Emissions</h1>
                <p className="text-muted-foreground">
                    Calculate emissions from refrigerant leaks and other fugitive gases (e.g. AC, Transformers).
                </p>
            </div>

            <FugitiveEmissionsForm />
        </div>
    )
}
