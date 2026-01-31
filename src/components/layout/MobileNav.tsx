'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Building2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { navItems } from '@/components/layout/Sidebar';
import { useEmissions } from '@/contexts/EmissionsContext';

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { setShowOrgSettings, organization } = useEmissions();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="flex h-full flex-col">
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">GHG SaaS</h1>
                        <p className="text-xs text-muted-foreground">Excel Protocol Fidelity</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                        {navItems.map((item, index) => (
                            <div key={index} className="mb-4">
                                {item.children ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </div>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={() => setOpen(false)}
                                            >
                                                <Button
                                                    variant={pathname === child.href ? 'secondary' : 'ghost'}
                                                    className="w-full justify-start pl-8 h-8 text-sm font-normal"
                                                >
                                                    {child.title}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <Link href={item.href} onClick={() => setOpen(false)}>
                                        <Button
                                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                                            className="w-full justify-start"
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                    <div className="p-4 border-t space-y-2">
                        <div className="px-2 py-1.5 text-xs text-muted-foreground border rounded bg-secondary/50">
                            <p className="font-semibold text-primary truncate">
                                {organization?.name || "Selecione uma Empresa"}
                            </p>
                            <p>Modo Consultor</p>
                        </div>

                        <Link href="/organizations" onClick={() => setOpen(false)}>
                            <Button variant="outline" className="w-full justify-start text-xs h-8">
                                <Building2 className="mr-2 h-3 w-3" />
                                Trocar Empresa
                            </Button>
                        </Link>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                setShowOrgSettings(true);
                                setOpen(false);
                            }}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Configurações da Empresa
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
