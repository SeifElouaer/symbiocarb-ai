'use client';

// ==============================================================================
// Global Industrial Navbar: Trilingual Switcher (FR/EN/AR-TN), Theme Switcher (Dark/Light),
// Persona Selector & User Auth State (Google / Demo)
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { useTranslation, PersonaSlug } from '@/lib/i18n/use-translation';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Building2, 
  Languages, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Flame, 
  BookOpen,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function Navbar() {
  const { locale, setLocale, persona, setPersona, t } = useTranslation();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md glow-emerald group-hover:scale-105 transition-transform">
            <Flame className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">
                SymbioCarb <span className="text-emerald-500">AI</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20 font-mono">
                SAAS v2.0
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {locale === 'ar-TN' ? 'منظومة الذكاء الكربوني للقطاع الصناعي التونسي' : 'Tunisian Industrial Decarbonization Hub'}
            </p>
          </div>
        </Link>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Regulatory Blog Link */}
          <Link
            href="/blog"
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-emerald-500/40 hover:text-emerald-500 transition-all shadow-sm"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-500" />
            <span>Centre Réglementaire</span>
          </Link>

          {/* Persona Switcher (if signed in) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-card-border bg-card p-1">
              <Building2 className="h-4 w-4 ms-2 text-emerald-500" />
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as PersonaSlug)}
                className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer pe-2 py-1"
              >
                <option value="benarous" className="bg-background text-foreground">
                  🏭 Ben Arous (Mécanique & CBAM)
                </option>
                <option value="tozeur" className="bg-background text-foreground">
                  🌴 Tozeur (Dattes & BioClaira)
                </option>
                <option value="sfax" className="bg-background text-foreground">
                  🫒 Sfax (Huilerie & Pointe STEG)
                </option>
              </select>
            </div>
          )}

          {/* Trilingual Language Selector */}
          <div className="flex items-center rounded-lg border border-card-border bg-card p-1">
            <Languages className="h-3.5 w-3.5 ms-1.5 me-1 text-muted-foreground" />
            <button
              onClick={() => setLocale('fr')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                locale === 'fr'
                  ? 'bg-emerald-500 text-black shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                locale === 'en'
                  ? 'bg-emerald-500 text-black shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ar-TN')}
              className={`rounded px-2 py-1 text-xs font-semibold font-arabic transition-all ${
                locale === 'ar-TN'
                  ? 'bg-emerald-500 text-black shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              تونسية
            </button>
          </div>

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-card-border bg-card text-muted-foreground hover:text-foreground transition-all shadow-sm"
            aria-label="Basculer le thème"
            title={resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-500" />
            )}
          </button>

          {/* Authentication State Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-end">
                <span className="text-xs font-bold text-foreground leading-tight line-clamp-1">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-emerald-500 font-mono">
                  {user.isDemo ? 'Mode Démo Usine' : 'Compte Vérifié'}
                </span>
              </div>

              <button
                onClick={signOut}
                title="Se déconnecter"
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md glow-emerald"
            >
              <User className="h-3.5 w-3.5" />
              <span>Connexion Usine</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
