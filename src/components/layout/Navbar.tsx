'use client';

// ==============================================================================
// Global Industrial Navbar: Trilingual Switcher (FR/EN/AR-TN), Regulatory Status,
// Persona Selector & User Auth State (Google / Demo)
// Enhanced with Taste Skill Industrial Precision Tokens
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { useTranslation, PersonaSlug } from '@/lib/i18n/use-translation';
import { useAuth } from '@/lib/auth/auth-context';
import { useAudit } from '@/lib/audit/audit-context';
import { 
  Building2, 
  Languages, 
  User, 
  LogOut, 
  Activity,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2
} from 'lucide-react';

export function Navbar() {
  const { locale, setLocale, persona, setPersona, t } = useTranslation();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const { openWizard } = useAudit();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080C14]/90 backdrop-blur-xl transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo with Bespoke Industrial Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-400/20 to-teal-500/5 border border-emerald-500/30 shadow-inner group-hover:border-emerald-400/60 transition-all">
            <svg 
              className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Geometric Carbon Lattice & Energy Frequency Motif */}
              <polygon points="12 2 20 7 20 17 12 22 4 17 4 7" />
              <polyline points="12 6 12 12 16 14" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#080C14]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                SymbioCarb <span className="text-emerald-400 font-mono text-sm tracking-normal">AI</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 font-mono tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STEG MT • CBAM 2023/956
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-tight">
              {locale === 'ar-TN' 
                ? 'منظومة الذكاء الكربوني والتعريفة الطاقية للصناعة التونسية' 
                : 'Plateforme Industrielle B2B • Décarbonation & Conformité Export'}
            </p>
          </div>
        </Link>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Express Audit Trigger */}
          <button
            onClick={openWizard}
            className="btn-tactile flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all shadow-sm"
            title="Lancer le pré-diagnostic express en 5 étapes"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 group-hover:text-black" />
            <span className="hidden sm:inline">Audit Express 5-Min</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Regulatory Resource Center Link */}
          <Link
            href="/blog"
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0E1526]/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-white transition-all shadow-sm"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            <span>Centre Réglementaire</span>
          </Link>

          {/* Persona & Operating Mode Switcher */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0E1526]/80 p-1">
              <Building2 className={`h-3.5 w-3.5 ms-2 ${persona === 'custom' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as PersonaSlug)}
                className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer pe-2 py-0.5"
              >
                <optgroup label="🏢 Données Réelles de l'Usine" className="bg-[#090D16] text-emerald-400 font-bold">
                  <option value="custom" className="bg-[#090D16] text-white">
                    🏢 Mon Usine (Données Réelles)
                  </option>
                </optgroup>
                <optgroup label="⚙️ Archétypes Démo & Pilotes" className="bg-[#090D16] text-amber-400 font-bold">
                  <option value="benarous" className="bg-[#090D16] text-white">
                    Ben Arous (Mécanique & CBAM)
                  </option>
                  <option value="tozeur" className="bg-[#090D16] text-white">
                    Tozeur (Agro & BioClaira)
                  </option>
                  <option value="sfax" className="bg-[#090D16] text-white">
                    Sfax (Huilerie & Pointe STEG)
                  </option>
                </optgroup>
              </select>
              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded me-1 ${
                persona === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {persona === 'custom' ? 'Réel' : 'Démo'}
              </span>
            </div>
          )}

          {/* Trilingual Segmented Pill Switcher */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#0E1526]/80 p-0.5">
            <Languages className="h-3 w-3 ms-1.5 me-1 text-slate-400" />
            <button
              onClick={() => setLocale('fr')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                locale === 'fr'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                locale === 'en'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ar-TN')}
              className={`rounded px-2 py-0.5 text-xs font-medium font-arabic transition-all ${
                locale === 'ar-TN'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عربي
            </button>
          </div>

          {/* Authentication State Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-end">
                <span className="text-xs font-semibold text-slate-200 leading-tight line-clamp-1">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {user.isDemo ? 'Profil Industriel' : 'Compte Certifié'}
                </span>
              </div>

              <button
                onClick={signOut}
                title="Se déconnecter"
                className="btn-tactile flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn-tactile flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm glow-emerald"
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
