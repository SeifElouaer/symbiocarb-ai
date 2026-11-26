'use client';

// ==============================================================================
// Module CBAM: EU Carbon Border Adjustment Mechanism (2026+ Definitive Period)
// Displays Result A (ISO 14064-1 Corporate) vs Result B (CBAM Scope),
// 2026-2034 phase-in chart, de minimis 50t threshold, BOM precursor flags & XML.
// ==============================================================================

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAudit } from '@/lib/audit/audit-context';
import { FIELD_GUIDES } from '@/lib/ux/field-guides';
import { FieldLabel, FieldHint } from '@/components/ui/FieldLabel';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { AuditReportDialog } from '@/components/cbam/AuditReportDialog';
import { FALLBACK_EMISSION_FACTORS } from '@/lib/supabase/fallback-data';
import {
  CBAM_DE_MINIMIS_TONNES_PER_YEAR,
  CBAM_PHASE_IN_YEARS,
  STEG_GRID_EF_KG_CO2E_PER_KWH,
  getFreeAllocationFactor,
  isCbamPrecursorCnCode,
} from '@/lib/engine/cbam-config';
import { projectCbamLiabilityByYear } from '@/lib/engine/cbam-calculator';
import { compareDefaultVsActual } from '@/lib/engine/cbam-default-comparator';
import { lookupDefaultValue } from '@/lib/engine/cbam-default-values';
import { formatSignedAmount } from '@/lib/format/signed-amount';
import {
  buildCbamInputFromPayload,
  buildCbamXmlFilename,
  validateCbamXmlInput,
} from '@/lib/engine/cbam-xml';
import { BomEntry } from '@/types';
import {
  Download,
  Printer,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Copy,
  Check,
  Info,
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

export default function CbamPage() {
  const { t, locale } = useTranslation();
  const {
    auditData,
    results,
    updateAuditData,
    addBomMaterial,
    updateBomMaterial,
    removeBomMaterial,
    openAddDataModal,
  } = useAudit();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedResults, setMatchedResults] = useState(FALLBACK_EMISSION_FACTORS);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isExportingXml, setIsExportingXml] = useState(false);
  const [xmlError, setXmlError] = useState<string | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Inline BOM entry form
  const [bomName, setBomName] = useState('');
  const [bomCn, setBomCn] = useState('');
  const [bomQty, setBomQty] = useState('');
  const [bomEf, setBomEf] = useState('');

  const numLocale = locale === 'en' ? 'en-US' : 'fr-TN';
  const cbamResult = results.cbam;
  const corp = cbamResult.corporateFootprint;
  const cbam = cbamResult.cbamScope;

  const tableDefaultEntry = useMemo(
    () => lookupDefaultValue(auditData.exportCnCode, 'TN'),
    [auditData.exportCnCode]
  );

  const defaultComparison = useMemo(
    () =>
      compareDefaultVsActual({
        cbamResult,
        overrideDefaultSee: auditData.euDefaultSeeOverride,
      }),
    [cbamResult, auditData.euDefaultSeeOverride]
  );

  const displayedDefaultSeeInput =
    auditData.euDefaultSeeOverride !== null && auditData.euDefaultSeeOverride > 0
      ? String(auditData.euDefaultSeeOverride)
      : defaultComparison.isFromTable && defaultComparison.defaultSeeBase > 0
      ? String(defaultComparison.defaultSeeBase)
      : '';

  const xmlPayload = useMemo(
    () => ({
      companyName: auditData.companyName,
      fiscalId: auditData.fiscalId,
      governorate: auditData.governorate,
      industrialZone: auditData.industrialZone,
      exportCnCode: auditData.exportCnCode,
      exportProductName: auditData.exportProductName,
      annualProductionTons: auditData.annualProductionTons,
      annualExportTons: auditData.annualExportTons,
      naturalGasM3: auditData.naturalGasM3,
      heavyFuelTons: auditData.heavyFuelTons,
      dieselLiters: auditData.dieselLiters,
      kwhJour: auditData.kwhJour,
      kwhPointe: auditData.kwhPointe,
      kwhSoir: auditData.kwhSoir,
      kwhNuit: auditData.kwhNuit,
      steelTons: auditData.steelTons,
      aluminumTons: auditData.aluminumTons,
      bomMaterials: auditData.bomMaterials,
      cbamReportingYear: auditData.cbamReportingYear,
      cbamCertificatePriceEur: auditData.cbamCertificatePriceEur,
      carbonPricePaidAbroadEur: auditData.carbonPricePaidAbroadEur,
      euDefaultSeeOverride: auditData.euDefaultSeeOverride,
      defaultComparisonInformative: defaultComparison.hasDefaultValue
        ? {
            defaultSeeBase: defaultComparison.defaultSeeBase,
            markupPct: defaultComparison.markupPct,
            defaultSeeWithMarkup: defaultComparison.defaultSeeWithMarkup,
            liabilityDefaultEur: defaultComparison.liabilityDefaultEur,
            liabilityActualEur: defaultComparison.liabilityActualEur,
            savingForImporterEur: defaultComparison.savingForImporterEur,
            savingPerTonneEur: defaultComparison.savingPerTonneEur,
          }
        : null,
    }),
    [auditData, defaultComparison]
  );

  const xmlValidation = useMemo(() => validateCbamXmlInput(xmlPayload), [xmlPayload]);

  const phaseInSeries = useMemo(() => {
    const baseInput = buildCbamInputFromPayload(xmlPayload);
    return projectCbamLiabilityByYear(baseInput, CBAM_PHASE_IN_YEARS);
  }, [xmlPayload]);

  const handleExportXml = async () => {
    if (!xmlValidation.valid) return;
    setIsExportingXml(true);
    setXmlError(null);
    try {
      const res = await fetch('/api/export/cbam-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(xmlPayload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        setXmlError(errBody?.error || t.cbam.missingXmlHint);
        return;
      }
      const xmlText = await res.text();
      const blob = new Blob([xmlText], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildCbamXmlFilename(auditData.exportCnCode);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setXmlError(t.cbam.missingXmlHint);
    } finally {
      setIsExportingXml(false);
    }
  };

  const handleVectorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatchedResults(data.matches);
      }
    } catch {
      // keep existing list
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddBom = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(bomQty);
    const ef = parseFloat(bomEf);
    if (!bomName.trim() || !Number.isFinite(qty) || qty <= 0) return;
    addBomMaterial({
      name: bomName.trim(),
      cnCode8: bomCn.trim(),
      quantityTons: qty,
      efTco2ePerTon: Number.isFinite(ef) ? ef : 0,
      isCbamRelevantPrecursor: isCbamPrecursorCnCode(bomCn.trim()),
    });
    setBomName('');
    setBomCn('');
    setBomQty('');
    setBomEf('');
  };

  const pdfBomEntries: BomEntry[] = auditData.bomMaterials.map((m) => ({
    id: m.id,
    org_id: 'factory',
    raw_description: m.name,
    quantity: m.quantityTons,
    unit: 't',
    scope: 3,
    total_tco2e: Number((m.quantityTons * m.efTco2ePerTon).toFixed(2)),
    matched_ef: {
      id: m.id,
      code: m.cnCode8 || 'BOM',
      name_fr: m.name,
      name_en: m.name,
      name_ar: m.name,
      category: 'raw_materials',
      cn_code_8: m.cnCode8,
      unit: 't',
      ef_kgco2e_per_unit: Number((m.efTco2ePerTon * 1000).toFixed(1)),
      scope: 3,
      source_authority:
        (m.isCbamRelevantPrecursor ?? isCbamPrecursorCnCode(m.cnCode8))
          ? 'Précurseur CBAM'
          : 'Scope 3 Hors CBAM',
    },
  }));

  const hasValidSee = cbamResult.hasProduction && cbam.isInCbamScope;
  const isOutsideScope =
    auditData.exportCnCode.trim().length > 0 && !cbam.isInCbamScope;
  const showDeMinimisNotice =
    auditData.euClientAnnualCbamTonnage > 0 &&
    auditData.euClientAnnualCbamTonnage < CBAM_DE_MINIMIS_TONNES_PER_YEAR;

  const sectorLabel = (s: typeof cbam.sector) => {
    const map: Record<typeof cbam.sector, { fr: string; en: string; ar: string }> = {
      iron_steel: { fr: 'Fer & Acier (CN 72/73)', en: 'Iron & Steel (CN 72/73)', ar: 'الحديد والصلب (CN 72/73)' },
      aluminium: { fr: 'Aluminium (CN 76)', en: 'Aluminium (CN 76)', ar: 'الألمنيوم (CN 76)' },
      cement: { fr: 'Ciment (CN 2523)', en: 'Cement (CN 2523)', ar: 'الإسمنت (CN 2523)' },
      fertilisers: { fr: 'Engrais (CN 31/2808/2814/2834)', en: 'Fertilisers (CN 31/2808/2814/2834)', ar: 'الأسمدة (CN 31/2808/2814/2834)' },
      outside_scope: { fr: 'Hors périmètre CBAM', en: 'Outside CBAM scope', ar: 'خارج نطاق CBAM' },
    };
    const item = map[s];
    if (locale === 'en') return item.en;
    if (locale === 'ar-TN') return item.ar;
    return item.fr;
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.cbam.title}
        badge="Règlement (UE) 2023/956"
        badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
        objective={t.cbam.subtitle}
        inputs={[
          'Production annuelle et volume exporté UE (tonnes)',
          'Combustibles directs Scope 1 (gaz naturel Nm³, fuel lourd t, gasoil L)',
          'Électricité STEG Scope 2 et matières premières entrantes Scope 3',
        ]}
        deliverables={[
          'Bilan Corporate A (ISO 14064-1) vs Périmètre CBAM B (2026+)',
          'Projection 2026–2034 & comparaison valeurs par défaut UE',
          t.cbam.exportXml,
        ]}
        regulation="Règlement (UE) 2023/956, Règlement d'exécution (UE) 2025/2620, (UE) 2025/2083 & ISO 14064-1"
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {t.cbam.exportXml} — {auditData.companyName || '—'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            CN : {auditData.exportCnCode || '—'} · {sectorLabel(cbam.sector)} · Production :{' '}
            {auditData.annualProductionTons > 0
              ? `${auditData.annualProductionTons.toLocaleString(numLocale)} t/an`
              : '—'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openAddDataModal('cbam')}
            className="btn-tactile flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.08]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Modifier production / combustibles</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfDialogOpen(true)}
            className="btn-tactile flex items-center gap-2 rounded-xl bg-white/[0.08] text-white px-3.5 py-2 text-xs font-bold hover:bg-white/[0.14]"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            <span>Rapport PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportXml}
            disabled={!xmlValidation.valid || isExportingXml}
            title={!xmlValidation.valid ? t.cbam.missingXmlHint : t.cbam.exportXml}
            className={`btn-tactile flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              xmlValidation.valid
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-white/[0.06] text-slate-500 border border-white/[0.08] cursor-not-allowed'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExportingXml ? '...' : t.cbam.exportXmlShort}</span>
          </button>
        </div>
      </div>

      {/* Validation / Scope / De Minimis Notices */}
      {(!xmlValidation.valid || xmlError) && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-amber-200 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{xmlError || t.cbam.missingXmlHint}</span>
        </div>
      )}

      {isOutsideScope && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{t.cbam.outsideScopeTitle}</div>
            <p className="text-amber-200/80 mt-0.5">{t.cbam.outsideScopeDesc}</p>
          </div>
        </div>
      )}

      {showDeMinimisNotice && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{t.cbam.deMinimisWarning}</span>
        </div>
      )}

      {/* Definitive-Period Controls: Year, Certificate Price & 50t De Minimis */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FieldLabel
            guide={FIELD_GUIDES.cbamReportingYear}
            labelOverride={t.cbam.reportingYearLabel}
          />
          <select
            value={auditData.cbamReportingYear}
            onChange={(e) => updateAuditData({ cbamReportingYear: Number(e.target.value) })}
            className="w-full rounded-xl bg-black/40 border border-white/[0.12] px-3 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
          >
            {CBAM_PHASE_IN_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr} ({(getFreeAllocationFactor(yr) * 100).toFixed(1)}%)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
            Factor {cbam.reportingYear}: {(cbam.freeAllocationFactor * 100).toFixed(1)}% · Benchmark{' '}
            {cbam.benchmarkTco2ePerTon} tCO₂e/t
          </p>
        </div>

        <div>
          <FieldLabel
            guide={FIELD_GUIDES.cbamCertificatePriceEur}
            labelOverride={t.cbam.certPriceLabel}
          />
          <input
            type="number"
            min="0"
            step="1"
            value={auditData.cbamCertificatePriceEur}
            placeholder={FIELD_GUIDES.cbamCertificatePriceEur.placeholder}
            onChange={(e) =>
              updateAuditData({
                cbamCertificatePriceEur: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-full rounded-xl bg-black/40 border border-white/[0.12] px-3 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none tabular-nums"
          />
          <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">{t.cbam.certPriceHint}</p>
        </div>

        <div>
          <FieldLabel
            guide={FIELD_GUIDES.euClientAnnualCbamTonnage}
            labelOverride={t.cbam.clientTonnageLabel}
          />
          <input
            type="number"
            min="0"
            step="1"
            value={auditData.euClientAnnualCbamTonnage || ''}
            placeholder={FIELD_GUIDES.euClientAnnualCbamTonnage.placeholder}
            onChange={(e) =>
              updateAuditData({
                euClientAnnualCbamTonnage: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-full rounded-xl bg-black/40 border border-white/[0.12] px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none tabular-nums"
          />
          <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
            De minimis UE : {CBAM_DE_MINIMIS_TONNES_PER_YEAR} t/an
          </p>
        </div>
      </div>

      {/* 4 Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.seeTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {hasValidSee ? (
              <>
                {cbam.cbamSeeTco2ePerTon}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">tCO₂e/t</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {cbamResult.hasProduction
              ? `${auditData.annualProductionTons.toLocaleString(numLocale)} t/an`
              : t.cockpit.emptyValue}
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.scope1}</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {cbamResult.hasData ? (
              <>
                {corp.scope1DirectTco2e.toLocaleString(numLocale)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">tCO₂e</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">Combustibles directs</div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.scope2}</div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 tabular-nums">
            {cbamResult.hasData ? (
              <>
                {corp.scope2IndirectTco2e.toLocaleString(numLocale)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">tCO₂e</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Réseau STEG ({STEG_GRID_EF_KG_CO2E_PER_KWH} kg/kWh)
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.taxExposureTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {hasValidSee ? (
              <>
                {cbam.estimatedLiabilityEur.toLocaleString(numLocale)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">€</span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {hasValidSee
              ? `≈ ${cbam.estimatedLiabilityTnd.toLocaleString(numLocale)} TND (${cbam.certificatesRequired} cert. @ ${cbam.cbamCertificatePriceEur}€)`
              : t.cockpit.emptyValue}
          </div>
        </div>
      </div>

      {/* Result A (ISO 14064-1 Corporate) vs Result B (CBAM Scope) Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{t.cbam.resultATitle}</h3>
              <p className="text-[11px] text-slate-400">{t.cbam.resultASubtitle}</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.1] shrink-0">
              ISO 14064-1
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Scope 1 (combustibles directs)</span>
              <span className="text-white tabular-nums">{corp.scope1DirectTco2e.toLocaleString(numLocale)} tCO₂e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Scope 2 (électricité STEG)</span>
              <span className="text-white tabular-nums">{corp.scope2IndirectTco2e.toLocaleString(numLocale)} tCO₂e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Scope 3 (tous intrants BOM)</span>
              <span className="text-white tabular-nums">{corp.scope3AllBomTco2e.toLocaleString(numLocale)} tCO₂e</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.08] pt-2 font-bold text-sm">
              <span className="text-emerald-400 font-sans">Total Corporate A</span>
              <span className="text-emerald-400 tabular-nums">
                {cbamResult.hasData ? `${corp.totalTco2e.toLocaleString(numLocale)} tCO₂e/an` : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="font-sans">Intensité corporate</span>
              <span className="tabular-nums">
                {cbamResult.hasProduction ? `${corp.intensityTco2ePerTon} tCO₂e/t` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-blue-500/25 p-5 space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{t.cbam.resultBTitle}</h3>
              <p className="text-[11px] text-slate-400">{t.cbam.resultBSubtitle}</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 shrink-0">
              {sectorLabel(cbam.sector)}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Émissions directes (Scope 1)</span>
              <span className="text-white tabular-nums">{cbam.directEmissionsTco2e.toLocaleString(numLocale)} tCO₂e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">
                Précurseurs CBAM ({cbam.excludedBomTco2e > 0 ? `${cbam.excludedBomTco2e} t hors CBAM exclus` : 'BOM'})
              </span>
              <span className="text-white tabular-nums">{cbam.cbamRelevantPrecursorsTco2e.toLocaleString(numLocale)} tCO₂e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">
                Émissions indirectes ({cbam.indirectEmissionsIncluded ? 'incluses' : 'pour info uniquement'})
              </span>
              <span className="text-slate-300 tabular-nums">
                {cbam.indirectEmissionsCountedTco2e.toLocaleString(numLocale)} tCO₂e
                {!cbam.indirectEmissionsIncluded && cbam.indirectEmissionsForInfoTco2e > 0
                  ? ` (${cbam.indirectEmissionsForInfoTco2e} t info)`
                  : ''}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/[0.08] pt-2 font-bold text-sm">
              <span className="text-blue-400 font-sans">Total CBAM B · SEE {hasValidSee ? `${cbam.cbamSeeTco2ePerTon} t/t` : '—'}</span>
              <span className="text-blue-400 tabular-nums">
                {hasValidSee ? `${cbam.totalCbamEmbeddedTco2e.toLocaleString(numLocale)} tCO₂e` : '—'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="font-sans">
                Allocation gratuite {cbam.reportingYear} ({(cbam.freeAllocationFactor * 100).toFixed(1)}%)
              </span>
              <span className="tabular-nums">−{cbam.freeAllocationDeductionTco2e.toLocaleString(numLocale)} tCO₂e</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            {cbam.indirectEmissionsIncluded ? t.cbam.indirectIncludedYes : t.cbam.indirectIncludedNo}
          </p>
        </div>
      </div>

      {/* EU Default Values vs Verified Real Data Comparator (Task 3) */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">{t.cbam.defaultComparatorTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {cbam.reportingYear} · +{defaultComparison.markupPct}% ·{' '}
              {tableDefaultEntry ? 'Pré-rempli (Tunisie — à vérifier)' : t.cbam.defaultMissingNotice}
            </p>
          </div>

          <div className="flex items-end gap-2">
            <div>
              <FieldLabel
                guide={FIELD_GUIDES.euDefaultSeeOverride}
                labelOverride={t.cbam.defaultInputLabel}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={displayedDefaultSeeInput}
                placeholder={FIELD_GUIDES.euDefaultSeeOverride.placeholder}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateAuditData({
                    euDefaultSeeOverride:
                      e.target.value === '' ? null : Number.isFinite(val) && val > 0 ? val : 0,
                  });
                }}
                className="w-56 rounded-xl bg-black/40 border border-white/[0.12] px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none tabular-nums"
              />
            </div>
            {auditData.euDefaultSeeOverride !== null && tableDefaultEntry && (
              <button
                type="button"
                onClick={() => updateAuditData({ euDefaultSeeOverride: null })}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-slate-300 hover:bg-white/[0.08]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {!defaultComparison.hasDefaultValue ? (
          <div className="rounded-xl border border-dashed border-white/[0.12] bg-black/20 p-5 text-xs text-slate-400">
            {hasValidSee ? t.cbam.defaultMissingNotice : t.cockpit.emptyValue}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: EU Default Values (Crimson) */}
              <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 space-y-2">
                <div className="text-xs font-bold text-red-300">{t.cbam.defaultColTitle}</div>
                <div className="text-2xl font-black font-mono text-red-400 tabular-nums">
                  {defaultComparison.liabilityDefaultEur.toLocaleString(numLocale)} €
                </div>
                <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                  <div>
                    ≈ {defaultComparison.liabilityDefaultTnd.toLocaleString(numLocale)} TND
                  </div>
                  <div>
                    SEE base {defaultComparison.defaultSeeBase} + {defaultComparison.markupPct}% ={' '}
                    <span className="text-red-300 font-bold">
                      {defaultComparison.defaultSeeWithMarkup} tCO₂e/t
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Verified Real Data (Emerald) */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 space-y-2">
                <div className="text-xs font-bold text-emerald-300">{t.cbam.actualColTitle}</div>
                <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                  {defaultComparison.liabilityActualEur.toLocaleString(numLocale)} €
                </div>
                <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                  <div>
                    ≈ {defaultComparison.liabilityActualTnd.toLocaleString(numLocale)} TND
                  </div>
                  <div>
                    SEE CBAM :{' '}
                    <span className="text-emerald-300 font-bold">
                      {defaultComparison.actualSee} tCO₂e/t
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const savingEurFmt = formatSignedAmount(
                defaultComparison.savingForImporterEur,
                '€',
                locale
              );
              const perTonFmt = formatSignedAmount(
                defaultComparison.savingPerTonneEur,
                '€/t',
                locale,
                { maximumFractionDigits: 2 }
              );
              const pitchSentence =
                locale === 'ar-TN'
                  ? `اعتماد بيانات منشأتنا المدققة بدلاً من القيم الافتراضية الأوروبية يقلّص كلفة CBAM على منتجاتنا بـ ${defaultComparison.savingPerTonneEur} €/طن.`
                  : locale === 'en'
                  ? `Using our verified installation data instead of EU default values reduces your CBAM cost by ${defaultComparison.savingPerTonneEur} €/t on our products.`
                  : `L'utilisation de nos données d'installation vérifiées au lieu des valeurs par défaut de l'UE réduit votre coût CBAM de ${defaultComparison.savingPerTonneEur} €/t sur nos produits.`;

              return (
                <div
                  className={`rounded-xl border p-4 space-y-3 ${
                    defaultComparison.isRealDataWorse
                      ? 'border-red-500/35 bg-red-500/10'
                      : 'border-emerald-500/35 bg-emerald-500/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-bold text-white">
                      {defaultComparison.isRealDataWorse
                        ? t.cbam.defaultWorseNotice
                        : 'Économie nette pour votre client importateur UE'}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-sm font-black tabular-nums">
                      <span dir="ltr" className={`inline-block whitespace-nowrap ${savingEurFmt.colorClass}`}>{savingEurFmt.text}</span>
                      <span className="text-slate-400">·</span>
                      <span dir="ltr" className={`inline-block whitespace-nowrap ${perTonFmt.colorClass}`}>{perTonFmt.text}</span>
                      <span className="text-xs text-slate-300 font-normal">
                        ({defaultComparison.savingForImporterTnd.toLocaleString(numLocale)} TND)
                      </span>
                    </div>
                  </div>

                  {defaultComparison.isRealDataWorse ? (
                    <Link
                      href="/plan"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 text-black px-3 py-1.5 text-xs font-bold hover:bg-amber-400"
                    >
                      <span>{t.cockpit.openActionPlan}</span>
                    </Link>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-black/35 border border-white/[0.08] px-3 py-2">
                      <span className="text-xs text-slate-200 italic">&ldquo;{pitchSentence}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(pitchSentence).then(() => {
                              setCopiedPitch(true);
                              setTimeout(() => setCopiedPitch(false), 2000);
                            });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 text-[11px] font-bold shrink-0"
                      >
                        {copiedPitch ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedPitch ? t.cbam.copied : t.cbam.copyClientPitch}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Phase-In Trajectory Chart (2026-2034) + Timeline Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">{t.cbam.phaseInChartTitle}</h3>
            <span className="text-[11px] font-mono text-blue-400">
              {cbam.exportTonnes > 0 ? `${cbam.exportTonnes.toLocaleString(numLocale)} t` : '—'} · {cbam.cbamCertificatePriceEur} €/t
            </span>
          </div>

          {hasValidSee ? (
            <div className="h-56 w-full ltr-only">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseInSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString(numLocale)} €`, 'CBAM']}
                    contentStyle={{
                      backgroundColor: '#0A0F1D',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="liabilityEur" radius={[4, 4, 0, 0]}>
                    {phaseInSeries.map((pt) => (
                      <Cell
                        key={pt.year}
                        fill={pt.year === auditData.cbamReportingYear ? '#10B981' : '#3B82F6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 rounded-xl border border-dashed border-white/[0.08] bg-black/20 flex items-center justify-center text-xs text-slate-500">
              {t.cockpit.emptyValue}
            </div>
          )}
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-blue-500/20 bg-blue-500/[0.04] p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-300">
            <CalendarClock className="h-4 w-4 shrink-0" />
            <h3 className="text-sm font-bold text-white">{t.cbam.timelineTitle}</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            {t.cbam.timelineFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Factory BOM Precursors Manager (with CBAM precursor flag & toggle) */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">{t.cbam.bomTitle}</h2>
            <p className="text-xs text-slate-400">
              Les précurseurs CBAM (chapitres 72, 73 listés, 76, 2523, 31, H₂ 2804 10) sont détectés automatiquement et restent modifiables.
            </p>
          </div>
          <div className="text-xs font-mono text-emerald-400">
            Scope 3 Total A : {corp.scope3AllBomTco2e.toLocaleString(numLocale)} tCO₂e · CBAM B :{' '}
            {cbam.cbamRelevantPrecursorsTco2e.toLocaleString(numLocale)} tCO₂e
          </div>
        </div>

        <form onSubmit={handleAddBom} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
          <div className="sm:col-span-2 lg:col-span-3">
            <FieldLabel guide={FIELD_GUIDES.bomName} />
            <input
              type="text"
              value={bomName}
              onChange={(e) => setBomName(e.target.value)}
              placeholder={FIELD_GUIDES.bomName.placeholder}
              className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="lg:col-span-2">
            <FieldLabel guide={FIELD_GUIDES.bomCn} />
            <input
              type="text"
              value={bomCn}
              onChange={(e) => setBomCn(e.target.value)}
              placeholder={FIELD_GUIDES.bomCn.placeholder}
              className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
            <FieldHint>{FIELD_GUIDES.bomCn.shortHint}</FieldHint>
          </div>
          <div className="lg:col-span-2">
            <FieldLabel guide={FIELD_GUIDES.bomQty} />
            <input
              type="number"
              min="0"
              step="0.1"
              value={bomQty}
              onChange={(e) => setBomQty(e.target.value)}
              placeholder={FIELD_GUIDES.bomQty.placeholder}
              className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="lg:col-span-3">
            <FieldLabel guide={FIELD_GUIDES.bomEf} />
            <input
              type="number"
              min="0"
              step="0.01"
              value={bomEf}
              onChange={(e) => setBomEf(e.target.value)}
              placeholder={FIELD_GUIDES.bomEf.placeholder}
              className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
            <FieldHint>{FIELD_GUIDES.bomEf.shortHint}</FieldHint>
          </div>
          <div className="sm:col-span-2 lg:col-span-2 lg:pt-6">
            <button
              type="submit"
              className="w-full btn-tactile rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 py-2"
            >
              + Ajouter intrant
            </button>
          </div>
        </form>

        {auditData.bomMaterials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-black/20 px-4 py-5 text-center text-xs text-slate-500">
            Aucun intrant matière première déclaré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-start text-xs">
              <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4 text-start">Matière</th>
                  <th className="py-2.5 px-4 text-start">Code CN</th>
                  <th className="py-2.5 px-4 text-start">CBAM</th>
                  <th className="py-2.5 px-4 text-start">Quantité</th>
                  <th className="py-2.5 px-4 text-start">Facteur</th>
                  <th className="py-2.5 px-4 text-start">Total</th>
                  <th className="py-2.5 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-mono">
                {auditData.bomMaterials.map((m) => {
                  const isCbamPrecursor =
                    typeof m.isCbamRelevantPrecursor === 'boolean'
                      ? m.isCbamRelevantPrecursor
                      : isCbamPrecursorCnCode(m.cnCode8);
                  return (
                    <tr key={m.id} className="text-slate-200">
                      <td className="py-2.5 px-4 font-sans font-medium text-white">{m.name}</td>
                      <td className="py-2.5 px-4 text-blue-400">{m.cnCode8 || '—'}</td>
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            updateBomMaterial(m.id, { isCbamRelevantPrecursor: !isCbamPrecursor })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            isCbamPrecursor
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/35 hover:bg-blue-500/25'
                              : 'bg-white/[0.04] text-slate-500 border-white/[0.08] hover:text-slate-300'
                          }`}
                        >
                          {isCbamPrecursor ? t.cbam.cbamPrecursorBadge : 'ISO'}
                        </button>
                      </td>
                      <td className="py-2.5 px-4">{m.quantityTons} t</td>
                      <td className="py-2.5 px-4">{m.efTco2ePerTon} tCO₂e/t</td>
                      <td className="py-2.5 px-4 text-emerald-400">
                        {(m.quantityTons * m.efTco2ePerTon).toFixed(2)} tCO₂e
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <button
                          type="button"
                          onClick={() => removeBomMaterial(m.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
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

      {/* Reference Emission Factors Lookup Table (ADEME / JRC) */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Référentiel des Facteurs d&apos;Émission Officiels</h2>
            <p className="text-xs text-slate-400">
              Recherche sémantique dans les facteurs officiels ANME, STEG et EU JRC
            </p>
          </div>

          <form onSubmit={handleVectorSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un matériau ou combustible..."
              className="bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-xl bg-white/[0.08] hover:bg-white/[0.14] px-3.5 py-2 text-xs font-bold text-white shrink-0"
            >
              {isSearching ? '...' : 'Rechercher'}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-start text-xs">
            <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] text-[10px] font-mono uppercase">
              <tr>
                <th className="py-2.5 px-4 text-start">Désignation</th>
                <th className="py-2.5 px-4 text-start">Code CN</th>
                <th className="py-2.5 px-4 text-start">Scope</th>
                <th className="py-2.5 px-4 text-start">Facteur</th>
                <th className="py-2.5 px-4 text-start">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-200">
              {matchedResults.map((ef) => (
                <tr key={ef.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-medium text-white">{ef.name_fr}</td>
                  <td className="py-2.5 px-4 font-mono text-blue-400">{ef.cn_code_8 || 'Énergie'}</td>
                  <td className="py-2.5 px-4 font-mono">Scope {ef.scope}</td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {ef.ef_kgco2e_per_unit.toLocaleString(numLocale)} kgCO₂e/{ef.unit}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">{ef.source_authority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AuditReportDialog
        isOpen={isPdfDialogOpen}
        onClose={() => setIsPdfDialogOpen(false)}
        result={cbamResult}
        entries={pdfBomEntries}
        companyName={auditData.companyName || 'Entreprise'}
        quarter="T1 (Q1)"
        reportingYear={cbam.reportingYear}
        defaultComparison={defaultComparison}
        abatementPlan={results.abatementPlan}
        auditData={auditData}
        auditResults={results}
      />
    </div>
  );
}
