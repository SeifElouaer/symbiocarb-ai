'use client';

// ==============================================================================
// SymbioCarb AI - Industrial SaaS Decarbonization Platform & Telemetry Cockpit
// Enhanced with Taste Skill 2.5 Industrial Precision & Obsidian Design Tokens
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
  DollarSign,
  Activity,
  Check,
  Cpu,
  Workflow,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell 
} from 'recharts';

export default function HomePage() {
  const { isAuthenticated, openAuthModal, signInAsDemo } = useAuth();
  const { t, locale, persona } = useTranslation();
  const { openWizard, results } = useAudit();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [heroTab, setHeroTab] = useState<'steg' | 'cbam' | 'bioclaira' | 'cosphi'>('steg');

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

  // STEG MT 4-rate distribution
  const loadData = [
    { name: 'Jour (نهار)', kWh: bill.kwh_jour, rate: '0.248 TND', fill: '#10B981' },
    { name: 'Pointe (ذروة)', kWh: bill.kwh_pointe, rate: '0.412 TND', fill: '#EF4444' },
    { name: 'Soir (مساء)', kWh: bill.kwh_soir, rate: '0.235 TND', fill: '#F59E0B' },
    { name: 'Nuit (ليل)', kWh: bill.kwh_nuit, rate: '0.188 TND', fill: '#3B82F6' },
  ];

  // CBAM Scope 1-2-3 Breakdown for Interactive Hero
  const cbamBreakdownData = [
    { name: 'Scope 1 (Direct Gaz/Fuel)', co2: 245, unit: 'tCO₂e', fill: '#EF4444' },
    { name: 'Scope 2 (Électricité STEG)', co2: 412, unit: 'tCO₂e', fill: '#F59E0B' },
    { name: 'Scope 3 (Matières & Fret)', co2: 820, unit: 'tCO₂e', fill: '#3B82F6' },
    { name: 'Symbiose BioClaira (Évité)', co2: 380, unit: 'tCO₂e', fill: '#10B981' },
  ];

  // BioClaira Pyrolysis Yields
  const bioClairaData = [
    { name: 'Charbon Actif BET', yield: 42, unit: '% masse', fill: '#10B981' },
    { name: 'Biochar Amendement', yield: 28, unit: '% masse', fill: '#059669' },
    { name: 'Syngas Énergétique', yield: 18, unit: '% masse', fill: '#3B82F6' },
    { name: 'Bio-huile Pyrolytique', yield: 12, unit: '% masse', fill: '#8B5CF6' },
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
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          objective="Superviser en temps réel la facture électrique STEG MT, l'exposition fiscale au CBAM européen et la valorisation circulaire des résidus industriels pour votre usine."
          inputs={[
            'Factures d\'électricité STEG MT (4 tranches horaires)',
            'Nomenclatures d\'achats BOM (matières & métaux)',
            'Volumes de résidus et déchets solides (dattes, grignons)'
          ]}
          deliverables={[
            'Diagnostic des pénalités STEG & effacement de pointe',
            'Bilan des émissions Scope 1, Scope 2 et Scope 3',
            'Passif financier CBAM estimé (cours quota ETS ~85 €/t)',
            'Potentiel économique de pyrolyse BioClaira'
          ]}
          regulation="Règlement (UE) 2023/956, Arrêté Tarifaire STEG MT, Norme ISO 14064-1"
        />

        {/* Guided Industrial Audit Quick Launcher Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel-elevated border border-white/[0.08] hover:border-emerald-500/30 transition-all card-hover">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Assistant d&apos;Audit Énergétique & Décarbonation en 5 Étapes
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 tabular-nums">
                  {results.readinessScorePercent}% Complété
                </span>
                {persona === 'custom' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Mode Données Réelles
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Archétype Démo Pilote
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Renseignez les consommations réelles de votre usine ou testez un archétype industriel tunisien pour automatiser 6 mois de cabinet d&apos;audit en 5 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={openWizard}
              className="btn-tactile flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-sm w-full sm:w-auto"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Lancer / Modifier l&apos;Audit
            </button>
            <Link
              href="/audit"
              className="btn-tactile hidden sm:flex items-center justify-center px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold border border-white/[0.08] transition-all"
            >
              Vue Détaillée
            </Link>
          </div>
        </div>

        {/* 4 Core Industrial KPIs (Taste Skill: Type over tiles, tabular figures, high contrast) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Empreinte Carbone */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] card-hover">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{t.cockpit.kpiCarbonFootprint}</span>
              <span className="text-[10px] font-mono uppercase text-slate-400">Scope 1+2</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {(tariffCalc.co2Tons * 12).toLocaleString()} <span className="text-xs font-normal text-slate-400">tCO₂e/an</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-2.5 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Facteur STEG réseau: 0.473 kg/kWh</span>
            </div>
          </div>

          {/* KPI 2: Facture STEG */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] card-hover">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{t.cockpit.kpiStegBill}</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Pointe 0.412</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {tariffCalc.totalTtcTnd.toLocaleString()} <span className="text-xs font-normal text-slate-400">TND/mois</span>
            </div>
            <div className="text-[11px] text-amber-400 font-medium mt-2.5">
              Pointe : {((bill.kwh_pointe / bill.kwh_total) * 100).toFixed(1)}% du total mensuel
            </div>
          </div>

          {/* KPI 3: Pénalités Réactives Cos φ */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] card-hover">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{t.cockpit.kpiCbamLiability}</span>
              <span className="text-[10px] font-mono text-red-400 uppercase font-semibold">cos φ: {bill.cos_phi}</span>
            </div>
            <div className="text-3xl font-extrabold text-red-400 font-mono tracking-tight tabular-nums">
              {(cosPhiCalc.annualPenaltySavedTnd / 12).toFixed(1)} <span className="text-xs font-normal text-slate-400">TND/mois</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5">
              Économie réalisable : <span className="font-mono font-bold text-emerald-400">{cosPhiCalc.annualPenaltySavedTnd.toLocaleString()} TND/an</span>
            </div>
          </div>

          {/* KPI 4: Recettes Symbiose BioClaira */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] card-hover">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">{t.cockpit.kpiSymbiosisRevenue}</span>
              <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold">BioClaira</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight tabular-nums">
              +184 000 <span className="text-xs font-normal text-slate-400">TND/an</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Pyrolyse BET &gt; 1200 m²/g certifiée</span>
            </div>
          </div>
        </div>

        {/* STEG MT Load Curve & Operational Module Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Courbe de Charge STEG Moyenne Tension</h2>
                <p className="text-xs text-slate-400">Répartition des kWh consommés par tranche tarifaire officielle</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                Pointe : 0.412 TND/kWh
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0F1D', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#F8FAFC',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="kWh" radius={[4, 4, 0, 0]}>
                    {loadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Module Access Links */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                <h2 className="text-sm font-bold text-white tracking-tight">Modules Opérationnels</h2>
                <span className="text-[10px] font-mono text-slate-400">ISO 50001 / CBAM</span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/audit"
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50 transition-all group card-hover"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Assistant d&apos;Audit Guidé (5 Étapes)
                      </div>
                      <div className="text-[10px] text-slate-400">Diagnostic complet ISO & CBAM express</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/energy"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-amber-500/40 transition-all group card-hover"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        Optimisation STEG & Cos φ
                      </div>
                      <div className="text-[10px] text-slate-400">Dimensionner banc de condensateurs $Q_c$</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/cbam"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-blue-500/40 transition-all group card-hover"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        Conformité CBAM & XML UE
                      </div>
                      <div className="text-[10px] text-slate-400">SEE spécifique & déclaration officielle</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/symbiosis"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-purple-500/40 transition-all group card-hover"
                >
                  <div className="flex items-center gap-2.5">
                    <Recycle className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                        Symbiose BioClaira & Pyrolyse
                      </div>
                      <div className="text-[10px] text-slate-400">Valorisation grignons d'olive & dattes</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] text-center">
              <span className="text-[10px] font-mono text-slate-400">
                Arrêté Énergétique STEG MT • Décret 2023/956 UE
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCENARIO 2: PUBLIC VISITOR -> TASTE SKILL HIGH-CRAFT LANDING PAGE
  // ============================================================================
  return (
    <div className="space-y-20 py-4">
      {/* 1. HERO SECTION WITH Bespoke Precision Editorial */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ingénierie Déterministe pour l'Industrie Exportatrice Tunisienne</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] font-sans">
          L&apos;Intelligence Énergétique & <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            Conformité Carbone CBAM
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Calculez vos émissions <span className="font-semibold text-white">CBAM UE (Règlement 2023/956)</span> avec rigueur mathématique, éliminez les pénalités de pointe <span className="font-semibold text-white">STEG MT</span>, et valorisez vos sous-produits organiques avec les modèles cinétiques <span className="font-semibold text-white">BioClaira</span>.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openAuthModal}
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-sm font-bold text-black transition-all shadow-md glow-emerald"
          >
            <span>Démarrer avec Google (Gmail)</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => signInAsDemo('benarous')}
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#0E1526]/80 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-all shadow-sm"
          >
            <span>Accès Démo Immédiat (1-Click)</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </button>
        </div>

        {/* Interactive Cockpit Preview Card (Taste Skill: Real Data, Tabbed Exploration) */}
        <div className="pt-8">
          <div className="rounded-3xl glass-panel-elevated p-5 sm:p-7 border border-white/[0.12] shadow-2xl text-start space-y-5">
            {/* Mockup Header Row with Switchable Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">
                    Cockpit Industriel Déterministe • Usine de Mécanique (Ben Arous)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Postes Horaires STEG MT • Déclarations CBAM EU ETS • Données Homologuées
                  </div>
                </div>
              </div>

              {/* Tab Switcher for Live Showcase */}
              <div className="flex items-center rounded-xl bg-black/50 border border-white/[0.08] p-1 gap-1 flex-wrap">
                <button
                  onClick={() => setHeroTab('steg')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    heroTab === 'steg'
                      ? 'bg-emerald-500 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Profil STEG
                </button>
                <button
                  onClick={() => setHeroTab('cbam')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    heroTab === 'cbam'
                      ? 'bg-emerald-500 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌍 Bilan CBAM
                </button>
                <button
                  onClick={() => setHeroTab('bioclaira')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    heroTab === 'bioclaira'
                      ? 'bg-emerald-500 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔄 BioClaira
                </button>
              </div>
            </div>

            {/* Live Metrics Row inside Mockup */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-[#0E1526]/80 p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Puissance Appelée</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5 tabular-nums">380 kVA</div>
                <span className="text-[10px] text-emerald-400">Souscrite : 450 kVA</span>
              </div>

              <div className="rounded-xl bg-[#0E1526]/80 p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Facteur cos φ</span>
                <div className="text-lg font-bold text-amber-400 font-mono mt-0.5 tabular-nums">0.78</div>
                <span className="text-[10px] text-red-400 font-mono">Pénalité: 14 200 TND</span>
              </div>

              <div className="rounded-xl bg-[#0E1526]/80 p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Heures de Pointe</span>
                <div className="text-lg font-bold text-red-400 font-mono mt-0.5 tabular-nums">14 200 kWh</div>
                <span className="text-[10px] text-slate-400 font-mono">0.412 TND/kWh</span>
              </div>

              <div className="rounded-xl bg-[#0E1526]/80 p-3 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Passif CBAM UE</span>
                <div className="text-lg font-bold text-blue-400 font-mono mt-0.5 tabular-nums">12 450 €</div>
                <span className="text-[10px] text-slate-400 font-mono">SEE: 1.48 tCO₂e/t</span>
              </div>
            </div>

            {/* Dynamic Visual Content depending on Hero Tab */}
            <div className="h-60 w-full pt-2">
              {heroTab === 'steg' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0F1D', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }} 
                    />
                    <Bar dataKey="kWh" radius={[4, 4, 0, 0]}>
                      {loadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {heroTab === 'cbam' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cbamBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0F1D', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }} 
                    />
                    <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
                      {cbamBreakdownData.map((entry, index) => (
                        <Cell key={`cbam-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {heroTab === 'bioclaira' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bioClairaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0F1D', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }} 
                    />
                    <Bar dataKey="yield" radius={[4, 4, 0, 0]}>
                      {bioClairaData.map((entry, index) => (
                        <Cell key={`bio-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bottom Proof Strip inside Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-white/[0.08] text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Conforme Spécifications XML DG TAXUD Union Européenne</span>
              </span>
              <span>Arrêté Ministériel STEG MT 2023-01 Validé</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RELEVANT ARTICLES & REGULATORY HUB SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Scale className="h-3.5 w-3.5" />
              <span>Base Réglementaire & Normes Certifiées</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ressources et Articles de Référence
            </h2>
          </div>

          <Link
            href="/blog"
            className="btn-tactile inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Voir tous les articles & décrets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-blue-500/40 transition-all group space-y-3 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Règlementation CBAM
              </span>
              <span className="text-[10px] text-slate-400">8 min de lecture</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              Règlement UE 2023/956 : Guide Complet Exportateurs
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              Obligations déclaratives, calcul du SEE et fin de l'utilisation des valeurs par défaut pour les industriels tunisiens.
            </p>
            <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1 pt-1">
              <span>Consulter l'analyse</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-emerald-500/40 transition-all group space-y-3 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Normes ISO Carbone
              </span>
              <span className="text-[10px] text-slate-400">10 min de lecture</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Norme ISO 14064-1:2018 : Inventaire GES des Usines
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              Méthodologie de calcul des Scopes 1, 2 et 3 avec le facteur national du réseau STEG à 0.473 kgCO₂e/kWh.
            </p>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 pt-1">
              <span>Consulter l'analyse</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-amber-500/40 transition-all group space-y-3 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                STEG & ANME
              </span>
              <span className="text-[10px] text-slate-400">7 min de lecture</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              ISO 50001 & Subventions ANME FTE 70%
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              Comment mobiliser le Fonds de Transition Énergétique pour financer les audits obligatoires et les condensateurs.
            </p>
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 pt-1">
              <span>Consulter l'analyse</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FOUR CORE ENGINE FEATURES */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Quatre Briques d&apos;Ingénierie Déterministe
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Aucune formule approximative par IA : tous les calculs sont régis par les normes ISO, le décret STEG et les coefficients JRC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Brique 1 */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3 card-hover">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Décret STEG 2023-01
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Optimisation STEG MT & Dimensionnement Cos φ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calcul exact selon les 4 plages horaires (Jour, Pointe 0.412 TND, Soir, Nuit). Dimensionnement automatique du banc de condensateurs $Q_c = P(\tan \varphi_1 - \tan \varphi_2)$ avec réactances anti-harmoniques 189 Hz pour annuler les pénalités d&apos;énergie réactive.
            </p>
          </div>

          {/* Brique 2 */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3 card-hover">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                UE 2023/956 MACF
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Conformité Carbone CBAM & Export XML Officiel</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calcul des Émissions Spécifiques Incorporées ($SEE$) pour les produits manufacturés tunisiens. Rapprochement vectoriel de vos nomenclatures (BOM) avec les bases ADEME/JRC et génération du fichier XML homologué par les douanes européennes.
            </p>
          </div>

          {/* Brique 3 */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3 card-hover">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Recycle className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BET &gt; 1200 m²/g
              </span>
            </div>
            <h3 className="text-base font-bold text-white">BioClaira : Valorisation & Pyrolyse des Résidus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modélisation cinétique de la pyrolyse des noyaux de dattes et grignons d&apos;olive en charbon actif à haute surface BET et biochar. Cartographie géospatiale des opportunités de symbiose entre zones industrielles tunisiennes.
            </p>
          </div>

          {/* Brique 4 */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3 card-hover">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileSearch className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Gemini 2.5 Flash
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Document AI : OCR Multimodal des Factures STEG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspection split-screen alimentée par vision multimodale. Déposez simplement vos factures papier STEG ou photos smartphone : extraction instantanée des kWh par tranche, des kVARh, du cos φ et de la puissance appelée avec validation de balance comptable.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT SAAS PRICING TABLE */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Tarification B2B Transparente</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Des Forfaits Adaptés à Chaque Usine
          </h2>
          <p className="text-xs text-slate-400">
            Investissement rentabilisé dès le premier mois grâce aux économies réalisées sur vos pénalités STEG.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center rounded-xl border border-white/[0.08] bg-[#0E1526]/80 p-1 mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`btn-tactile rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Facturation Mensuelle
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`btn-tactile rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Facturation Annuelle</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-black font-mono font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: PME Découverte */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-5 flex flex-col justify-between card-hover">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">PME Découverte</h3>
                <p className="text-xs text-slate-400">Pour tester l&apos;optimisation énergétique de votre usine</p>
              </div>

              <div className="text-3xl font-black text-white font-mono tabular-nums">
                0 TND <span className="text-xs font-normal text-slate-400">/ 30 jours</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-white/[0.08]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Diagnostic complet facture STEG MT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Calcul du banc de condensateurs cos φ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>1 rapport de pré-audit CBAM trimestriel</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span>Export XML douanier UE non inclus</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => signInAsDemo('benarous')}
              className="btn-tactile w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-xs font-bold text-white hover:bg-white/[0.08] transition-all"
            >
              Démarrer l&apos;Essai Gratuit
            </button>
          </div>

          {/* Tier 2: Exportateur Pro (Recommandé) */}
          <div className="rounded-2xl glass-panel-elevated p-6 border-2 border-emerald-500/70 relative space-y-5 flex flex-col justify-between shadow-xl glow-emerald card-hover">
            <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold font-mono uppercase tracking-wider">
              Recommandé Exportateurs
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Exportateur Pro</h3>
                <p className="text-xs text-slate-400">Conformité totale CBAM et effacement des pointes STEG</p>
              </div>

              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '390' : '490'} TND <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>

              <ul className="text-xs text-slate-200 space-y-2 pt-2 border-t border-white/[0.08]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Déclarations trimestrielles CBAM illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Génération du fichier XML officiel UE</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Attestation PDF d&apos;audit ISO 14064-1</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>OCR multimodal illimité de vos factures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Dossier d&apos;éligibilité subvention ANME FTE 70%</span>
                </li>
              </ul>
            </div>

            <button
              onClick={openAuthModal}
              className="btn-tactile w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-black transition-all shadow-md"
            >
              Souscrire avec Google (Gmail)
            </button>
          </div>

          {/* Tier 3: Groupe Industriel */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-5 flex flex-col justify-between card-hover">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Groupe Industriel</h3>
                <p className="text-xs text-slate-400">Pour les groupes multisites et complexes industriels</p>
              </div>

              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '1 090' : '1 290'} TND <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-white/[0.08]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Gestion multi-usines (Sfax, Ben Arous, Bizerte)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Accès complet au réseau de symbiose BioClaira</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Intégration API / ERP comptable & SCADA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Accompagnement auditeur agréé tiers inclus</span>
                </li>
              </ul>
            </div>

            <button
              onClick={openAuthModal}
              className="btn-tactile w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-xs font-bold text-white hover:bg-white/[0.08] transition-all"
            >
              Contacter l&apos;Ingénierie
            </button>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-emerald-500/30 text-center space-y-4 glow-emerald">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
          Prêt à Sécuriser Vos Exportations vers l&apos;Union Européenne ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Rejoignez les dizaines d&apos;entreprises tunisiennes qui anticipent les audits CBAM et neutralisent leurs surcoûts électriques dès aujourd&apos;hui.
        </p>
        <div className="pt-2">
          <button
            onClick={openAuthModal}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-black transition-all shadow-md"
          >
            <span>Créer mon Compte avec Google (Gmail)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
