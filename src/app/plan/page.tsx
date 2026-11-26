'use client';

// ==============================================================================
// SymbioCarb AI - Decarbonization Action Plan & Marginal Abatement Cost Curve
// Deterministic MACC ranking across STEG cos phi, load shifting, solar PV,
// low-carbon CBAM precursor switching, and BioClaira (Gold Pack).
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useAudit } from '@/lib/audit/audit-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { formatSignedAmount } from '@/lib/format/signed-amount';
import { AbatementLeverId, AbatementLeverResult } from '@/lib/engine/abatement-plan';
import { resolvePrecursorRelevance } from '@/lib/engine/cbam-calculator';
import { SOLAR_PV_CONFIG } from '@/lib/engine/solar-pv-sizer';
import {
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  Lock,
  Sliders,
} from 'lucide-react';

export default function ActionPlanPage() {
  const { t, locale } = useTranslation();
  const { auditData, results, updateAuditData } = useAudit();
  const { subscriptionPlan } = useAuth();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const plan = results.abatementPlan;
  const numLocale = locale === 'en' ? 'en-US' : 'fr-TN';

  const getLeverLabel = (labelKey: string): string => {
    const map = t.plan.levers as Record<string, string>;
    return map[labelKey] || labelKey;
  };

  const getMissingRoute = (leverId: AbatementLeverId): { href: string; label: string } => {
    if (leverId === 'bioclaira') return { href: '/symbiosis', label: t.plan.completeData };
    if (leverId === 'precursor_switch') return { href: '/cbam', label: t.plan.completeData };
    return { href: '/energy', label: t.plan.completeData };
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cbamBomItems = auditData.bomMaterials.filter((m) =>
    resolvePrecursorRelevance({
      name: m.name,
      cnCode8: m.cnCode8,
      quantityTons: m.quantityTons,
      efTco2ePerTon: m.efTco2ePerTon,
      isCbamRelevantPrecursor: m.isCbamRelevantPrecursor,
    })
  );

  // SVG MACC geometry (always left-to-right even in RTL mode)
  const svgW = 900;
  const svgH = 340;
  const margin = { top: 36, right: 24, bottom: 52, left: 74 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const curveLevers = plan.curveLevers;
  const totalAbatement = curveLevers.reduce((acc, l) => acc + l.annualTco2eAvoided, 0);
  const rawMin = Math.min(0, ...curveLevers.map((l) => l.costPerTco2Tnd));
  const rawMax = Math.max(0, ...curveLevers.map((l) => l.costPerTco2Tnd));
  const yMin = rawMin < 0 ? rawMin * 1.15 : -50;
  const yMax = rawMax > 0 ? rawMax * 1.15 : 100;
  const ySpan = Math.max(100, yMax - yMin);

  const yToPx = (val: number) => margin.top + ((yMax - val) / ySpan) * plotH;
  const yZero = yToPx(0);

  const yTicks = [yMax, yMax / 2, 0, yMin / 2, yMin].map((v) => Math.round(v));

  let cumX = 0;
  const maccBars = curveLevers.map((lever, idx) => {
    const fracW = totalAbatement > 0 ? lever.annualTco2eAvoided / totalAbatement : 0;
    const x = margin.left + cumX * plotW;
    const w = Math.max(8, fracW * plotW);
    cumX += fracW;
    const yCost = yToPx(lever.costPerTco2Tnd);
    const y = lever.costPerTco2Tnd >= 0 ? yCost : yZero;
    const h = Math.max(3, Math.abs(yCost - yZero));
    return { lever, idx, x, w, y, h, cumEndTco2e: Number((cumX * totalAbatement).toFixed(1)) };
  });

  const netSavingFmt = formatSignedAmount(plan.totalAnnualNetSavingTnd, 'TND/an', locale);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.plan.title}
        badge="MACC · WACC 8.5%"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        objective={t.plan.subtitle}
        inputs={[
          'Relevés STEG MT (cos φ, kWh Jour/Pointe)',
          'Nomenclature BOM CBAM & offres fournisseurs bas-carbone',
          'Surface toiture solaire (m²) et gisement déchets BioClaira (Pack Gold)',
        ]}
        deliverables={[
          'Courbe MAC triée par coût annualisé par tCO₂e évitée',
          'Distinction stricte empreinte ISO 14064-1 vs passif CBAM',
          'Synthèse financière CAPEX, gain net annuel et économie CBAM (€)',
        ]}
        regulation="CRF(8,5%, n), ANME FTE, Arrêté STEG MT & Règlement (UE) 2023/956"
      />

      {/* Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1">
          <div className="text-xs text-slate-400">{t.plan.totalsFootprintAvoided}</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {plan.hasAnyAvailableLever ? (
              <>
                {plan.totalFootprintAvoidedTco2e.toLocaleString(numLocale)}{' '}
                <span className="text-xs font-normal text-slate-400">tCO₂e/an</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-blue-500/25 p-5 space-y-1">
          <div className="text-xs text-slate-400">{t.plan.totalsCbamAvoided}</div>
          <div className="text-2xl font-extrabold font-mono text-blue-400 tabular-nums">
            {plan.hasAnyAvailableLever ? (
              <>
                {plan.totalCbamAvoidedTco2e.toLocaleString(numLocale)}{' '}
                <span className="text-xs font-normal text-slate-400">tCO₂e/an</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-blue-500/25 p-5 space-y-1">
          <div className="text-xs text-slate-400">
            {t.plan.totalsCbamSaved} ({plan.reportingYear})
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {plan.hasAnyAvailableLever ? (
              <>
                {plan.cbamAnnualSavedEur.toLocaleString(numLocale)}{' '}
                <span className="text-xs font-normal text-slate-400">€</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1">
          <div className="text-xs text-slate-400">{t.plan.totalsAnnualNetSaving}</div>
          <div className={`text-2xl font-extrabold font-mono tabular-nums ${plan.hasAnyAvailableLever ? netSavingFmt.colorClass : 'text-slate-500'}`}>
            {plan.hasAnyAvailableLever ? netSavingFmt.text : '—'}
          </div>
        </div>
      </div>

      {/* Custom SVG Marginal Abatement Cost Curve */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">{t.plan.chartTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.plan.chartSubtitle}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              &lt; 0 TND/t
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              &gt; 0 TND/t
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-300">
              <span className="h-2.5 w-2.5 rounded-sm border border-blue-400 bg-blue-500/30" />
              {t.plan.cbamBadge}
            </span>
          </div>
        </div>

        {curveLevers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-black/20 p-8 text-center space-y-2">
            <div className="text-sm font-bold text-slate-300">{t.plan.emptyTitle}</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{t.plan.emptyDesc}</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto ltr-only">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full min-w-[640px] h-auto font-mono select-none"
              role="img"
              aria-label={t.plan.chartTitle}
            >
              <defs>
                <pattern
                  id="cbamHatch"
                  width="8"
                  height="8"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#93C5FD" strokeWidth="2.5" strokeOpacity="0.65" />
                </pattern>
              </defs>

              {/* Horizontal Grid & Y-axis ticks */}
              {yTicks.map((val, i) => {
                const py = yToPx(val);
                return (
                  <g key={i}>
                    <line
                      x1={margin.left}
                      x2={svgW - margin.right}
                      y1={py}
                      y2={py}
                      stroke={val === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.06)'}
                      strokeDasharray={val === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={margin.left - 8}
                      y={py + 4}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="10"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis Label */}
              <text
                x={16}
                y={svgH / 2}
                transform={`rotate(-90 16 ${svgH / 2})`}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
              >
                TND / tCO₂e
              </text>

              {/* MACC Bars */}
              {maccBars.map(({ lever, idx, x, w, y, h, cumEndTco2e }) => {
                const isNeg = lever.costPerTco2Tnd < 0;
                const fill = isNeg ? '#10B981' : '#F59E0B';
                const labelY = isNeg ? y + h + 13 : y - 6;
                const costFmt = formatSignedAmount(lever.costPerTco2Tnd, '', locale, {
                  maximumFractionDigits: 0,
                });

                return (
                  <g
                    key={lever.id}
                    className="cursor-pointer"
                    onClick={() => toggleExpand(lever.id)}
                  >
                    <title>
                      {`${getLeverLabel(lever.labelKey)}: ${lever.annualTco2eAvoided} tCO₂e/yr @ ${costFmt.text} TND/tCO₂e`}
                    </title>
                    <rect
                      x={x + 1}
                      y={y}
                      width={Math.max(4, w - 2)}
                      height={h}
                      rx={3}
                      fill={fill}
                      fillOpacity={0.85}
                      stroke={lever.reducesCbamLiability ? '#60A5FA' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={lever.reducesCbamLiability ? 1.5 : 1}
                    />
                    {lever.reducesCbamLiability && (
                      <rect
                        x={x + 1}
                        y={y}
                        width={Math.max(4, w - 2)}
                        height={h}
                        rx={3}
                        fill="url(#cbamHatch)"
                      />
                    )}
                    {w >= 38 && (
                      <text
                        x={x + w / 2}
                        y={Math.min(svgH - 22, Math.max(16, labelY))}
                        textAnchor="middle"
                        fill="#E2E8F0"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {`#${idx + 1} ${lever.reducesCbamLiability ? '· CBAM' : ''}`}
                      </text>
                    )}
                    {w >= 54 && (
                      <text
                        x={x + w}
                        y={svgH - 18}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="9"
                      >
                        {cumEndTco2e}t
                      </text>
                    )}
                  </g>
                );
              })}

              {/* X-axis label */}
              <text
                x={margin.left + plotW / 2}
                y={svgH - 4}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
              >
                Abatement potential (tCO₂e / year)
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* Interactive Solver Controls (Solar PV, Load Shifting, Precursor Switch) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">{t.plan.pvControlsTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Surface toiture disponible (m², optionnel — 6 m²/kWp)
              </label>
              <input
                type="number"
                min="0"
                value={auditData.solarRoofAreaM2 || ''}
                placeholder="Illimitée (80% Jour)"
                onChange={(e) =>
                  updateAuditData({ solarRoofAreaM2: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Productible solaire (kWh/kWp/an)
              </label>
              <input
                type="number"
                min="100"
                value={auditData.solarYieldKwhPerKwp}
                placeholder={String(SOLAR_PV_CONFIG.DEFAULT_SPECIFIC_YIELD_KWH_PER_KWP_YEAR)}
                onChange={(e) =>
                  updateAuditData({
                    solarYieldKwhPerKwp:
                      Math.max(100, Number(e.target.value) || SOLAR_PV_CONFIG.DEFAULT_SPECIFIC_YIELD_KWH_PER_KWP_YEAR),
                  })
                }
                className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                CAPEX Solaire (TND/kWp)
              </label>
              <input
                type="number"
                min="0"
                value={auditData.solarCapexTndPerKwp}
                placeholder={String(SOLAR_PV_CONFIG.DEFAULT_CAPEX_TND_PER_KWP)}
                onChange={(e) =>
                  updateAuditData({
                    solarCapexTndPerKwp:
                      Math.max(0, Number(e.target.value) || SOLAR_PV_CONFIG.DEFAULT_CAPEX_TND_PER_KWP),
                  })
                }
                className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Part effaçable Pointe → Nuit ({auditData.flexibleLoadPct}%)
              </label>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={auditData.flexibleLoadPct}
                onChange={(e) => updateAuditData({ flexibleLoadPct: Number(e.target.value) })}
                className="w-full accent-emerald-500 mt-2 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{t.plan.precursorControlsTitle}</h3>
          {cbamBomItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-black/20 p-4 text-xs text-slate-400 flex items-center justify-between gap-3">
              <span>Ajoutez d&apos;abord un précurseur CBAM dans votre nomenclature BOM.</span>
              <Link href="/cbam" className="text-blue-400 font-semibold shrink-0 hover:underline">
                /cbam →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cbamBomItems.map((m) => {
                const sw = auditData.precursorSwitches[m.id];
                return (
                  <div
                    key={m.id}
                    className="rounded-xl border border-white/[0.08] bg-black/25 p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{m.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {m.quantityTons} t · actuel {m.efTco2ePerTon} tCO₂e/t
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          FE fournisseur alternatif (tCO₂e/t)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.05"
                          value={sw ? sw.alternativeEfTco2ePerTon : ''}
                          placeholder="Ex: 0.75 (EAF)"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const next = { ...auditData.precursorSwitches };
                            if (e.target.value === '' || !Number.isFinite(val)) {
                              delete next[m.id];
                            } else {
                              next[m.id] = {
                                alternativeEfTco2ePerTon: Math.max(0, val),
                                pricePremiumTndPerTon: sw?.pricePremiumTndPerTon ?? 0,
                              };
                            }
                            updateAuditData({ precursorSwitches: next });
                          }}
                          className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-2.5 py-1.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          Surcoût / prime prix (TND/t)
                        </label>
                        <input
                          type="number"
                          step="5"
                          value={sw ? sw.pricePremiumTndPerTon : ''}
                          placeholder="Ex: 80"
                          onChange={(e) => {
                            const prem = parseFloat(e.target.value);
                            const next = { ...auditData.precursorSwitches };
                            next[m.id] = {
                              alternativeEfTco2ePerTon:
                                sw?.alternativeEfTco2ePerTon ?? m.efTco2ePerTon,
                              pricePremiumTndPerTon: Number.isFinite(prem) ? prem : 0,
                            };
                            updateAuditData({ precursorSwitches: next });
                          }}
                          className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-2.5 py-1.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ranked Action Plan Table */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-start text-xs">
            <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4 text-start">#</th>
                <th className="py-2.5 px-4 text-start">{t.plan.colLever}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.colCo2}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.colCbamCo2}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.colCapex}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.colAnnualSaving}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.colPayback}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.colCostPerTonne}</th>
                <th className="py-2.5 px-4 text-end">{t.plan.assumptionsBtn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {[...plan.curveLevers, ...plan.financialOnlyLevers].map((lever, idx) => {
                const savingFmt = formatSignedAmount(lever.annualNetSavingTnd, 'TND', locale);
                const costFmt = lever.isFinancialOnly
                  ? { text: '—', colorClass: 'text-slate-400' }
                  : formatSignedAmount(lever.costPerTco2Tnd, 'TND/t', locale);
                const isExpanded = Boolean(expandedIds[lever.id]);

                return (
                  <React.Fragment key={lever.id}>
                    <tr className="text-slate-200 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {lever.isFinancialOnly ? '·' : idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{getLeverLabel(lever.labelKey)}</span>
                          {lever.reducesCbamLiability && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              {t.plan.cbamBadge}
                            </span>
                          )}
                          {lever.isFinancialOnly && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                              {t.plan.financialOnlyBadge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-end font-mono tabular-nums">
                        {lever.annualTco2eAvoided}
                      </td>
                      <td className="py-3 px-4 text-end font-mono tabular-nums text-blue-300">
                        {lever.cbamTco2eAvoided}
                      </td>
                      <td className="py-3 px-4 text-end font-mono tabular-nums">
                        {lever.capexTnd.toLocaleString(numLocale)}
                      </td>
                      <td className={`py-3 px-4 text-end font-mono tabular-nums font-semibold ${savingFmt.colorClass}`}>
                        {savingFmt.text}
                      </td>
                      <td className="py-3 px-4 text-end font-mono tabular-nums text-slate-300">
                        {lever.paybackYears !== null ? `${lever.paybackYears} ans` : '—'}
                      </td>
                      <td className={`py-3 px-4 text-end font-mono tabular-nums font-bold ${costFmt.colorClass}`}>
                        {costFmt.text}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          type="button"
                          onClick={() => toggleExpand(lever.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] px-2 py-1 text-[11px] text-slate-300 hover:bg-white/[0.06]"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          <span>{t.plan.assumptionsBtn}</span>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-black/30">
                        <td colSpan={9} className="px-6 py-3 text-[11px] text-slate-300 space-y-1">
                          {lever.assumptions.map((a, aIdx) => (
                            <div key={aIdx} className="font-mono">
                              • {a}
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Greyed-out Unavailable Levers with "Complete your data" link */}
              {plan.unavailableLevers.map((lever: AbatementLeverResult) => {
                const route = getMissingRoute(lever.id);
                return (
                  <tr key={lever.id} className="bg-black/20 text-slate-500 opacity-75">
                    <td className="py-3 px-4 font-mono">—</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {lever.id === 'bioclaira' && subscriptionPlan !== 'gold' && (
                          <Lock className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <span>{getLeverLabel(lever.labelKey)}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                          {t.plan.unavailableLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end font-mono">—</td>
                    <td className="py-3 px-4 text-end font-mono">—</td>
                    <td className="py-3 px-4 text-end font-mono">—</td>
                    <td className="py-3 px-4 text-end font-mono">—</td>
                    <td className="py-3 px-4 text-end font-mono">—</td>
                    <td className="py-3 px-4 text-end font-mono">—</td>
                    <td className="py-3 px-4 text-end">
                      <Link
                        href={route.href}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        <span>{route.label}</span>
                        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BioClaira Scope Note */}
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] px-4 py-3 text-xs text-amber-200 flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{t.plan.bioclairaNote}</span>
        </div>
      </div>
    </div>
  );
}
