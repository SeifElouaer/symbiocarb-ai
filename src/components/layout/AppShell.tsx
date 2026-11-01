'use client';

// ==============================================================================
// AppShell Client Component: Provides i18n Context, Navigation & Floating Drawer
// ==============================================================================

import React, { useState } from 'react';
import { I18nProvider } from '@/lib/i18n/use-translation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DarjaBotDrawer } from '@/components/telegram/DarjaBotDrawer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-[#090D16]">
        {/* Top Global Navigation Bar */}
        <Navbar onOpenCopilot={() => setCopilotOpen(true)} />

        {/* Workspace Body: Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onOpenCopilot={() => setCopilotOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        {/* Floating Mobile Simulator Drawer (DarjaBot) */}
        <DarjaBotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
      </div>
    </I18nProvider>
  );
}

