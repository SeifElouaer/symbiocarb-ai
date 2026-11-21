'use client';

// ==============================================================================
// SymbioCarb AI - Public Landing Page & Authenticated Industrial Cockpit
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useAudit } from '@/lib/audit/audit-context';
import {
  ArrowRight,
  Plus,
  Upload,
  Trash2,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function HomePage() {
  const { isAuthenticated, openAuthModal, subscriptionPlan } = useAuth();
  const { auditData, results, openAddDataModal, removeMonthlyBill } = useAudit();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // ============================================================================
  // AUTHENTICATED VIEW: REAL-DATA INDUSTRIAL COCKPIT (ZERO-STATE SAFE)
  // ============================================================================
  if (isAuthenticated) {
    const loadData = [
      { name: 'Jour', kWh: auditData.kwhJour, pct: results.pctJour, fill: '#10B981' },
      { name: 'Pointe', kWh: auditData.kwhPointe, pct: results.pctPointe, fill: '#EF4444' },
      { name: 'Soir', kWh: auditData.kwhSoir, pct: results.pctSoir, fill: '#F59E0B' },
      { name: 'Nuit', kWh: auditData.kwhNuit, pct: results.pctNuit, fill: '#3B82F6' },
    ];

    return (
      <div className="space-y-6">
        {/* Top Cockpit Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {auditData.companyName.trim() || 'Tableau de Bord Usine'}
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Conformité : {results.readinessScorePercent}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {auditData.governorate || auditData.industrialZone
                ? `${auditData.governorate}${auditData.governorate && auditData.industrialZone ? ' — ' : ''}${auditData.industrialZone}`
                : 'Supervision STEG MT, conformité carbone CBAM et saisie progressive des données.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => openAddDataModal('steg')}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter des données / Facture</span>
            </button>
            <Link
              href="/ocr"
              className="btn-tactile inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.08] transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Scanner un document</span>
            </Link>
          </div>
        </div>

        {/* Zero-State Callout when no factory data has been entered yet */}
        {!results.hasAnyData && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white">
                Votre usine démarre à zéro — prêt pour vos données réelles
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Aucune donnée fictive n&apos;est injectée. Importez une facture STEG (PDF, photo ou CSV) ou saisissez vos consommations manuellement pour calculer vos pourcentages énergétiques et votre exposition CBAM.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openAddDataModal('steg')}
                className="btn-tactile px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
              >
                Saisir une facture
              </button>
              <button
                onClick={() => openAddDataModal('profile')}
                className="px-4 py-2 rounded-xl border border-white/[0.12] text-xs font-semibold text-slate-200 hover:bg-white/[0.05]"
              >
                Profil usine
              </button>
            </div>
          </div>
        )}

        {/* 4 Core KPIs (Always strict real data or 0) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Carbon Footprint */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Empreinte Carbone</span>
              <span className="text-[10px] font-mono uppercase">Scope 1+2+3</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {results.totalTco2e.toLocaleString('fr-TN')}{' '}
              <span className="text-xs font-normal text-slate-400">tCO₂e/an</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono">
              SEE : {results.specificEmbeddedEmissionsTco2ePerTon} tCO₂e/t
            </div>
          </div>

          {/* KPI 2: STEG Bill */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Facture STEG Mensuelle</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                Pointe 0.412
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {results.estimatedMonthlyStegTnd.toLocaleString('fr-TN')}{' '}
              <span className="text-xs font-normal text-slate-400">TND/mois</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-2.5">
              Part Pointe : {results.pctPointe}% ({results.kwhTotal.toLocaleString('fr-TN')} kWh)
            </div>
          </div>

          {/* KPI 3: Reactive & Cos Phi */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Économies STEG / cos φ</span>
              <span className="text-[10px] font-mono uppercase text-slate-300">
                cos φ : {results.cosPhiCurrent > 0 ? results.cosPhiCurrent : '0.00'}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight tabular-nums">
              {results.totalAnnualStegSavingsTnd.toLocaleString('fr-TN')}{' '}
              <span className="text-xs font-normal text-slate-400">TND/an</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono">
              Condensateur requis : {results.requiredCapacitorKvar} kVAR
            </div>
          </div>

          {/* KPI 4: CBAM Tax Exposure */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Exposition CBAM UE</span>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">
                ETS 85 €/t
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {results.cbamTaxExposureEur.toLocaleString('fr-TN')}{' '}
              <span className="text-xs font-normal text-slate-400">€ / an</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono">
              Équivalent : {results.cbamTaxExposureTnd.toLocaleString('fr-TN')} TND
            </div>
          </div>
        </div>

        {/* Energy Breakdown Chart + Modules Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Répartition des consommations par tranche tarifaire STEG
                </h2>
                <p className="text-xs text-slate-400">
                  Pourcentages calculés directement sur vos relevés saisis ou scannés
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                <span>Jour {results.pctJour}%</span>
                <span className="text-slate-600">·</span>
                <span className="text-red-400">Pointe {results.pctPointe}%</span>
                <span className="text-slate-600">·</span>
                <span>Nuit {results.pctNuit}%</span>
              </div>
            </div>

            {results.kwhTotal > 0 ? (
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
                        fontSize: '11px',
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
            ) : (
              <div className="h-64 w-full rounded-xl border border-dashed border-white/[0.1] bg-black/20 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="text-sm font-semibold text-slate-300 font-mono">0 kWh enregistrés</div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Ajoutez votre première facture STEG ou importez un historique CSV pour visualiser la répartition horaire.
                </p>
                <button
                  onClick={() => openAddDataModal('steg')}
                  className="mt-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-emerald-400 border border-white/[0.08]"
                >
                  + Ajouter une facture
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Core Modules + Separate BioClaira Gold Card */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h2 className="text-sm font-bold text-white tracking-tight">Modules d&apos;Analyse</h2>
                <span className="text-[10px] font-mono text-slate-400">Calculs Réels</span>
              </div>

              <Link
                href="/energy"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-amber-500/40 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">
                    Optimisation STEG &amp; cos φ
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Condensateurs, effacement de pointe &amp; ANME
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400" />
              </Link>

              <Link
                href="/cbam"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-blue-500/40 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-400">
                    Conformité CBAM &amp; Export XML
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Inventaire Scope 1-2-3 &amp; déclaration UE
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400" />
              </Link>

              <Link
                href="/ocr"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-emerald-500/40 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                    Import &amp; Scanner Document AI
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Lecture automatique des factures PDF / photo
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400" />
              </Link>
            </div>

            {/* BioClaira Pack Gold Separate Add-on Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">BioClaira — Audit Déchets</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {subscriptionPlan === 'gold' ? 'Gold Actif' : 'Pack Gold'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Module séparé de valorisation des rejets industriels et d&apos;économie circulaire ({results.annualCircularValorizationTnd.toLocaleString('fr-TN')} TND/an).
              </p>
              <Link
                href="/symbiosis"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200"
              >
                <span>Ouvrir l&apos;audit séparé BioClaira</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Progressive Monthly Bill History */}
        <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Historique des relevés STEG enregistrés</h2>
              <p className="text-xs text-slate-400">
                {auditData.monthlyBills.length} période(s) enregistrée(s)
              </p>
            </div>
            <button
              onClick={() => openAddDataModal('steg')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              + Ajouter une période
            </button>
          </div>

          {auditData.monthlyBills.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-6 text-center text-xs text-slate-500">
              Aucune facture mensuelle enregistrée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] text-[10px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="py-2 pe-4">Période</th>
                    <th className="py-2 px-3">Total kWh</th>
                    <th className="py-2 px-3">Pointe kWh</th>
                    <th className="py-2 px-3">cos φ</th>
                    <th className="py-2 px-3">Montant TTC</th>
                    <th className="py-2 px-3">Source</th>
                    <th className="py-2 ps-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] font-mono">
                  {auditData.monthlyBills.map((b) => {
                    const tot = b.kwhJour + b.kwhPointe + b.kwhSoir + b.kwhNuit;
                    return (
                      <tr key={b.id} className="text-slate-200">
                        <td className="py-2.5 pe-4">
                          {String(b.month).padStart(2, '0')}/{b.year}
                        </td>
                        <td className="py-2.5 px-3">{tot.toLocaleString('fr-TN')}</td>
                        <td className="py-2.5 px-3 text-amber-400">{b.kwhPointe.toLocaleString('fr-TN')}</td>
                        <td className="py-2.5 px-3">{b.cosPhi > 0 ? b.cosPhi : '—'}</td>
                        <td className="py-2.5 px-3 text-emerald-400">
                          {b.totalTtcTnd.toLocaleString('fr-TN')} TND
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400">{b.source}</td>
                        <td className="py-2.5 ps-3 text-end">
                          <button
                            onClick={() => removeMonthlyBill(b.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // PUBLIC LANDING PAGE (UNAUTHENTICATED — ZERO PREVIEW, ZERO FAKE DATA)
  // ============================================================================
  return (
    <div className="space-y-24 py-6 sm:py-10">
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto text-center space-y-6 pt-4">
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-mono font-semibold text-emerald-400">
          Plateforme SaaS B2B Zéro-CAPEX • Industrie Exportatrice
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] font-sans">
          Conformité CBAM, Facture STEG &amp;{' '}
          <span className="text-emerald-400">Revenus Circulaires</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          <strong className="text-white">SymbioCarb AI</strong> répond à cette urgence par une plateforme logicielle SaaS B2B{' '}
          <strong className="text-white">zéro-CAPEX (sans installation matérielle)</strong> qui automatise la conformité carbone CBAM, optimise mathématiquement la facture STEG et transforme les rejets industriels en revenus circulaires.
        </p>

        {/* Primary Action: Account Creation / Sign In */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('signup')}
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3.5 text-sm font-bold text-black transition-all shadow-md"
          >
            <span>Créer un compte entreprise</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => openAuthModal('signin')}
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-[#0E1526]/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-all"
          >
            Se connecter
          </button>
        </div>

        {/* 3 Crisp Engineering Pillars (Type only, zero decorative icon noise) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-start">
          <div className="rounded-xl border border-white/[0.08] bg-[#0D1322]/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              01 / Zéro-CAPEX
            </div>
            <div className="text-sm font-bold text-white mt-1">Sans installation matérielle</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Exploitation directe de vos factures officielles STEG et relevés de production, par scan OCR ou saisie guidée.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0D1322]/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              02 / Optimisation STEG
            </div>
            <div className="text-sm font-bold text-white mt-1">Calcul mathématique exact</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Analyse des 4 tranches horaires, effacement de pointe et dimensionnement du facteur de puissance cos φ.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0D1322]/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              03 / Conformité CBAM UE
            </div>
            <div className="text-sm font-bold text-white mt-1">Déclarations douanières prêtes</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Calcul du SEE spécifique Scope 1-2-3 et génération du fichier XML conforme au Règlement (UE) 2023/956.
            </p>
          </div>
        </div>
      </section>

      {/* 2. REGULATORY REFERENCE BLOCK */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
              Cadre Réglementaire &amp; Normes
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Conformité Légale et Référentiels Techniques
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Consulter le centre réglementaire</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-blue-500/40 transition-all group space-y-2.5 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                CBAM UE 2023/956
              </span>
              <span className="text-[10px] font-mono text-slate-500">Export UE</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              Mécanisme d&apos;Ajustement Carbone aux Frontières
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calcul des Émissions Spécifiques Incorporées (SEE) réelles par code douanier CN à 8 chiffres et export XML DG TAXUD.
            </p>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-emerald-500/40 transition-all group space-y-2.5 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ISO 14064-1:2018
              </span>
              <span className="text-[10px] font-mono text-slate-500">Bilan GES</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Inventaire Gaz à Effet de Serre &amp; Réseau STEG
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comptabilisation structurée des Scopes 1, 2 et 3 intégrant le facteur d&apos;émission officiel du réseau électrique tunisien.
            </p>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-amber-500/40 transition-all group space-y-2.5 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                STEG MT &amp; ANME FTE
              </span>
              <span className="text-[10px] font-mono text-slate-500">ISO 50001</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Tarification Moyenne Tension &amp; Subventions FTE 70%
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Élimination des pénalités réactives (cos φ &lt; 0.85), maîtrise de la puissance appelée et mobilisation du Fonds de Transition Énergétique.
            </p>
          </Link>
        </div>
      </section>

      {/* 3. STARTUP SECTION: WHO WE ARE & MISSION */}
      <section className="rounded-3xl border border-white/[0.08] bg-[#0D1322]/70 p-6 sm:p-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              À Propos de Notre Startup
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              L&apos;ingénierie industrielle tunisienne au service de la compétitivité export
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              SymbioCarb AI est une startup DeepTech B2B fondée par des ingénieurs en efficacité énergétique, génie des procédés et architecture logicielle.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">Notre Mission</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Protéger les marges des usines tunisiennes face à la hausse des coûts électriques et aux nouvelles taxes carbone européennes (CBAM), sans nécessiter de cabinets de conseil longs ou coûteux.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">Approche Zéro-CAPEX</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aucun capteur IoT à acheter ni arrêt de production : vous importez vos documents officiels existants et nos modèles déterministes calculent immédiatement vos leviers d&apos;économie.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">Rigueur Mathématique</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toutes nos équations énergétiques et bilans carbone suivent strictement les arrêtés STEG, le Règlement UE 2023/956 et les référentiels ISO 14064-1 / 50001.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">Option Circulaire BioClaira</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pour les sites générant des sous-produits ou déchets valorisables, notre module avancé BioClaira transforme ces rejets en nouvelles sources de revenus circulaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT SAAS PRICING */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Offres d&apos;Abonnement B2B
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Des Forfaits Adaptés à Chaque Maturité Industrielle
          </h2>
          <p className="text-xs text-slate-400">
            Commencez par l&apos;optimisation énergétique et la conformité CBAM, puis activez l&apos;audit séparé des déchets BioClaira avec le Pack Gold.
          </p>

          <div className="inline-flex items-center rounded-xl border border-white/[0.08] bg-[#0E1526]/80 p-1 mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annuel</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pack Starter */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Pack Starter PME</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Diagnostic énergétique STEG et suivi mensuel
                </p>
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '150' : '190'} TND{' '}
                <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 pt-3 border-t border-white/[0.08]">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Analyse des 4 tranches horaires STEG MT</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Calcul batterie de condensateurs cos φ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Import CSV historique &amp; suivi mensuel</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-tactile w-full rounded-xl border border-white/[0.12] bg-white/[0.04] py-2.5 text-xs font-bold text-white hover:bg-white/[0.08]"
            >
              Créer un compte
            </button>
          </div>

          {/* Pack Exportateur Pro */}
          <div className="rounded-2xl glass-panel-elevated p-6 border-2 border-emerald-500/70 relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold font-mono uppercase tracking-wider">
              Recommandé Exportateurs
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Pack Exportateur Pro</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Conformité CBAM complète &amp; optimisation STEG
                </p>
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '390' : '490'} TND{' '}
                <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>
              <ul className="text-xs text-slate-200 space-y-2.5 pt-3 border-t border-white/[0.08]">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tout le Pack Starter PME inclus</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bilan Carbone Scope 1, 2 &amp; 3 (BOM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Export XML officiel douanes UE (CBAM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Scanner OCR des factures STEG (PDF / photo)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-tactile w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-black"
            >
              Démarrer avec Exportateur Pro
            </button>
          </div>

          {/* Pack Gold + BioClaira */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-amber-500/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Pack Gold + BioClaira</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Option Circulaire
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Conformité complète + audit séparé et valorisation des rejets
              </p>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '890' : '1 090'} TND{' '}
                <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 pt-3 border-t border-white/[0.08]">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Tout le Pack Exportateur Pro inclus</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Module BioClaira :</strong> audit séparé de vos déchets industriels
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Propositions de recyclage, valorisation &amp; revenus circulaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Intégration des crédits d&apos;émissions évitées au bilan global</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-tactile w-full rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
            >
              Choisir le Pack Gold
            </button>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-emerald-500/30 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Initialisez l&apos;espace de votre usine dès aujourd&apos;hui
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Créez votre compte, importez votre première facture STEG ou démarrez à zéro pour suivre vos consommations et votre conformité au fur et à mesure.
        </p>
        <div className="pt-2">
          <button
            onClick={() => openAuthModal('signup')}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3 text-sm font-bold text-black transition-all"
          >
            <span>Créer un compte entreprise</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
