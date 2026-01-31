'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flame,
  Zap,
  Truck,
  Factory,
  CloudFog,
  BookOpen,
  Settings,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEmissions } from '@/contexts/EmissionsContext';

export const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Escopo 1: Diretas',
    href: '/scope1',
    icon: Flame,
    children: [
      { title: 'Combustão Estacionária', href: '/scope1/stationary' },
      { title: 'Combustão Móvel', href: '/scope1/mobile' },
      { title: 'Emissões Fugitivas', href: '/scope1/fugitive' },
      { title: 'Processos Industriais', href: '/scope1/industrial' },
      { title: 'Atividades Agrícolas', href: '/scope1/agriculture' },
      { title: 'Mudança de Uso da Terra', href: '/scope1/land-use' },
      { title: 'Resíduos Sólidos', href: '/scope1/waste' },
      { title: 'Efluentes (Líquidos)', href: '/scope1/effluents' },
    ]
  },
  {
    title: 'Escopo 2: Indiretas',
    href: '/scope2',
    icon: Zap,
    children: [
      { title: 'Eletricidade (Localização)', href: '/scope2/location' },
      { title: 'Perdas T&D (2.2)', href: '/scope2/losses' },
      { title: 'Energia Térmica (Compra)', href: '/scope2/market' },
      { title: 'Eletricidade (Escolha)', href: '/scope2/market-electricity' },
    ]
  },
  {
    title: 'Escopo 3: Cadeia de Valor',
    href: '/scope3',
    icon: Truck,
    children: [
      { title: 'Inventário (Geral)', href: '/scope3/inventory' },
      { title: 'Transp. Upstream (Cat 4)', href: '/scope3/upstream-transport' },
      { title: 'Transp. Downstream (Cat 9)', href: '/scope3/downstream-transport' },
      { title: 'Viagens a Negócios', href: '/scope3/business-travel' },
      { title: 'Deslocamento Casa-Trabalho', href: '/scope3/commuting' },
      { title: 'Resíduos Sólidos', href: '/scope3/waste' },
      { title: 'Efluentes Líquidos', href: '/scope3/effluents' },
    ]
  },
  {
    title: 'Referências',
    href: '/references',
    icon: BookOpen,
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { setShowOrgSettings, organization } = useEmissions();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary">GHG SaaS</h1>
        <p className="text-xs text-muted-foreground">Excel Protocol Fidelity</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
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
              <Link href={item.href}>
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

        <Link href="/organizations">
          <Button variant="outline" className="w-full justify-start text-xs h-8">
            <Building2 className="mr-2 h-3 w-3" />
            Trocar Empresa
          </Button>
        </Link>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowOrgSettings(true)}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configurações da Empresa
        </Button>
      </div>
    </div>
  );
}
