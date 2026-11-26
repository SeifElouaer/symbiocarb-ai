'use client';

// ==============================================================================
// Global Industrial Navbar (Restrained Obsidian Design, Trilingual & RTL-safe)
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuth } from '@/lib/auth/auth-context';
import { useAudit } from '@/lib/audit/audit-context';
import { LogOut, Plus } from 'lucide-react';

export function Navbar() {
  const { locale, setLocale, t } = useTranslation();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const { openAddDataModal } = useAudit();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080C14]/90 backdrop-blur-xl transition-all no-print">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm">
            SC
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                SymbioCarb <span className="text-emerald-400 font-mono text-sm">AI</span>
              </span>
              <span className="hidden md:inline-flex items-center rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-white/[0.08] font-mono">
                STEG MT • CBAM 2023/956
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-tight">
              {t.navbar.subtitle}
            </p>
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated && (
            <Link
              href="/cbam"
              className="hidden md:inline-flex items-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              {t.navbar.workspaceLink}
            </Link>
          )}

          <Link
            href="/blog"
            className="hidden lg:inline-flex items-center rounded-lg border border-white/[0.08] bg-[#0E1526]/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-white/20 hover:text-white transition-colors"
          >
            {t.navbar.regulationLink}
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#0E1526]/80 p-0.5">
            <button
              type="button"
              onClick={() => setLocale('fr')}
              className={`rounded px-2 py-1 text-xs font-medium transition-all ${
                locale === 'fr'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`rounded px-2 py-1 text-xs font-medium transition-all ${
                locale === 'en'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('ar-TN')}
              className={`rounded px-2 py-1 text-xs font-medium font-arabic transition-all ${
                locale === 'ar-TN'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عربي
            </button>
          </div>

          {/* Auth State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAddDataModal('steg')}
                className="btn-tactile hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 text-xs font-bold transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.navbar.addData}</span>
              </button>

              <div className="hidden md:flex flex-col text-end ps-1">
                <span className="text-xs font-semibold text-slate-200 leading-tight line-clamp-1">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={signOut}
                title={t.navbar.signOutTitle}
                className="btn-tactile flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <LogOut className="h-3.5 w-3.5 rtl:rotate-180" />
                <span className="hidden sm:inline">{t.navbar.signOut}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="hidden sm:inline-flex rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.05] transition-colors"
              >
                {t.navbar.signIn}
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="btn-tactile rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-1.5 text-xs font-bold transition-all"
              >
                {t.navbar.signUp}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
