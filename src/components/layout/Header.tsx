export function Header() {
    return (
        <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Organization: <strong>Demo Company</strong> | Inventory Year: <strong>2024</strong>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    JD
                </div>
            </div>
        </header>
    );
}
