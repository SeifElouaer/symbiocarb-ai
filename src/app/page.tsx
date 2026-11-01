'use client';

// ==============================================================================
// SymbioCarb AI - Modern SaaS Analytics Landing Page & Executive Cockpit
// Public: Glassmorphism Hero, Interactive Data Viz, Relevant Articles, Pricing Table
// Authenticated: Unified Decarbonization Telemetry with Section Guide
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAudit } from '@/lib/audit/audit-context';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { 
  FALLBACK_BILLS, 
  FALLBACK_ORGANIZATIONS, 
  FALLBACK_SYMBIO_MATCHES 
} from '@/lib/supabase/fallback-data';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';
import { 
  Flame, 
  Zap, 
  Recycle, 
  Globe2, 
  FileSearch, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  TrendingDown, 
  Scale, 
  Clock, 
  ChevronRight,
  Layers,
  BarChart3,
  Lock,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

export default function HomePage() {
  const { isAuthenticated, openAuthModal, signInAsDemo } = useAuth();
  const { t, locale, persona } = useTranslation();
  const { openWizard, results } = useAudit();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Active persona bill and organization (used in both preview and cockpit)
  const bill = FALLBACK_BILLS[persona] || FALLBACK_BILLS.benarous;
  const org = FALLBACK_ORGANIZATIONS[persona] || FALLBACK_ORGANIZATIONS.benarous;

  // Real-time deterministic calculations
  const tariffCalc = calculateStegMtBill({
    kwhJour: bill.kwh_jour,
    kwhPointe: bill.kwh_pointe,
    kwhSoir: bill.kwh_soir,
    kwhNuit: bill.kwh_nuit,
    kvarhTotal: bill.kvarh_total,
    pSouscriteKva: bill.p_souscrite_kva,
    pMaxAppeleeKva: bill.p_max_appelee_kva,
  });

  const cosPhiCalc = solveCosPhiCompensation({
    activePowerKw: (bill.kwh_jour + bill.kwh_pointe) / 300,
    currentCosPhi: bill.cos_phi,
    targetCosPhi: 0.95,
    annualActiveKwh: bill.kwh_total * 12,
    annualReactivePenaltyTnd: bill.reactive_penalty_tnd * 12,
    hasHarmonicLoads: persona === 'benarous',
  });

  const loadData = [
    { name: 'Jour (نهار)', kWh: bill.kwh_jour, rate: '0.248 TND' },
    { name: 'Pointe (ذروة)', kWh: bill.kwh_pointe, rate: '0.412 TND' },
    { name: 'Soir (مساء)', kWh: bill.kwh_soir, rate: '0.235 TND' },
    { name: 'Nuit (ليل)', kWh: bill.kwh_nuit, rate: '0.188 TND' },
  ];

  // ============================================================================
  // SCENARIO 1: AUTHENTICATED USER -> EXECUTIVE INDUSTRIAL COCKPIT
  // ============================================================================
  if (isAuthenticated) {
    return (
      <div className="space-y-6">
        {/* Module Onboarding / Guide Header */}
        <SectionHeader
          title="Cockpit Décisionnel de Décarbonation"
          badge="Direction Générale & Énergie"
          badgeColor="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          objective="Superviser en temps réel la facture électrique STEG MT, l'exposition fiscale au CBAM européen et la valorisation circulaire des résidus industriels pour votre usine."
          inputs={[
            'Factures d\'électricité STEG MT (4 tranches horaires)',
            'Nomenclatures d\'achats BOM (matières & métaux)',
            'Volumes de résidus et déchets solides (dattes, grignons)'
          ]}
          deliverables={[
            'Diagnostic des pénalités STEG & effacement de pointe',
            'Bilan des émissions Scope 1, Scope 2 et Scope 3',
            'Passif financier CBAM estimé (cours quota ETS)',
            'Potentiel économique de pyrolyse BioClaira'
          ]}
          regulation="Règlement (UE) 2023/956, Arrêté Tarifaire STEG MT, Norme ISO 14064-1"
        />

        {/* Guided Industrial Audit Quick Launcher Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel-elevated border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-[#111827] to-transparent shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">
                  Assistant d&apos;Audit Énergétique & Décarbonation en 5 Étapes
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {results.readinessScorePercent}% Complété
                </span>
                {persona === 'custom' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Mode Données Réelles Usine
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Mode Consultation Démo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Renseignez les consommations réelles de votre usine (ou appliquez un profil certifié tunisien) pour remplacer 6 mois de cabinet d&apos;audit en 5 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={openWizard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 w-full sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Lancer / Modifier l&apos;Audit Guidé
            </button>
            <Link
              href="/audit"
              className="hidden sm:flex items-center justify-center px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
            >
              Vue Complète
            </Link>
          </div>
        </div>

        {/* 4 Core Industrial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl glass-panel-elevated p-5 border border-card-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold">{t.cockpit.kpiCarbonFootprint}</span>
              <Globe2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {(tariffCalc.co2Tons * 12).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">tCO₂e/an</span>
            </div>
            <div className="text-[11px] text-emerald-500 font-medium mt-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              <span>Facteur STEG : 0.473 kg/kWh</span>
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-5 border border-card-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold">{t.cockpit.kpiStegBill}</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {tariffCalc.totalTtcTnd.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">TND/mois</span>
            </div>
            <div className="text-[11px] text-amber-500 font-medium mt-2">
              Pointe : {((bill.kwh_pointe / bill.kwh_total) * 100).toFixed(1)}% de la conso
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-5 border border-card-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold">{t.cockpit.kpiCbamLiability}</span>
              <Scale className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-500 font-mono">
              {(cosPhiCalc.annualPenaltySavedTnd / 12).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">TND/mois</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">
              cos φ actuel : <span className="font-mono font-bold text-red-400">{bill.cos_phi}</span> (Cible: 0.95)
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-5 border border-card-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold">{t.cockpit.kpiSymbiosisRevenue}</span>
              <Recycle className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-500 font-mono">
              +184 000 <span className="text-xs font-normal text-muted-foreground">TND/an</span>
            </div>
            <div className="text-[11px] text-emerald-500 font-medium mt-2">
              Valorisation BioClaira active
            </div>
          </div>
        </div>

        {/* STEG MT Load Curve & Quick Action Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl glass-panel-elevated p-5 border border-card-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Courbe de Charge STEG Moyenne Tension</h2>
                <p className="text-xs text-muted-foreground">Répartition active des kWh selon les 4 tranches réglementaires</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                Pointe : 0.412 TND/kWh
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="kWh" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Direct Module Quick Links */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-card-border space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground">Modules Opérationnels Usine</h2>
              <div className="space-y-2">
                <Link
                  href="/audit"
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                        Assistant d&apos;Audit Guidé (5 Étapes)
                      </div>
                      <div className="text-[10px] text-muted-foreground">Diagnostic complet ISO & CBAM express</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-400" />
                </Link>

                <Link
                  href="/energy"
                  className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">
                        Optimisation STEG & Cos φ
                      </div>
                      <div className="text-[10px] text-muted-foreground">Dimensionner batterie condensateurs</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/cbam"
                  className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card hover:border-blue-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors">
                        Conformité CBAM & XML UE
                      </div>
                      <div className="text-[10px] text-muted-foreground">Générer rapport douanier officiel</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/symbiosis"
                  className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Recycle className="h-4 w-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                        BioClaira Valorisation
                      </div>
                      <div className="text-[10px] text-muted-foreground">Simulateur pyrolyse & bourse déchets</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/ocr"
                  className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSearch className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-purple-500 transition-colors">
                        Document AI & OCR Factures
                      </div>
                      <div className="text-[10px] text-muted-foreground">Extraction automatique Gemini 2.5</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            <Link
              href="/blog"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-card border border-card-border py-2 text-xs font-bold text-foreground hover:bg-white/5 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              <span>Consulter les Normes & Réglementations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCENARIO 2: PUBLIC VISITOR -> MODERN SAAS ANALYTICS DASHBOARD LANDING PAGE
  // ============================================================================
  return (
    <div className="space-y-16 py-4">
      {/* 1. HERO SECTION WITH REAL-TIME DATA VIZ PREVIEW */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-500">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Plateforme Déterministe pour l'Industrie Exportatrice Tunisienne</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
          L'Intelligence Énergétique & <br />
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
            Conformité Carbone CBAM
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Calculez vos émissions <span className="font-semibold text-foreground">CBAM UE</span> avec rigueur mathématique, éliminez les pénalités de pointe <span className="font-semibold text-foreground">STEG MT</span>, et valorisez vos sous-produits organiques avec les modèles cinétiques <span className="font-semibold text-foreground">BioClaira</span>.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-black hover:opacity-95 transition-all shadow-lg glow-emerald"
          >
            <span>Démarrer avec Google (Gmail)</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => signInAsDemo('benarous')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-white/5 transition-all"
          >
            <span>Accès Démo Immédiat (1-Click)</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </button>
        </div>

        {/* Hero Interactive Analytics Showcase Card */}
        <div className="pt-8">
          <div className="rounded-3xl glass-panel-elevated p-5 sm:p-7 border border-white/15 dark:border-white/10 shadow-2xl text-start space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-card-border">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-foreground">Aperçu en Direct du Cockpit Industriel</div>
                  <div className="text-[11px] text-muted-foreground font-mono">Usine de Mécanique (Ben Arous) • Facture STEG MT Postes Horaires</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  SEE : 1.48 tCO₂e/t
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  XML Homologué UE
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar inside Mockup */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-card p-3 border border-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Puissance Appelée</span>
                <div className="text-lg font-bold text-foreground font-mono mt-0.5">380 kVA</div>
                <span className="text-[10px] text-emerald-500">Souscrite : 450 kVA</span>
              </div>

              <div className="rounded-xl bg-card p-3 border border-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Facteur cos φ</span>
                <div className="text-lg font-bold text-amber-500 font-mono mt-0.5">0.78</div>
                <span className="text-[10px] text-red-500">Pénalité évitée: 14 200 TND</span>
              </div>

              <div className="rounded-xl bg-card p-3 border border-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Heures de Pointe</span>
                <div className="text-lg font-bold text-red-500 font-mono mt-0.5">14 200 kWh</div>
                <span className="text-[10px] text-muted-foreground">0.412 TND/kWh</span>
              </div>

              <div className="rounded-xl bg-card p-3 border border-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Passif CBAM</span>
                <div className="text-lg font-bold text-blue-500 font-mono mt-0.5">12 450 €</div>
                <span className="text-[10px] text-muted-foreground">Quota ETS : 85 €</span>
              </div>
            </div>

            {/* Real Chart inside Mockup */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="kWh" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RELEVANT ARTICLES & REGULATORY HUB SHOWCASE (Replaces generic badges as requested) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
              <Scale className="h-3.5 w-3.5" />
              <span>Base Réglementaire & Normes Certifiées</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Ressources et Articles de Référence
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <span>Voir tous les articles & décrets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-card-border hover:border-blue-500/40 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Règlementation CBAM
              </span>
              <span className="text-[10px] text-muted-foreground">8 min de lecture</span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors">
              Règlement UE 2023/956 : Guide Complet Exportateurs
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Obligations déclaratives, calcul du SEE et fin de l'utilisation des valeurs par défaut pour les industriels tunisiens.
            </p>
            <div className="text-[11px] text-blue-500 font-bold flex items-center gap-1 pt-1">
              <span>Consulter l'analyse</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-card-border hover:border-emerald-500/40 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Normes ISO Carbone
              </span>
              <span className="text-[10px] text-muted-foreground">10 min de lecture</span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
              Norme ISO 14064-1:2018 : Inventaire GES des Usines
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Méthodologie de calcul des Scopes 1, 2 et 3 avec le facteur national du réseau STEG à 0.473 kgCO₂e/kWh.
            </p>
            <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 pt-1">
              <span>Consulter l'analyse</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-card-border hover:border-amber-500/40 transition-all group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                STEG & ANME
              </span>
              <span className="text-[10px] text-muted-foreground">7 min de lecture</span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors">
              ISO 50001 & Subventions ANME FTE 70%
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Comment mobiliser le Fonds de Transition Énergétique pour financer les audits obligatoires et les condensateurs.
            </p>
            <div className="text-[11px] text-amber-500 font-bold flex items-center gap-1 pt-1">
              <span>Consulter l'analyse</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FOUR CORE ENGINE FEATURES (GLASSMORPHISM WITH ICONS) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quatre Briques d'Ingénierie Déterministe
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Aucune formule approximative par IA : tous les calculs sont régis par les normes ISO, le décret STEG et les coefficients JRC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Optimisation STEG MT & Dimensionnement Cos φ</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Calcul exact selon les 4 plages horaires (Jour, Pointe 0.412 TND, Soir, Nuit). Dimensionnement automatique du banc de condensateurs $Q_c = P(\tan \varphi_1 - \tan \varphi_2)$ avec réactances anti-harmoniques 189 Hz pour annuler les pénalités d'énergie réactive.
            </p>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Conformité Carbone CBAM & Export XML Officiel</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Calcul des Émissions Spécifiques Incorporées ($SEE$) pour les produits manufacturés tunisiens. Rapprochement vectoriel de vos nomenclatures (BOM) avec les bases ADEME/JRC et génération du fichier XML homologué par les douanes européennes.
            </p>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Recycle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">BioClaira : Valorisation & Pyrolyse des Résidus</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Modélisation cinétique de la pyrolyse des noyaux de dattes et grignons d'olive en charbon actif à haute surface BET (&gt; 1200 m²/g) et biochar. Cartographie géospatiale des opportunités de symbiose entre zones industrielles tunisiennes.
            </p>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <FileSearch className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Document AI : OCR Multimodal des Factures STEG</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspection split-screen alimentée par Gemini 2.5 Flash Vision. Déposez simplement vos factures papier STEG ou photos smartphone : extraction instantanée des kWh par tranche, des kVARh, du cos φ et de la puissance appelée avec validation de balance.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT SAAS PRICING TABLE */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Tarification B2B Transparente</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Des Forfaits Adaptés à Chaque Usine
          </h2>
          <p className="text-xs text-muted-foreground">
            Investissement rentabilisé dès le premier mois grâce aux économies réalisées sur vos pénalités STEG.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center rounded-xl border border-card-border bg-card p-1 mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Facturation Mensuelle
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Facturation Annuelle</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-700 text-white font-mono">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: PME Découverte */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">PME Découverte</h3>
                <p className="text-xs text-muted-foreground">Pour tester l'optimisation énergétique de votre usine</p>
              </div>

              <div className="text-3xl font-black text-foreground font-mono">
                0 TND <span className="text-xs font-normal text-muted-foreground">/ 30 jours</span>
              </div>

              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-card-border">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Diagnostic complet facture STEG MT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Calcul du banc de condensateurs cos φ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>1 rapport de pré-audit CBAM trimestriel</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/60">
                  <span>Export XML douanier UE non inclus</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => signInAsDemo('benarous')}
              className="w-full rounded-xl border border-card-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-white/5 transition-all"
            >
              Démarrer l'Essai Gratuit
            </button>
          </div>

          {/* Tier 2: Exportateur Pro (Recommandé) */}
          <div className="rounded-2xl glass-panel-elevated p-6 border-2 border-emerald-500 relative space-y-5 flex flex-col justify-between shadow-xl glow-emerald">
            <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold font-mono uppercase tracking-wider">
              Recommandé Exportateurs
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Exportateur Pro</h3>
                <p className="text-xs text-muted-foreground">Conformité totale CBAM et effacement des pointes STEG</p>
              </div>

              <div className="text-3xl font-black text-foreground font-mono">
                {billingCycle === 'annual' ? '390' : '490'} TND <span className="text-xs font-normal text-muted-foreground">/ mois</span>
              </div>

              <ul className="text-xs text-foreground space-y-2 pt-2 border-t border-card-border">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Déclarations trimestrielles CBAM illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Génération du fichier XML officiel UE</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Attestation PDF d'audit ISO 14064-1</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>OCR multimodal illimité de vos factures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Dossier d'éligibilité subvention ANME FTE 70%</span>
                </li>
              </ul>
            </div>

            <button
              onClick={openAuthModal}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md"
            >
              Souscrire avec Google (Gmail)
            </button>
          </div>

          {/* Tier 3: Groupe Industriel */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Groupe Industriel</h3>
                <p className="text-xs text-muted-foreground">Pour les groupes multisites et complexes industriels</p>
              </div>

              <div className="text-3xl font-black text-foreground font-mono">
                {billingCycle === 'annual' ? '1 090' : '1 290'} TND <span className="text-xs font-normal text-muted-foreground">/ mois</span>
              </div>

              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-card-border">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Gestion multi-usines (Sfax, Ben Arous, Bizerte)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Accès complet au réseau de symbiose BioClaira</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Intégration API / ERP comptable & SCADA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Accompagnement auditeur agréé tiers inclus</span>
                </li>
              </ul>
            </div>

            <button
              onClick={openAuthModal}
              className="w-full rounded-xl border border-card-border bg-card py-2.5 text-xs font-bold text-foreground hover:bg-white/5 transition-all"
            >
              Contacter l'Ingénierie
            </button>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-emerald-500/30 text-center space-y-4 glow-emerald">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          Prêt à Sécuriser Vos Exportations vers l'Union Européenne ?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Rejoignez les dizaines d'entreprises tunisiennes qui anticipent les audits CBAM et neutralisent leurs surcoûts électriques dès aujourd'hui.
        </p>
        <div className="pt-2">
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-bold text-black hover:opacity-95 transition-all shadow-lg"
          >
            <span>Créer mon Compte avec Google (Gmail)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
