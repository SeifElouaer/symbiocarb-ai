'use client';

// ==============================================================================
// AppShell Client Component: Theme, Auth, i18n, Guest Banner & Progressive Data
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { I18nProvider, useTranslation } from '@/lib/i18n/use-translation';
import { AuditProvider, useAudit } from '@/lib/audit/audit-context';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AuthModal } from '@/components/auth/AuthModal';
import { FactoryOnboardingModal } from '@/components/onboarding/FactoryOnboardingModal';
import { AddDataModal } from '@/components/audit/AddDataModal';

function GuestModeBanner() {
  const { isAuthenticated } = useAuth();
  const { loadDemoCase, resetAuditData, results } = useAudit();
  const { t } = useTranslation();
  const pathname = usePathname();

  if (isAuthenticated) return null;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/[0.06] px-4 sm:px-6 py-2 no-print">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-200">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="font-medium">{t.guest.badge}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadDemoCase}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/35 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/25 transition-colors"
          >
            <span className="rounded bg-blue-500 px-1 py-0.5 text-[9px] font-mono font-bold text-black">
              {t.guest.demoTag}
            </span>
            <span>{t.guest.loadDemo}</span>
          </button>
          {pathname === '/' && (
            <Link
              href="/cbam"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              {t.guest.openModules}
            </Link>
          )}
          {results.hasAnyData && (
            <button
              type="button"
              onClick={resetAuditData}
              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/[0.09] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t.guest.reset}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const showSidebar = isAuthenticated || pathname !== '/';

  return (
    <div className="flex min-h-screen flex-col bg-background bg-tech-pattern text-foreground transition-colors">
      <Navbar />
      <GuestModeBanner />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-200">{children}</div>
        </main>
      </div>

      <AuthModal />
      <FactoryOnboardingModal />
      <AddDataModal />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <AuditProvider>
            <AppShellInner>{children}</AppShellInner>
          </AuditProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
