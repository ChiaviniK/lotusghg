import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { EmissionsProvider } from '@/contexts/EmissionsContext';
import { OrganizationInfoDialog } from '@/components/layout/OrganizationInfoDialog';

const inter = Inter({ subsets: ['latin'] });
// ... metadata constants ...
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen flex bg-background`}>
        <EmissionsProvider>
          <OrganizationInfoDialog />
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </EmissionsProvider>
      </body>
    </html>
  );
}
