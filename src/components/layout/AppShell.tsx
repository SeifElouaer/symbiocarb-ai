'use client';

// ==============================================================================
// AppShell Client Component: Theme, Auth, i18n Context & Global Workspace Layout
// ==============================================================================

import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { I18nProvider } from '@/lib/i18n/use-translation';
import { AuditProvider } from '@/lib/audit/audit-context';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AuthModal } from '@/components/auth/AuthModal';
import { AuditWizardModal } from '@/components/audit/AuditWizardModal';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      {/* Top Global Navigation Bar */}
      <Navbar />

      {/* Workspace Body: Sidebar (when authenticated or browsing modules) + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Google OAuth & Email Auth Modal */}
      <AuthModal />

      {/* Guided Industrial Audit Wizard (5-Step Express) */}
      <AuditWizardModal />
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
