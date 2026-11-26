'use client';

// ==============================================================================
// SymbioCarb AI - Public Landing Page & Authenticated Industrial Cockpit
// Fully trilingual (FR / EN / AR-TN) with RTL mirroring and strict zero-state.
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useAudit } from '@/lib/audit/audit-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatSignedAmount } from '@/lib/format/signed-amount';
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
  const { t, locale } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const numLocale = locale === 'en' ? 'en-US' : 'fr-TN';

  // ============================================================================
  // AUTHENTICATED VIEW: REAL-DATA INDUSTRIAL COCKPIT (ZERO-STATE SAFE)
  // ============================================================================
  if (isAuthenticated) {
    const loadData = [
      { name: t.energy.jour.split(' ')[0], kWh: auditData.kwhJour, pct: results.pctJour, fill: '#10B981' },
      { name: t.energy.pointe.split(' ')[0], kWh: auditData.kwhPointe, pct: results.pctPointe, fill: '#EF4444' },
      { name: t.energy.soir.split(' ')[0], kWh: auditData.kwhSoir, pct: results.pctSoir, fill: '#F59E0B' },
      { name: t.energy.nuit.split(' ')[0], kWh: auditData.kwhNuit, pct: results.pctNuit, fill: '#3B82F6' },
    ];

    const hasCbamValuation =
      results.cbam.hasData &&
      results.cbam.hasProduction &&
      results.cbam.cbamScope.isInCbamScope;

    return (
      <div className="space-y-6">
        {/* Top Cockpit Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {auditData.companyName.trim() || t.cockpit.defaultFacilityTitle}
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.cockpit.readinessLabel} : {results.readinessScorePercent}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {auditData.governorate || auditData.industrialZone
                ? `${auditData.governorate}${auditData.governorate && auditData.industrialZone ? ' — ' : ''}${auditData.industrialZone}`
                : t.cockpit.defaultFacilitySubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openAddDataModal('steg')}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.cockpit.addDataBtn}</span>
            </button>
            <Link
              href="/ocr"
              className="btn-tactile inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.08] transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t.cockpit.scanDocBtn}</span>
            </Link>
          </div>
        </div>

        {/* Zero-State Callout when no factory data has been entered yet */}
        {!results.hasAnyData && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white">{t.cockpit.zeroStateTitle}</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {t.cockpit.zeroStateDesc}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAddDataModal('steg')}
                className="btn-tactile px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
              >
                {t.cockpit.zeroStateBillBtn}
              </button>
              <button
                type="button"
                onClick={() => openAddDataModal('profile')}
                className="px-4 py-2 rounded-xl border border-white/[0.12] text-xs font-semibold text-slate-200 hover:bg-white/[0.05]"
              >
                {t.cockpit.zeroStateProfileBtn}
              </button>
            </div>
          </div>
        )}

        {/* 4 Core KPIs (Always strict real data or clean empty state) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Corporate Carbon Footprint (Result A) */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">{t.cockpit.kpiCarbonFootprint}</span>
              <span className="text-[10px] font-mono uppercase">Scope 1+2+3</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {results.hasCarbonData ? (
                <>
                  {results.totalTco2e.toLocaleString(numLocale)}{' '}
                  <span className="text-xs font-normal text-slate-400">{t.cockpit.unitTco2e}</span>
                </>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono">
              {results.cbam.hasProduction
                ? `ISO: ${results.cbam.corporateFootprint.intensityTco2ePerTon} tCO₂e/t`
                : t.cockpit.emptyValue}
            </div>
          </div>

          {/* KPI 2: STEG Bill */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">{t.cockpit.kpiStegBill}</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                Pointe 0.412
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {results.hasEnergyData ? (
                <>
                  {results.estimatedMonthlyStegTnd.toLocaleString(numLocale)}{' '}
                  <span className="text-xs font-normal text-slate-400">{t.cockpit.unitTndMonth}</span>
                </>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-2.5">
              {results.hasEnergyData
                ? `${results.pctPointe}% Pointe (${results.kwhTotal.toLocaleString(numLocale)} kWh)`
                : t.cockpit.emptyValue}
            </div>
          </div>

          {/* KPI 3: Reactive & Cos Phi */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">{t.cockpit.kpiCosPhiSavings}</span>
              <span className="text-[10px] font-mono uppercase text-slate-300">
                cos φ : {results.cosPhiCurrent > 0 ? results.cosPhiCurrent : '—'}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight tabular-nums">
              {results.hasEnergyData ? (
                <>
                  {results.totalAnnualStegSavingsTnd.toLocaleString(numLocale)}{' '}
                  <span className="text-xs font-normal text-slate-400">{t.cockpit.unitTndYear}</span>
                </>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono">
              {results.hasEnergyData
                ? `${results.requiredCapacitorKvar} kVAR`
                : t.cockpit.emptyValue}
            </div>
          </div>

          {/* KPI 4: CBAM Tax Exposure (Result B - Single Source of Truth) */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">{t.cockpit.kpiCbamLiability}</span>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">
                {results.cbam.cbamScope.reportingYear} · {results.cbam.cbamScope.cbamCertificatePriceEur} €/t
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {hasCbamValuation ? (
                <>
                  {results.cbamTaxExposureEur.toLocaleString(numLocale)}{' '}
                  <span className="text-xs font-normal text-slate-400">{t.cockpit.unitEurYear}</span>
                </>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-2.5 font-mono">
              {hasCbamValuation
                ? `≈ ${results.cbamTaxExposureTnd.toLocaleString(numLocale)} TND (SEE ${results.specificEmbeddedEmissionsTco2ePerTon} tCO₂e/t)`
                : results.cbam.hasProduction && !results.cbam.cbamScope.isInCbamScope
                ? t.cbam.outsideScopeTitle
                : t.cockpit.emptyValue}
            </div>
          </div>
        </div>

        {/* Energy Breakdown Chart + Modules Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {t.cockpit.chartLoadTitle}
                </h2>
                <p className="text-xs text-slate-400">{t.cockpit.chartLoadSubtitle}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                <span>{results.pctJour}%</span>
                <span className="text-slate-600">·</span>
                <span className="text-red-400">{results.pctPointe}% Pointe</span>
                <span className="text-slate-600">·</span>
                <span>{results.pctNuit}%</span>
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
                <div className="text-sm font-semibold text-slate-300 font-mono">{t.cockpit.noKwhTitle}</div>
                <p className="text-xs text-slate-500 max-w-sm">{t.cockpit.noKwhDesc}</p>
                <button
                  type="button"
                  onClick={() => openAddDataModal('steg')}
                  className="mt-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-emerald-400 border border-white/[0.08]"
                >
                  {t.cockpit.addBillShort}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Core Modules + Separate BioClaira Gold Card */}
          <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h2 className="text-sm font-bold text-white tracking-tight">{t.cockpit.modulesTitle}</h2>
                <span className="text-[10px] font-mono text-slate-400">{t.cockpit.modulesTag}</span>
              </div>

              <Link
                href="/energy"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-amber-500/40 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">
                    {t.cockpit.moduleEnergyTitle}
                  </div>
                  <div className="text-[11px] text-slate-400">{t.cockpit.moduleEnergyDesc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 rtl:rotate-180 shrink-0" />
              </Link>

              <Link
                href="/cbam"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-blue-500/40 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-400">
                    {t.cockpit.moduleCbamTitle}
                  </div>
                  <div className="text-[11px] text-slate-400">{t.cockpit.moduleCbamDesc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 rtl:rotate-180 shrink-0" />
              </Link>

              <Link
                href="/ocr"
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-[#0E1526]/50 hover:border-emerald-500/40 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                    {t.cockpit.moduleOcrTitle}
                  </div>
                  <div className="text-[11px] text-slate-400">{t.cockpit.moduleOcrDesc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 rtl:rotate-180 shrink-0" />
              </Link>
            </div>

            {/* Action Plan MACC Cockpit Card */}
            {(() => {
              const plan = results.abatementPlan;
              const netFmt = formatSignedAmount(
                plan.totalAnnualNetSavingTnd,
                t.cockpit.unitTndYear,
                locale
              );
              return (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.cockpit.actionPlanCardTitle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      MACC
                    </span>
                  </div>
                  {plan.hasAnyAvailableLever ? (
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono tabular-nums">
                      {t.cockpit.actionPlanSummaryPrefix}{' '}
                      <strong className="text-white">
                        {plan.totalFootprintAvoidedTco2e.toLocaleString(numLocale)}
                      </strong>{' '}
                      {t.cockpit.actionPlanAvoidable},{' '}
                      <strong className={netFmt.colorClass}>{netFmt.text}</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t.cockpit.actionPlanEmpty}
                    </p>
                  )}
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    <span>{t.cockpit.openActionPlan}</span>
                    <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                  </Link>
                </div>
              );
            })()}

            {/* BioClaira Pack Gold Separate Add-on Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t.cockpit.bioclairaTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {subscriptionPlan === 'gold' ? 'Gold Actif' : 'Pack Gold'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {results.hasWasteData
                  ? `${results.annualCircularValorizationTnd.toLocaleString(numLocale)} ${t.cockpit.unitTndYear}`
                  : t.cockpit.emptyValue}
              </p>
              <Link
                href="/symbiosis"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200"
              >
                <span>{t.cockpit.bioclairaOpen}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Progressive Monthly Bill History */}
        <div className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">{t.cockpit.billsHistoryTitle}</h2>
              <p className="text-xs text-slate-400">
                {auditData.monthlyBills.length} {t.cockpit.billsCountSuffix}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAddDataModal('steg')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {t.cockpit.addPeriodBtn}
            </button>
          </div>

          {auditData.monthlyBills.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-6 text-center text-xs text-slate-500">
              {t.cockpit.noBillsMsg}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="border-b border-white/[0.08] text-[10px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="py-2 pe-4 text-start">Période</th>
                    <th className="py-2 px-3 text-start">Total kWh</th>
                    <th className="py-2 px-3 text-start">Pointe kWh</th>
                    <th className="py-2 px-3 text-start">cos φ</th>
                    <th className="py-2 px-3 text-start">TTC</th>
                    <th className="py-2 px-3 text-start">Source</th>
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
                        <td className="py-2.5 px-3">{tot.toLocaleString(numLocale)}</td>
                        <td className="py-2.5 px-3 text-amber-400">{b.kwhPointe.toLocaleString(numLocale)}</td>
                        <td className="py-2.5 px-3">{b.cosPhi > 0 ? b.cosPhi : '—'}</td>
                        <td className="py-2.5 px-3 text-emerald-400">
                          {b.totalTtcTnd.toLocaleString(numLocale)} TND
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400">{b.source}</td>
                        <td className="py-2.5 ps-3 text-end">
                          <button
                            type="button"
                            onClick={() => removeMonthlyBill(b.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Delete"
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
  // PUBLIC LANDING PAGE (UNAUTHENTICATED — FULL TRILINGUAL + RTL)
  // ============================================================================
  return (
    <div className="space-y-24 py-6 sm:py-10">
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto text-center space-y-6 pt-4">
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-mono font-semibold text-emerald-400">
          {t.landing.heroBadge}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
          {t.landing.heroTitlePrefix}{' '}
          <span className="text-emerald-400">{t.landing.heroTitleHighlight}</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          <strong className="text-white">{t.appName}</strong> {t.landing.heroDescriptionBefore}{' '}
          <strong className="text-white">{t.landing.heroDescriptionBold}</strong>{' '}
          {t.landing.heroDescriptionAfter}
        </p>

        {/* Primary Action: Account Creation / Sign In / Guest Workspace */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3.5 text-sm font-bold text-black transition-all shadow-md"
          >
            <span>{t.landing.ctaCreateAccount}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-[#0E1526]/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-all"
          >
            {t.landing.ctaSignIn}
          </button>

          <Link
            href="/cbam"
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            {t.landing.ctaOpenWorkspace}
          </Link>
        </div>

        {/* 3 Crisp Engineering Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-start">
          <div className="rounded-xl border border-white/[0.08] bg-[#0D1322]/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              {t.landing.pillars.p1Label}
            </div>
            <div className="text-sm font-bold text-white mt-1">{t.landing.pillars.p1Title}</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t.landing.pillars.p1Desc}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0D1322]/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              {t.landing.pillars.p2Label}
            </div>
            <div className="text-sm font-bold text-white mt-1">{t.landing.pillars.p2Title}</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t.landing.pillars.p2Desc}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0D1322]/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              {t.landing.pillars.p3Label}
            </div>
            <div className="text-sm font-bold text-white mt-1">{t.landing.pillars.p3Title}</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t.landing.pillars.p3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 2. REGULATORY REFERENCE BLOCK */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="text-start">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
              {t.landing.regulatory.eyebrow}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.landing.regulatory.title}
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>{t.landing.regulatory.linkText}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-start">
          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-blue-500/40 transition-all group space-y-2.5 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {t.landing.regulatory.card1Badge}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{t.landing.regulatory.card1Tag}</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              {t.landing.regulatory.card1Title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.landing.regulatory.card1Desc}
            </p>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-emerald-500/40 transition-all group space-y-2.5 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.landing.regulatory.card2Badge}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{t.landing.regulatory.card2Tag}</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              {t.landing.regulatory.card2Title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.landing.regulatory.card2Desc}
            </p>
          </Link>

          <Link
            href="/blog"
            className="rounded-2xl glass-panel-elevated p-5 border border-white/[0.08] hover:border-amber-500/40 transition-all group space-y-2.5 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {t.landing.regulatory.card3Badge}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{t.landing.regulatory.card3Tag}</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              {t.landing.regulatory.card3Title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.landing.regulatory.card3Desc}
            </p>
          </Link>
        </div>
      </section>

      {/* 3. STARTUP SECTION: WHO WE ARE & MISSION */}
      <section className="rounded-3xl border border-white/[0.08] bg-[#0D1322]/70 p-6 sm:p-10 space-y-6 text-start">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              {t.landing.about.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.landing.about.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.landing.about.intro}
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">{t.landing.about.missionTitle}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.landing.about.missionDesc}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">{t.landing.about.zeroCapexTitle}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.landing.about.zeroCapexDesc}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">{t.landing.about.mathTitle}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.landing.about.mathDesc}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-4 space-y-1.5">
              <div className="text-xs font-bold text-white">{t.landing.about.bioclairaTitle}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.landing.about.bioclairaDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT SAAS PRICING */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            {t.landing.pricing.eyebrow}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t.landing.pricing.title}
          </h2>
          <p className="text-xs text-slate-400">{t.landing.pricing.subtitle}</p>

          <div className="inline-flex items-center rounded-xl border border-white/[0.08] bg-[#0E1526]/80 p-1 mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.landing.pricing.monthly}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.landing.pricing.annual}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">
                {t.landing.pricing.discountBadge}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
          {/* Pack Starter */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">{t.landing.pricing.starterTitle}</h3>
                <p className="text-xs text-slate-400 mt-1">{t.landing.pricing.starterDesc}</p>
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '150' : '190'} TND{' '}
                <span className="text-xs font-normal text-slate-400">{t.landing.pricing.perMonth}</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 pt-3 border-t border-white/[0.08]">
                {t.landing.pricing.starterFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="btn-tactile w-full rounded-xl border border-white/[0.12] bg-white/[0.04] py-2.5 text-xs font-bold text-white hover:bg-white/[0.08]"
            >
              {t.landing.pricing.starterCta}
            </button>
          </div>

          {/* Pack Exportateur Pro */}
          <div className="rounded-2xl glass-panel-elevated p-6 border-2 border-emerald-500/70 relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold font-mono uppercase tracking-wider">
                {t.landing.pricing.proBadge}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">{t.landing.pricing.proTitle}</h3>
                <p className="text-xs text-slate-400 mt-1">{t.landing.pricing.proDesc}</p>
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '390' : '490'} TND{' '}
                <span className="text-xs font-normal text-slate-400">{t.landing.pricing.perMonth}</span>
              </div>
              <ul className="text-xs text-slate-200 space-y-2.5 pt-3 border-t border-white/[0.08]">
                {t.landing.pricing.proFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="btn-tactile w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-black"
            >
              {t.landing.pricing.proCta}
            </button>
          </div>

          {/* Pack Gold + BioClaira */}
          <div className="rounded-2xl glass-panel-elevated p-6 border border-amber-500/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white">{t.landing.pricing.goldTitle}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                  {t.landing.pricing.goldBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{t.landing.pricing.goldDesc}</p>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {billingCycle === 'annual' ? '890' : '1 090'} TND{' '}
                <span className="text-xs font-normal text-slate-400">{t.landing.pricing.perMonth}</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 pt-3 border-t border-white/[0.08]">
                {t.landing.pricing.goldFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="btn-tactile w-full rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
            >
              {t.landing.pricing.goldCta}
            </button>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-emerald-500/30 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {t.landing.finalCta.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {t.landing.finalCta.subtitle}
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-3 text-sm font-bold text-black transition-all"
          >
            <span>{t.landing.finalCta.button}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </section>
    </div>
  );
}
