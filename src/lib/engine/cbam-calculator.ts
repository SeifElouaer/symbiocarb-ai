// ==============================================================================
// EU CBAM (Regulation EU 2023/956, 2026+ Definitive Period) & ISO 14064-1 Engine
// Single source of truth used by AuditContext, Cockpit, /cbam, PDF & Supplier XML.
// Keeps Result A (Corporate ISO 14064-1 Footprint) separate from Result B (CBAM).
// ==============================================================================

import { CbamCalculationResult } from '@/types';
import {
  CBAM_PHASE_IN_YEARS,
  CBAM_REGULATORY_DISCLAIMER,
  DEFAULT_CBAM_CERTIFICATE_PRICE_EUR,
  EUR_TO_TND_RATE,
  FUEL_EMISSION_FACTORS,
  STEG_GRID_EF_KG_CO2E_PER_KWH,
  deriveCbamSector,
  getFreeAllocationFactor,
  isCbamPrecursorCnCode,
} from './cbam-config';

export interface PrecursorMaterial {
  name: string;
  cnCode8: string;
  quantityTons: number;
  efTco2ePerTon: number;
  isCbamRelevantPrecursor?: boolean;
}

export interface CbamReportInput {
  productName?: string;
  cnCode8: string;
  finishedProductTons: number;
  annualExportTons?: number;

  // Scope 1 direct fuel consumption (monthly average inputs)
  naturalGasM3PerMonth?: number;
  heavyFuelTonsPerMonth?: number;
  dieselLitersPerMonth?: number;
  // Optional direct annual Scope 1 override (tCO2e/yr) for unit tests / external callers
  directScope1Tco2e?: number;

  // Scope 2 electricity
  annualElectricityKwh?: number;
  scope2GridEfKgCo2ePerKwh?: number;
  gridEmissionSource?: string;
  // Optional direct annual Scope 2 override (tCO2e/yr) for unit tests
  directScope2Tco2e?: number;

  // Scope 3 BOM & optional legacy tonnage fields
  precursors?: PrecursorMaterial[];
  legacySteelTons?: number;
  legacyAluminumTons?: number;

  // Definitive-period regulatory settings
  reportingYear?: number;
  cbamCertificatePriceEur?: number;
  eurToTndRate?: number;
  carbonPricePaidAbroadEur?: number;

  verificationStatus?: 'PRE_AUDIT_DRAFT' | 'VERIFIER_REVIEW' | 'ACCREDITED_CERTIFIED';
  accreditationBodyId?: string;
}

function safeNonNegative(value: number | undefined | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value;
}

export function resolvePrecursorRelevance(item: PrecursorMaterial): boolean {
  if (typeof item.isCbamRelevantPrecursor === 'boolean') {
    return item.isCbamRelevantPrecursor;
  }
  return isCbamPrecursorCnCode(item.cnCode8);
}

/**
 * Computes CBAM liability for a given total CBAM embedded emissions and parameters.
 * Reused identically by the core CBAM calculator and the Default vs Actual comparator.
 */
export function computeCbamCertificatesAndLiability(params: {
  cbamSeeTco2ePerTon: number;
  exportTonnes: number;
  benchmarkTco2ePerTon: number;
  reportingYear: number;
  cbamCertificatePriceEur: number;
  eurToTndRate: number;
  isInCbamScope: boolean;
  carbonPricePaidAbroadEur?: number;
}): {
  cbamEmbeddedForExportRaw: number;
  freeAllocationFactor: number;
  freeAllocationDeductionRaw: number;
  carbonPricePaidAbroadEquivalentRaw: number;
  certificatesRaw: number;
  estimatedLiabilityEur: number;
  estimatedLiabilityTnd: number;
} {
  const see = safeNonNegative(params.cbamSeeTco2ePerTon);
  const exportTonnes = safeNonNegative(params.exportTonnes);
  const benchmark = safeNonNegative(params.benchmarkTco2ePerTon);
  const priceEur = safeNonNegative(params.cbamCertificatePriceEur);
  const fx = safeNonNegative(params.eurToTndRate) || EUR_TO_TND_RATE;
  const freeAllocationFactor = getFreeAllocationFactor(params.reportingYear);
  const carbonPricePaidAbroadEur = safeNonNegative(params.carbonPricePaidAbroadEur);

  if (!params.isInCbamScope || exportTonnes <= 0) {
    return {
      cbamEmbeddedForExportRaw: 0,
      freeAllocationFactor,
      freeAllocationDeductionRaw: 0,
      carbonPricePaidAbroadEquivalentRaw: 0,
      certificatesRaw: 0,
      estimatedLiabilityEur: 0,
      estimatedLiabilityTnd: 0,
    };
  }

  const cbamEmbeddedForExportRaw = see * exportTonnes;
  const freeAllocationDeductionRaw = benchmark * exportTonnes * freeAllocationFactor;
  const carbonPricePaidAbroadEquivalentRaw =
    priceEur > 0 ? carbonPricePaidAbroadEur / priceEur : 0;

  const certificatesRaw = Math.max(
    0,
    cbamEmbeddedForExportRaw - carbonPricePaidAbroadEquivalentRaw - freeAllocationDeductionRaw
  );

  const estimatedLiabilityEur = Math.round(certificatesRaw * priceEur);
  const estimatedLiabilityTnd = Math.round(estimatedLiabilityEur * fx);

  return {
    cbamEmbeddedForExportRaw,
    freeAllocationFactor,
    freeAllocationDeductionRaw,
    carbonPricePaidAbroadEquivalentRaw,
    certificatesRaw,
    estimatedLiabilityEur,
    estimatedLiabilityTnd,
  };
}

/**
 * Single source of truth for corporate carbon footprint (Result A) and
 * EU CBAM definitive-period embedded emissions & liability (Result B).
 */
export function calculateCbamReport(input: CbamReportInput): CbamCalculationResult {
  const productName = (input.productName || '').trim();
  const cnCode8 = (input.cnCode8 || '').trim();
  const finishedProductTons = safeNonNegative(input.finishedProductTons);
  const explicitExportTons = safeNonNegative(input.annualExportTons);
  const exportTonnes =
    finishedProductTons > 0
      ? explicitExportTons > 0
        ? explicitExportTons
        : finishedProductTons
      : 0;

  const reportingYear =
    typeof input.reportingYear === 'number' && Number.isFinite(input.reportingYear)
      ? Math.trunc(input.reportingYear)
      : 2026;
  const cbamCertificatePriceEur =
    typeof input.cbamCertificatePriceEur === 'number' &&
    Number.isFinite(input.cbamCertificatePriceEur) &&
    input.cbamCertificatePriceEur >= 0
      ? input.cbamCertificatePriceEur
      : DEFAULT_CBAM_CERTIFICATE_PRICE_EUR;
  const eurToTndRate =
    typeof input.eurToTndRate === 'number' &&
    Number.isFinite(input.eurToTndRate) &&
    input.eurToTndRate > 0
      ? input.eurToTndRate
      : EUR_TO_TND_RATE;
  const carbonPricePaidAbroadEur = safeNonNegative(input.carbonPricePaidAbroadEur);

  // 1. Scope 1: Direct emissions from per-fuel factors (natural gas/Nm³, heavy fuel/t, diesel/L)
  const scope1FromFuels =
    ((safeNonNegative(input.naturalGasM3PerMonth) * FUEL_EMISSION_FACTORS.NATURAL_GAS_KG_CO2E_PER_NM3 +
      safeNonNegative(input.heavyFuelTonsPerMonth) * FUEL_EMISSION_FACTORS.HEAVY_FUEL_KG_CO2E_PER_TON +
      safeNonNegative(input.dieselLitersPerMonth) * FUEL_EMISSION_FACTORS.DIESEL_KG_CO2E_PER_LITER) *
      12) /
    1000;
  const scope1Raw =
    input.directScope1Tco2e !== undefined ? safeNonNegative(input.directScope1Tco2e) : scope1FromFuels;

  // 2. Scope 2: Indirect electricity emissions (STEG National Grid)
  const gridEf =
    typeof input.scope2GridEfKgCo2ePerKwh === 'number' &&
    Number.isFinite(input.scope2GridEfKgCo2ePerKwh) &&
    input.scope2GridEfKgCo2ePerKwh >= 0
      ? input.scope2GridEfKgCo2ePerKwh
      : STEG_GRID_EF_KG_CO2E_PER_KWH;
  const scope2FromKwh = (safeNonNegative(input.annualElectricityKwh) * gridEf) / 1000;
  const scope2Raw =
    input.directScope2Tco2e !== undefined ? safeNonNegative(input.directScope2Tco2e) : scope2FromKwh;

  // 3. Scope 3: Upstream BOM materials + optional legacy inputs
  const precursors = Array.isArray(input.precursors) ? input.precursors : [];
  let cbamRelevantBomRaw = 0;
  let excludedBomRaw = 0;

  for (const item of precursors) {
    const qty = safeNonNegative(item.quantityTons);
    const ef = safeNonNegative(item.efTco2ePerTon);
    const itemTco2e = qty * ef;
    if (resolvePrecursorRelevance(item)) {
      cbamRelevantBomRaw += itemTco2e;
    } else {
      excludedBomRaw += itemTco2e;
    }
  }

  // Legacy steel/aluminum fields (already CBAM sectors ch.72 & ch.76)
  const legacySteelTco2e = safeNonNegative(input.legacySteelTons) * 1.85;
  const legacyAlumTco2e = safeNonNegative(input.legacyAluminumTons) * 4.5;
  const legacyScope3Raw = legacySteelTco2e + legacyAlumTco2e;

  const cbamRelevantPrecursorsRaw = cbamRelevantBomRaw + legacyScope3Raw;
  const scope3AllBomRaw = cbamRelevantPrecursorsRaw + excludedBomRaw;

  // Result A: Full corporate footprint (ISO 14064-1)
  const totalCorporateRaw = scope1Raw + scope2Raw + scope3AllBomRaw;
  const corporateIntensityRaw =
    finishedProductTons > 0 ? totalCorporateRaw / finishedProductTons : 0;

  // Result B: CBAM-relevant embedded emissions
  const sectorInfo = deriveCbamSector(cnCode8);
  const indirectCountedRaw =
    sectorInfo.isInCbamScope && sectorInfo.indirectEmissionsIncluded ? scope2Raw : 0;
  const totalCbamEmbeddedRaw = sectorInfo.isInCbamScope
    ? scope1Raw + indirectCountedRaw + cbamRelevantPrecursorsRaw
    : 0;
  const cbamSeeRaw =
    sectorInfo.isInCbamScope && finishedProductTons > 0
      ? totalCbamEmbeddedRaw / finishedProductTons
      : 0;

  // Use exact unrounded ratio for liability so exportedTonnes == finishedProductTons gives zero rounding drift
  const cbamSeeForLiability =
    sectorInfo.isInCbamScope && finishedProductTons > 0
      ? totalCbamEmbeddedRaw / finishedProductTons
      : 0;

  const liability = computeCbamCertificatesAndLiability({
    cbamSeeTco2ePerTon: cbamSeeForLiability,
    exportTonnes,
    benchmarkTco2ePerTon: sectorInfo.benchmarkTco2ePerTon,
    reportingYear,
    cbamCertificatePriceEur,
    eurToTndRate,
    isInCbamScope: sectorInfo.isInCbamScope,
    carbonPricePaidAbroadEur,
  });

  const hasEmissions = totalCorporateRaw > 0;
  const hasProduction = finishedProductTons > 0;
  const hasData = hasEmissions || hasProduction;

  // Audit integrity hash (only meaningful when data is present)
  let auditIntegrityHash = 'PENDING-DATA';
  if (hasData) {
    const rawString = `${cnCode8}-${finishedProductTons}-${totalCbamEmbeddedRaw.toFixed(3)}-${reportingYear}-${cbamCertificatePriceEur}`;
    let hashNum = 0;
    for (let i = 0; i < rawString.length; i++) {
      hashNum = (hashNum << 5) - hashNum + rawString.charCodeAt(i);
      hashNum |= 0;
    }
    auditIntegrityHash = `SHA256-${Math.abs(hashNum).toString(16).toUpperCase()}-ISO14064`;
  }

  const benchmarkGap =
    sectorInfo.isInCbamScope && hasProduction
      ? Number((cbamSeeRaw - sectorInfo.benchmarkTco2ePerTon).toFixed(3))
      : 0;

  return {
    productName,
    cnCode8,
    finishedProductTons: Number(finishedProductTons.toFixed(2)),
    hasData,
    hasProduction,
    corporateFootprint: {
      scope1DirectTco2e: Number(scope1Raw.toFixed(2)),
      scope2IndirectTco2e: Number(scope2Raw.toFixed(2)),
      scope3AllBomTco2e: Number(scope3AllBomRaw.toFixed(2)),
      totalTco2e: Number(totalCorporateRaw.toFixed(2)),
      intensityTco2ePerTon: Number(corporateIntensityRaw.toFixed(3)),
    },
    cbamScope: {
      sector: sectorInfo.sector,
      isInCbamScope: sectorInfo.isInCbamScope,
      indirectEmissionsIncluded: sectorInfo.indirectEmissionsIncluded,
      directEmissionsTco2e: Number((sectorInfo.isInCbamScope ? scope1Raw : 0).toFixed(2)),
      indirectEmissionsForInfoTco2e: Number(scope2Raw.toFixed(2)),
      indirectEmissionsCountedTco2e: Number(indirectCountedRaw.toFixed(2)),
      cbamRelevantPrecursorsTco2e: Number(
        (sectorInfo.isInCbamScope ? cbamRelevantPrecursorsRaw : 0).toFixed(2)
      ),
      excludedBomTco2e: Number(excludedBomRaw.toFixed(2)),
      totalCbamEmbeddedTco2e: Number(totalCbamEmbeddedRaw.toFixed(2)),
      cbamSeeTco2ePerTon: Number(cbamSeeRaw.toFixed(3)),
      exportTonnes: Number(exportTonnes.toFixed(2)),
      cbamEmbeddedForExportTco2e: Number(liability.cbamEmbeddedForExportRaw.toFixed(2)),
      benchmarkTco2ePerTon: sectorInfo.benchmarkTco2ePerTon,
      reportingYear,
      freeAllocationFactor: liability.freeAllocationFactor,
      freeAllocationDeductionTco2e: Number(liability.freeAllocationDeductionRaw.toFixed(2)),
      carbonPricePaidAbroadEur: Number(carbonPricePaidAbroadEur.toFixed(2)),
      carbonPricePaidAbroadEquivalentTco2e: Number(
        liability.carbonPricePaidAbroadEquivalentRaw.toFixed(2)
      ),
      certificatesRequired: Number(liability.certificatesRaw.toFixed(2)),
      cbamCertificatePriceEur,
      eurToTndRate,
      estimatedLiabilityEur: liability.estimatedLiabilityEur,
      estimatedLiabilityTnd: liability.estimatedLiabilityTnd,
    },
    scope1DirectTco2e: Number(scope1Raw.toFixed(2)),
    scope2IndirectTco2e: Number(scope2Raw.toFixed(2)),
    scope3PrecursorsTco2e: Number(scope3AllBomRaw.toFixed(2)),
    totalEmbeddedTco2e: Number(totalCorporateRaw.toFixed(2)),
    specificEmbeddedEmissionsTco2ePerTon: Number(cbamSeeRaw.toFixed(3)),
    euEtsCarbonPriceEur: cbamCertificatePriceEur,
    estimatedCbamTaxLiabilityEur: liability.estimatedLiabilityEur,
    estimatedCbamTaxLiabilityTnd: liability.estimatedLiabilityTnd,
    freeAllocationBenchmarkGap: benchmarkGap,
    verificationStatus: input.verificationStatus || 'PRE_AUDIT_DRAFT',
    accreditationBodyId: input.accreditationBodyId || 'ACCREDITATION-PENDING-ISO14065',
    auditIntegrityHash,
    regulatoryDisclaimer: CBAM_REGULATORY_DISCLAIMER,
    gridEmissionSource:
      input.gridEmissionSource ||
      `STEG Réseau National Moyenne Tension (${STEG_GRID_EF_KG_CO2E_PER_KWH} kgCO₂e/kWh)`,
  };
}

export interface CbamYearProjectionPoint {
  year: number;
  freeAllocationFactor: number;
  certificatesRequired: number;
  liabilityEur: number;
  liabilityTnd: number;
}

/**
 * Projects the same factory's CBAM certificate exposure across the 2026-2034 phase-in.
 */
export function projectCbamLiabilityByYear(
  input: CbamReportInput,
  years: readonly number[] = CBAM_PHASE_IN_YEARS
): CbamYearProjectionPoint[] {
  return years.map((year) => {
    const res = calculateCbamReport({ ...input, reportingYear: year });
    return {
      year,
      freeAllocationFactor: res.cbamScope.freeAllocationFactor,
      certificatesRequired: res.cbamScope.certificatesRequired,
      liabilityEur: res.cbamScope.estimatedLiabilityEur,
      liabilityTnd: res.cbamScope.estimatedLiabilityTnd,
    };
  });
}

// Backwards-compatible helper alias kept for any legacy imports
export function calculateCbamSpecificEmbeddedEmissions(
  input: CbamReportInput
): CbamCalculationResult {
  return calculateCbamReport(input);
}
