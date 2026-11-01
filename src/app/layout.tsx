import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'SymbioCarb AI | Tunisian Industrial Decarbonization & Symbiosis Hub',
  description: 'Enterprise B2B SaaS platform for Tunisian industrial SMEs: STEG MT/HT energy optimization, EU CBAM compliance, and BioClaira circular waste valorization.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className="dark">
      <body className="min-h-screen bg-[#090D16] text-gray-100 antialiased selection:bg-emerald-500 selection:text-black">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

