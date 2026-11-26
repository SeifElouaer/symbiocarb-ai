'use client';

// ==============================================================================
// SymbioCarb AI - Complete Carbon & Energy Passport Report (PDF Printable)
// Full calculation breakdown, gains & deficits ledger, EU benchmark threshold
// verdict, compensation action plan (when over threshold) or continuous
// improvement recommendations (when compliant under EU threshold).
// ==============================================================================

import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { CbamCalculationResult, BomEntry } from '@/types';
import {
  FUEL_EMISSION_FACTORS,
  STEG_GRID_EF_KG_CO2E_PER_KWH,
} from '@/lib/engine/cbam-config';
import { CbamDefaultComparisonResult } from '@/lib/engine/cbam-default-comparator';
import { AbatementLeverId, AbatementPlanResult } from '@/lib/engine/abatement-plan';
import { formatSignedAmount } from '@/lib/format/signed-amount';
import type { AuditResults, AuditWizardData } from '@/lib/audit/audit-context';

interface AuditReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: CbamCalculationResult;
  entries: BomEntry[];
  companyName: string;
  quarter: string;
  reportingYear: number;
  defaultComparison?: CbamDefaultComparisonResult | null;
  abatementPlan?: AbatementPlanResult | null;
  auditData?: AuditWizardData;
  auditResults?: AuditResults;
}

const LEVER_LABELS_FR: Record<AbatementLeverId, string> = {
  cos_phi: 'Compensation réactive STEG (cos φ → 0,95)',
  load_shifting: 'Effacement de pointe (Pointe → Nuit)',
  solar_pv: 'Autoconsommation Solaire PV toiture',
  precursor_switch: 'Substitution précurseurs BOM bas-carbone',
  bioclaira: 'Valorisation circulaire BioClaira (Pack Gold)',
};

export function AuditReportDialog({
  isOpen,
  onClose,
  result,
  entries,
  companyName,
  quarter,
  reportingYear,
  defaultComparison,
  abatementPlan,
  auditData,
  auditResults,
}: AuditReportDialogProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const corp = result.corporateFootprint;
  const cbam = result.cbamScope;

  // Threshold & Deficit calculations
  const hasCbamBenchmark = result.hasProduction && cbam.isInCbamScope;
  const unitGap = hasCbamBenchmark
    ? Number((cbam.cbamSeeTco2ePerTon - cbam.benchmarkTco2ePerTon).toFixed(3))
    : 0;
  const isOverEuThreshold =
    hasCbamBenchmark &&
    (cbam.cbamSeeTco2ePerTon > cbam.benchmarkTco2ePerTon || cbam.certificatesRequired > 0);
  const totalDeficitTco2e = hasCbamBenchmark
    ? Math.max(0, Number(((cbam.cbamSeeTco2ePerTon - cbam.benchmarkTco2ePerTon) * cbam.exportTonnes).toFixed(2)))
    : 0;
  const marginUnderBenchmarkTco2e = hasCbamBenchmark
    ? Math.max(0, Number(((cbam.benchmarkTco2ePerTon - cbam.cbamSeeTco2ePerTon) * cbam.exportTonnes).toFixed(2)))
    : 0;

  // 2034 projection when free allocation hits 0%
  const projected2034LiabilityEur = hasCbamBenchmark
    ? Math.round(cbam.cbamSeeTco2ePerTon * cbam.exportTonnes * cbam.cbamCertificatePriceEur)
    : 0;

  // Energy & STEG metrics
  const monthlyKwhTotal = auditResults?.kwhTotal ?? (auditData
    ? auditData.kwhJour + auditData.kwhPointe + auditData.kwhSoir + auditData.kwhNuit
    : 0);
  const annualKwhTotal = monthlyKwhTotal * 12;
  const annualReactivePenaltyTnd = auditData
    ? Math.round(auditData.reactivePenaltyTnd * 12)
    : auditResults?.annualReactivePenaltySavingsTnd ?? 0;
  const annualOverrunPenaltyTnd = auditResults?.annualPowerOverrunSavingsTnd ?? 0;
  const annualStegSavingsTnd = auditResults?.totalAnnualStegSavingsTnd ?? 0;
  const requiredCapacitorKvar = auditResults?.requiredCapacitorKvar ?? 0;
  const anmeSubsidyTnd = auditResults?.anmeFteSubsidyTnd ?? 0;

  // Deficit coverage by MACC CBAM levers
  const cbamAvoidedByPlan = abatementPlan?.totalCbamAvoidedTco2e ?? 0;
  const coveragePct =
    totalDeficitTco2e > 0
      ? Math.min(100, Math.round((cbamAvoidedByPlan / totalDeficitTco2e) * 100))
      : 100;
  const postPlanTotalCbamTco2e = Math.max(
    0,
    Number((cbam.totalCbamEmbeddedTco2e - cbamAvoidedByPlan).toFixed(2))
  );
  const postPlanSee =
    result.finishedProductTons > 0
      ? Number((postPlanTotalCbamTco2e / result.finishedProductTons).toFixed(3))
      : 0;

  const allPlanLevers = abatementPlan
    ? [...abatementPlan.curveLevers, ...abatementPlan.financialOnlyLevers]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl p-6 sm:p-10 border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>PASSEPORT COMPLET CARBONE &amp; ÉNERGIE — CBAM UE / ISO 14064-1 / STEG</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer / Enregistrer en PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le rapport"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="space-y-6 text-slate-800">
          {/* 1. Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  SymbioCarb <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  Passeport Export UE &amp; Énergie
                </span>
              </div>
              <p className="text-xs text-slate-500 font-serif">
                Rapport Complet d&apos;Audit Carbone (CBAM UE / ISO 14064-1), Gains &amp; Déficits STEG et Plan de Compensation
              </p>
            </div>

            <div className="text-end text-xs space-y-0.5 font-mono">
              <div className="font-bold text-slate-900">PASSEPORT N° SC-CBAM-{reportingYear}</div>
              <div className="text-slate-500">Édité le : {new Date().toLocaleDateString('fr-FR')}</div>
              <div className="text-emerald-700 font-bold">Période : {reportingYear} ({quarter})</div>
            </div>
          </div>

          {/* Plant & Regulatory Rules Applied */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Installation Productrice
              </div>
              <div className="font-bold text-sm text-slate-900">{companyName}</div>
              <div className="text-slate-600">
                {auditData?.governorate || 'Tunisie'}
                {auditData?.industrialZone ? ` — ${auditData.industrialZone}` : ''}
                {auditData?.fiscalId ? ` · MF : ${auditData.fiscalId}` : ''}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Code NC / CN : {result.cnCode8 || '—'} · Produit : {result.productName || '—'}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Production : {result.finishedProductTons.toLocaleString('fr-FR')} t/an · Export UE :{' '}
                {cbam.exportTonnes.toLocaleString('fr-FR')} t/an
              </div>
            </div>

            <div className="space-y-1 sm:border-s border-slate-200 sm:ps-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Paramètres Réglementaires UE &amp; STEG Appliqués
              </div>
              <div className="font-mono text-[11px] text-slate-800">
                Secteur CBAM : <strong>{cbam.sector}</strong> · Scope 2 compté :{' '}
                <strong>{cbam.indirectEmissionsIncluded ? 'Oui' : 'Non (info uniquement)'}</strong>
              </div>
              <div className="font-mono text-[11px] text-slate-800">
                Année : <strong>{cbam.reportingYear}</strong> · Allocation gratuite UE :{' '}
                <strong>{(cbam.freeAllocationFactor * 100).toFixed(1)}%</strong>
              </div>
              <div className="font-mono text-[11px] text-emerald-700 font-bold">
                Seuil Benchmark UE : {cbam.benchmarkTco2ePerTon} tCO₂e/t · Certificat :{' '}
                {cbam.cbamCertificatePriceEur} €/t
              </div>
              <div className="font-mono text-[11px] text-slate-700">
                Facteur réseau STEG : {STEG_GRID_EF_KG_CO2E_PER_KWH} kgCO₂e/kWh · Taux : {cbam.eurToTndRate} TND/€
              </div>
            </div>
          </div>

          {/* 2. Verdict de Conformité au Seuil UE */}
          {hasCbamBenchmark ? (
            <div
              className={`rounded-xl border-2 p-4 space-y-2 ${
                isOverEuThreshold
                  ? 'border-red-500 bg-red-50'
                  : 'border-emerald-600 bg-emerald-50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isOverEuThreshold ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                  )}
                  <span
                    className={`text-sm font-black uppercase tracking-tight ${
                      isOverEuThreshold ? 'text-red-900' : 'text-emerald-900'
                    }`}
                  >
                    {isOverEuThreshold
                      ? 'VERDICT UE : DÉFICIT CARBONE — AU-DESSUS DU SEUIL BENCHMARK UE'
                      : 'VERDICT UE : CONFORME — SOUS LE SEUIL BENCHMARK UE (PROFIL GAGNANT)'}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                    isOverEuThreshold
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  SEE {cbam.cbamSeeTco2ePerTon} vs Seuil {cbam.benchmarkTco2ePerTon} tCO₂e/t
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
                <div className="rounded-lg bg-white/80 p-2.5 border border-slate-200">
                  <div className="text-[10px] font-sans text-slate-500">Écart unitaire au seuil UE</div>
                  <div
                    className={`text-sm font-black ${
                      unitGap > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {unitGap > 0 ? `+${unitGap.toFixed(3)}` : unitGap.toFixed(3)} tCO₂e/t
                  </div>
                </div>

                <div className="rounded-lg bg-white/80 p-2.5 border border-slate-200">
                  <div className="text-[10px] font-sans text-slate-500">
                    {isOverEuThreshold ? 'Déficit brut sur export UE' : 'Marge sous benchmark UE'}
                  </div>
                  <div
                    className={`text-sm font-black ${
                      isOverEuThreshold ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {isOverEuThreshold
                      ? `+${totalDeficitTco2e.toLocaleString('fr-FR')} tCO₂e/an`
                      : `−${marginUnderBenchmarkTco2e.toLocaleString('fr-FR')} tCO₂e/an`}
                  </div>
                </div>

                <div className="rounded-lg bg-white/80 p-2.5 border border-slate-200">
                  <div className="text-[10px] font-sans text-slate-500">
                    Certificats CBAM ({cbam.reportingYear})
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {cbam.certificatesRequired.toLocaleString('fr-FR')} cert.
                  </div>
                </div>

                <div className="rounded-lg bg-white/80 p-2.5 border border-slate-200">
                  <div className="text-[10px] font-sans text-slate-500">Exposition financière CBAM</div>
                  <div
                    className={`text-sm font-black ${
                      cbam.estimatedLiabilityEur > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {cbam.estimatedLiabilityEur.toLocaleString('fr-FR')} € ({cbam.estimatedLiabilityTnd.toLocaleString('fr-FR')} TND)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-xs text-amber-900">
              <strong>Statut CBAM :</strong>{' '}
              {!result.hasProduction
                ? 'Production annuelle non renseignée pour comparer au seuil Benchmark UE.'
                : 'Le code douanier CN déclaré est actuellement hors périmètre CBAM ; seul le bilan corporate ISO 14064-1 s’applique.'}
            </div>
          )}

          {/* 3. Détail Complet des Calculs Carbone (Résultat A vs Résultat B) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Détail des Calculs Carbone (Méthode ISO 14064-1 vs Périmètre CBAM 2026+)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  A. Empreinte Corporate Complète (ISO 14064-1)
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {result.hasData ? `${corp.totalTco2e.toLocaleString('fr-FR')} tCO₂e/an` : '—'}
                </div>
                <div className="text-[11px] text-slate-600 font-mono space-y-1 border-t border-slate-200 pt-2">
                  <div>
                    Scope 1 (combustibles) : <strong>{corp.scope1DirectTco2e} tCO₂e</strong>
                    {auditData && (auditData.naturalGasM3 > 0 || auditData.heavyFuelTons > 0 || auditData.dieselLiters > 0) && (
                      <span className="block text-[10px] text-slate-500">
                        = [({auditData.naturalGasM3}×{FUEL_EMISSION_FACTORS.NATURAL_GAS_KG_CO2E_PER_NM3}) + ({auditData.heavyFuelTons}×{FUEL_EMISSION_FACTORS.HEAVY_FUEL_KG_CO2E_PER_TON}) + ({auditData.dieselLiters}×{FUEL_EMISSION_FACTORS.DIESEL_KG_CO2E_PER_LITER})] × 12 / 1000
                      </span>
                    )}
                  </div>
                  <div>
                    Scope 2 (électricité STEG) : <strong>{corp.scope2IndirectTco2e} tCO₂e</strong>
                    {annualKwhTotal > 0 && (
                      <span className="block text-[10px] text-slate-500">
                        = {annualKwhTotal.toLocaleString('fr-FR')} kWh/an × {STEG_GRID_EF_KG_CO2E_PER_KWH} / 1000
                      </span>
                    )}
                  </div>
                  <div>
                    Scope 3 (tous intrants BOM) : <strong>{corp.scope3AllBomTco2e} tCO₂e</strong>
                  </div>
                  <div>
                    Intensité corporate :{' '}
                    <strong>{result.hasProduction ? `${corp.intensityTco2ePerTon} tCO₂e/t` : '—'}</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-400 bg-emerald-50/70 p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  B. Émissions Incorporées CBAM (Règl. UE 2023/956)
                </div>
                <div className="text-2xl font-black text-emerald-900 font-mono tabular-nums">
                  {hasCbamBenchmark ? `${cbam.cbamSeeTco2ePerTon} tCO₂e/t` : '—'}
                </div>
                <div className="text-[11px] text-slate-700 font-mono space-y-1 border-t border-emerald-200 pt-2">
                  <div>
                    Total CBAM B = {cbam.directEmissionsTco2e} (Scope 1) +{' '}
                    {cbam.indirectEmissionsCountedTco2e} (Scope 2 compté) +{' '}
                    {cbam.cbamRelevantPrecursorsTco2e} (Précurseurs) ={' '}
                    <strong>{cbam.totalCbamEmbeddedTco2e} tCO₂e</strong>
                  </div>
                  <div>
                    SEE CBAM = {cbam.totalCbamEmbeddedTco2e} / {result.finishedProductTons || 1} t ={' '}
                    <strong>{cbam.cbamSeeTco2ePerTon} tCO₂e/t</strong>
                  </div>
                  <div>
                    Allocation gratuite ({cbam.reportingYear}) = {cbam.benchmarkTco2ePerTon} ×{' '}
                    {cbam.exportTonnes} t × {(cbam.freeAllocationFactor * 100).toFixed(1)}% ={' '}
                    <strong>−{cbam.freeAllocationDeductionTco2e} tCO₂e</strong>
                  </div>
                  <div className="font-bold text-emerald-900">
                    Certificats nets = max(0 ; {cbam.cbamEmbeddedForExportTco2e} −{' '}
                    {cbam.freeAllocationDeductionTco2e} − {cbam.carbonPricePaidAbroadEquivalentTco2e}) ={' '}
                    {cbam.certificatesRequired} × {cbam.cbamCertificatePriceEur} € ={' '}
                    {cbam.estimatedLiabilityEur.toLocaleString('fr-FR')} €
                  </div>
                </div>
              </div>
            </div>

            {defaultComparison && defaultComparison.hasDefaultValue && (
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Comparatif : Valeurs par Défaut UE (+{defaultComparison.markupPct}% majoration {cbam.reportingYear}) vs Données Réelles Vérifiées
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <div className="text-slate-500 font-sans text-[11px]">Avec valeurs par défaut UE</div>
                    <div className="font-bold text-red-700">
                      {defaultComparison.liabilityDefaultEur.toLocaleString('fr-FR')} € (SEE{' '}
                      {defaultComparison.defaultSeeWithMarkup} t/t)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-sans text-[11px]">Avec vos données vérifiées</div>
                    <div className="font-bold text-emerald-700">
                      {defaultComparison.liabilityActualEur.toLocaleString('fr-FR')} € (SEE{' '}
                      {defaultComparison.actualSee} t/t)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-sans text-[11px]">
                      {defaultComparison.savingForImporterEur >= 0
                        ? 'Gain net pour votre importateur UE'
                        : 'Surcoût vs valeurs par défaut UE'}
                    </div>
                    <div
                      className={`font-bold ${
                        defaultComparison.savingForImporterEur >= 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {defaultComparison.savingForImporterEur.toLocaleString('fr-FR')} € (
                      {defaultComparison.savingPerTonneEur} €/t)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Bilan des Gains & Déficits (Carbone CBAM + Énergie STEG) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Bilan Consolidé des Gains &amp; Déficits (CBAM &amp; Énergie STEG)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span>Déficits &amp; Pénalités Constatés</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-700">Passif CBAM ({cbam.reportingYear}) :</span>
                    <span className={cbam.estimatedLiabilityEur > 0 ? 'font-bold text-red-700' : 'text-slate-600'}>
                      {cbam.estimatedLiabilityEur.toLocaleString('fr-FR')} €/an ({cbam.estimatedLiabilityTnd.toLocaleString('fr-FR')} TND)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-700">
                      Pénalité réactive STEG (cos φ {auditData?.cosPhi || auditResults?.cosPhiCurrent || '—'}) :
                    </span>
                    <span className={annualReactivePenaltyTnd > 0 ? 'font-bold text-red-700' : 'text-slate-600'}>
                      {annualReactivePenaltyTnd.toLocaleString('fr-FR')} TND/an
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-700">Dépassement puissance STEG :</span>
                    <span className={annualOverrunPenaltyTnd > 0 ? 'font-bold text-red-700' : 'text-slate-600'}>
                      {annualOverrunPenaltyTnd.toLocaleString('fr-FR')} TND/an
                    </span>
                  </div>
                  {defaultComparison?.isRealDataWorse && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-700">Surcoût vs défaut UE :</span>
                      <span className="font-bold text-red-700">
                        {Math.abs(defaultComparison.savingForImporterEur).toLocaleString('fr-FR')} €/an
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <TrendingUp className="h-4 w-4 text-emerald-700" />
                  <span>Gains Acquis &amp; Potentiel Récupérable</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-700">Avantage client vs défaut UE :</span>
                    <span className="font-bold text-emerald-700">
                      {defaultComparison && defaultComparison.savingForImporterEur > 0
                        ? `+${defaultComparison.savingForImporterEur.toLocaleString('fr-FR')} €/an`
                        : '0 €/an'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-700">
                      Économies STEG récupérables ({requiredCapacitorKvar} kVAR) :
                    </span>
                    <span className="font-bold text-emerald-700">
                      +{annualStegSavingsTnd.toLocaleString('fr-FR')} TND/an
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-700">Subvention ANME FTE estimée (20%) :</span>
                    <span className="font-bold text-emerald-700">
                      +{anmeSubsidyTnd.toLocaleString('fr-FR')} TND
                    </span>
                  </div>
                  {auditResults?.hasWasteData && (
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-700">BioClaira circulaire (hors CBAM) :</span>
                      <span className="font-bold text-emerald-700">
                        +{auditResults.annualCircularValorizationTnd.toLocaleString('fr-FR')} TND/an ({auditResults.co2SequestrationTco2ePerYear} tCO₂e)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Plan d'Action de Compensation (si déficit) OU Recommandations d'Amélioration (si conforme) */}
          <div className="space-y-3">
            {isOverEuThreshold ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    3. Plan d&apos;Action Détaillé pour Compenser le Déficit Carbone UE
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Votre SEE ({cbam.cbamSeeTco2ePerTon} tCO₂e/t) dépasse le seuil européen de{' '}
                    <strong>{cbam.benchmarkTco2ePerTon} tCO₂e/t</strong>. Voici la trajectoire chiffrée pour résorber ce déficit et réduire votre exposition CBAM :
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="rounded-lg bg-white p-2.5 border border-amber-200">
                    <div className="text-[10px] font-sans text-slate-500">Déficit au-dessus seuil</div>
                    <div className="font-bold text-red-700">{totalDeficitTco2e.toLocaleString('fr-FR')} tCO₂e/an</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-amber-200">
                    <div className="text-[10px] font-sans text-slate-500">Abattement CBAM du plan</div>
                    <div className="font-bold text-emerald-700">
                      −{cbamAvoidedByPlan.toLocaleString('fr-FR')} tCO₂e/an ({coveragePct}%)
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-amber-200">
                    <div className="text-[10px] font-sans text-slate-500">SEE estimé après plan</div>
                    <div className="font-bold text-slate-900">
                      {postPlanSee.toFixed(3)} tCO₂e/t
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-amber-200">
                    <div className="text-[10px] font-sans text-slate-500">Économie CBAM annuelle</div>
                    <div className="font-bold text-emerald-700">
                      +{(abatementPlan?.cbamAnnualSavedEur ?? 0).toLocaleString('fr-FR')} €/an
                    </div>
                  </div>
                </div>

                {allPlanLevers.length > 0 && (
                  <table className="w-full border-collapse border border-slate-300 bg-white text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="border border-slate-300 p-1.5 text-start">Levier d&apos;action</th>
                        <th className="border border-slate-300 p-1.5 text-end">tCO₂e/an</th>
                        <th className="border border-slate-300 p-1.5 text-end">Dont CBAM</th>
                        <th className="border border-slate-300 p-1.5 text-end">CAPEX (TND)</th>
                        <th className="border border-slate-300 p-1.5 text-end">Gain net/an</th>
                        <th className="border border-slate-300 p-1.5 text-end">Payback</th>
                        <th className="border border-slate-300 p-1.5 text-end">Coût / tCO₂e</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPlanLevers.map((l) => {
                        const gainFmt = formatSignedAmount(l.annualNetSavingTnd, 'TND', 'fr');
                        const costFmt = l.isFinancialOnly
                          ? '—'
                          : formatSignedAmount(l.costPerTco2Tnd, 'TND/t', 'fr').text;
                        return (
                          <tr key={l.id}>
                            <td className="border border-slate-300 p-1.5 font-medium">
                              {LEVER_LABELS_FR[l.id] || l.id}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">
                              {l.annualTco2eAvoided}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">
                              {l.reducesCbamLiability ? `${l.cbamTco2eAvoided} t` : 'Hors CBAM'}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">
                              {l.capexTnd.toLocaleString('fr-FR')}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">{gainFmt.text}</td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">
                              {l.paybackYears !== null ? `${l.paybackYears} ans` : '—'}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono font-bold">
                              {costFmt}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                <div className="rounded-lg bg-white p-3 border border-amber-200 space-y-1.5 text-[11px] text-slate-700">
                  <div className="font-bold text-slate-900">Feuille de route priorisée de compensation :</div>
                  <ol className="list-decimal ps-4 space-y-1">
                    <li>
                      <strong>Précurseurs Scope 3 ({cbam.cbamRelevantPrecursorsTco2e} tCO₂e) :</strong> basculer les achats d&apos;acier/aluminium vers des fournisseurs à four électrique recyclé (EAF) certifiés EPD — impact maximal direct sur le SEE CBAM.
                    </li>
                    <li>
                      <strong>Combustion Scope 1 ({cbam.directEmissionsTco2e} tCO₂e) :</strong> récupérer la chaleur fatale des fours, remplacer le fuel lourd/gasoil par du gaz naturel ou biocombustible et optimiser la régulation des brûleurs.
                    </li>
                    <li>
                      <strong>Énergie STEG ({annualReactivePenaltyTnd + annualOverrunPenaltyTnd} TND/an de pénalités) :</strong> installer une batterie de condensateurs ({requiredCapacitorKvar} kVAR) avec selfs anti-harmoniques et ajuster la puissance souscrite pour financer la transition sans CAPEX net.
                    </li>
                    <li>
                      <strong>Solaire PV toiture :</strong> couvrir jusqu&apos;à 80 % de la consommation Jour STEG pour réduire l&apos;empreinte corporate ISO 14064-1 et la facture électrique.
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4 space-y-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    3. Recommandations d&apos;Amélioration Continue (Maintien de l&apos;Avance UE 2026–2034)
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Votre installation est actuellement <strong>sous le seuil Benchmark UE</strong>. Anticipez dès maintenant la disparition progressive des allocations gratuites (97,5 % en 2026 → 0 % en 2034, soit une exposition théorique de{' '}
                    <strong className="font-mono">{projected2034LiabilityEur.toLocaleString('fr-FR')} €/an</strong> en 2034 à SEE constant).
                  </p>
                </div>

                <ul className="list-disc ps-5 space-y-1 text-[11px] text-slate-700">
                  <li>
                    <strong>Valoriser commercialement votre avance :</strong> intégrez cette attestation et le différentiel face aux valeurs par défaut UE (+{defaultComparison?.savingPerTonneEur ?? 0} €/t économisés) dans vos négociations clients en Europe.
                  </li>
                  <li>
                    <strong>Préparer la vérification tierce ISO 14065 :</strong> verrouillez la traçabilité des factures fournisseurs de précurseurs bas-carbone (certificats EAF) afin de pérenniser votre SEE réel.
                  </li>
                  <li>
                    <strong>Décarbonation électrique &amp; solaire PV :</strong> augmentez l&apos;autoconsommation solaire ou signez un PPA renouvelable certifié pour abaisser votre empreinte ISO 14064-1 et sécuriser vos coûts STEG.
                  </li>
                  <li>
                    <strong>Économie circulaire BioClaira :</strong> valorisez vos sous-produits industriels pour générer des revenus additionnels hors périmètre CBAM.
                  </li>
                </ul>

                {allPlanLevers.length > 0 && (
                  <table className="w-full border-collapse border border-slate-300 bg-white text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="border border-slate-300 p-1.5 text-start">Levier d&apos;optimisation disponible</th>
                        <th className="border border-slate-300 p-1.5 text-end">tCO₂e/an</th>
                        <th className="border border-slate-300 p-1.5 text-end">CAPEX (TND)</th>
                        <th className="border border-slate-300 p-1.5 text-end">Gain net/an</th>
                        <th className="border border-slate-300 p-1.5 text-end">Coût / tCO₂e</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPlanLevers.map((l) => {
                        const gainFmt = formatSignedAmount(l.annualNetSavingTnd, 'TND', 'fr');
                        const costFmt = l.isFinancialOnly
                          ? '—'
                          : formatSignedAmount(l.costPerTco2Tnd, 'TND/t', 'fr').text;
                        return (
                          <tr key={l.id}>
                            <td className="border border-slate-300 p-1.5 font-medium">
                              {LEVER_LABELS_FR[l.id] || l.id}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">
                              {l.annualTco2eAvoided}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">
                              {l.capexTnd.toLocaleString('fr-FR')}
                            </td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono">{gainFmt.text}</td>
                            <td className="border border-slate-300 p-1.5 text-end font-mono font-bold">
                              {costFmt}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* 6. BOM Items Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              4. Nomenclatures d&apos;Achats (BOM) &amp; Statut Précurseur CBAM
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-1.5 text-start">Composant</th>
                  <th className="border border-slate-300 p-1.5 text-start">Code NC / SH</th>
                  <th className="border border-slate-300 p-1.5 text-start">Périmètre</th>
                  <th className="border border-slate-300 p-1.5 text-end">Masse</th>
                  <th className="border border-slate-300 p-1.5 text-end">Émissions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-slate-300 p-3 text-center text-slate-500">
                      Aucun intrant BOM déclaré.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="border border-slate-300 p-1.5 font-medium">{entry.raw_description}</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-[11px]">
                        {entry.matched_ef?.cn_code_8 || '—'}
                      </td>
                      <td className="border border-slate-300 p-1.5 font-mono text-[10px]">
                        {entry.matched_ef?.source_authority || 'BOM'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-end font-mono">
                        {entry.quantity.toLocaleString('fr-FR')} {entry.unit}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-end font-mono font-bold text-slate-900">
                        {entry.total_tco2e} tCO₂e
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 7. Signatures & Certification Block */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-slate-900">Responsable QHSE &amp; Énergie Usine</div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Je certifie l&apos;exactitude des relevés de consommation STEG MT, combustibles et nomenclatures d&apos;achats communiqués à notre importateur UE.
              </p>
              <div className="pt-6 font-mono text-[11px] text-slate-600 italic">
                Édité le {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="space-y-2 sm:border-s border-slate-200 sm:ps-6">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Empreinte d&apos;Intégrité &amp; Avis Réglementaire</span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 break-all bg-slate-100 p-2 rounded border border-slate-200">
                {result.auditIntegrityHash}
              </p>
              <div className="text-[10px] text-slate-500">
                La déclaration CBAM officielle est déposée par le déclarant CBAM autorisé dans l&apos;UE (l&apos;importateur). Ces données fournisseur doivent être vérifiées par un vérificateur accrédité (ISO 14065).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
