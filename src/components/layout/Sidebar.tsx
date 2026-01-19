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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Scope 1: Direct',
    href: '/scope1',
    icon: Flame,
    children: [
      { title: 'Stationary Combustion', href: '/scope1/stationary' },
      { title: 'Mobile Combustion', href: '/scope1/mobile' },
      { title: 'Fugitive Emissions', href: '/scope1/fugitive' },
      { title: 'Industrial Processes', href: '/scope1/industrial' },
      { title: 'Agriculture Activities', href: '/scope1/agriculture' },
      { title: 'Land Use Change', href: '/scope1/land-use' },
      { title: 'Solid Waste Management', href: '/scope1/waste' },
      { title: 'Effluents (Liquid)', href: '/scope1/effluents' },
    ]
  },
  {
    title: 'Scope 2: Indirect',
    href: '/scope2',
    icon: Zap,
    children: [
      { title: 'Electricity (Location)', href: '/scope2/location' },
      { title: 'T&D Losses (2.2)', href: '/scope2/losses' },
      { title: 'Thermal Energy (Market)', href: '/scope2/market' },
      { title: 'Electricity (Market)', href: '/scope2/market-electricity' },
    ]
  },
  {
    title: 'Scope 3: Value Chain',
    href: '/scope3',
    icon: Truck,
    children: [
      { title: 'Inventory (General)', href: '/scope3/inventory' },
      { title: 'Transp. Upstream (Cat 4)', href: '/scope3/upstream-transport' },
      { title: 'Viagens a Negócios', href: '/scope3/business-travel' },
      { title: 'Deslocamento Casa-Trabalho', href: '/scope3/commuting' },
      { title: 'Resíduos Sólidos', href: '/scope3/waste' },
      { title: 'Efluentes Líquidos', href: '/scope3/effluents' },
    ]
  },
  {
    title: 'References',
    href: '/references',
    icon: BookOpen,
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
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
      <div className="p-4 border-t">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
