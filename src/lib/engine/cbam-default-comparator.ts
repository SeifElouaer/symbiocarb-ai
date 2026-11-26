// ==============================================================================
// SymbioCarb AI - EU Default Values vs Verified Actual Data Comparator
// Reuses the exact free-allocation and certificate-pricing logic from Task 2.
// ==============================================================================

import { CbamCalculationResult } from '@/types';
import { computeCbamCertificatesAndLiability } from './cbam-calculator';
import { EUR_TO_TND_RATE } from './cbam-config';
import { getDefaultMarkupRate, lookupDefaultValue } from './cbam-default-values';

export interface DefaultComparisonInput {
  cbamResult: CbamCalculationResult;
  overrideDefaultSee?: number | null;
  country?: 'TN';
}

export interface CbamDefaultComparisonResult {
  hasDefaultValue: boolean;
  isFromTable: boolean;
  defaultSeeBase: number;
  markupRate: number;
  markupPct: number;
  defaultSeeWithMarkup: number;
  actualSee: number;
  exportTonnes: number;
  defaultTotalEmissionsTco2e: number;
  actualTotalEmissionsTco2e: number;
  liabilityDefaultEur: number;
  liabilityDefaultTnd: number;
  liabilityActualEur: number;
  liabilityActualTnd: number;
  savingForImporterEur: number;
  savingForImporterTnd: number;
  savingPerTonneEur: number;
  isRealDataBetter: boolean;
  isRealDataWorse: boolean;
}

export function compareDefaultVsActual(
  input: DefaultComparisonInput
): CbamDefaultComparisonResult {
  const { cbamResult, overrideDefaultSee, country = 'TN' } = input;
  const cbam = cbamResult.cbamScope;
  const exportTonnes = cbam.exportTonnes;

  const tableEntry = lookupDefaultValue(cbamResult.cnCode8, country);
  const tableSeeBase = tableEntry
    ? cbam.indirectEmissionsIncluded
      ? tableEntry.defaultSeeDirect + tableEntry.defaultSeeIndirect
      : tableEntry.defaultSeeDirect
    : null;

  const hasExplicitOverride =
    typeof overrideDefaultSee === 'number' &&
    Number.isFinite(overrideDefaultSee) &&
    overrideDefaultSee > 0;
  const isFromTable = !hasExplicitOverride && tableSeeBase !== null;
  const defaultSeeBase = hasExplicitOverride
    ? overrideDefaultSee!
    : tableSeeBase !== null
    ? tableSeeBase
    : 0;

  const markupRate = getDefaultMarkupRate(cbam.reportingYear, cbam.sector);
  const markupPct = Number((markupRate * 100).toFixed(1));

  if (!cbam.isInCbamScope || exportTonnes <= 0 || defaultSeeBase <= 0) {
    return {
      hasDefaultValue: false,
      isFromTable,
      defaultSeeBase: Number(defaultSeeBase.toFixed(3)),
      markupRate,
      markupPct,
      defaultSeeWithMarkup: Number((defaultSeeBase * (1 + markupRate)).toFixed(3)),
      actualSee: cbam.cbamSeeTco2ePerTon,
      exportTonnes,
      defaultTotalEmissionsTco2e: 0,
      actualTotalEmissionsTco2e: cbam.cbamEmbeddedForExportTco2e,
      liabilityDefaultEur: 0,
      liabilityDefaultTnd: 0,
      liabilityActualEur: cbam.estimatedLiabilityEur,
      liabilityActualTnd: cbam.estimatedLiabilityTnd,
      savingForImporterEur: 0,
      savingForImporterTnd: 0,
      savingPerTonneEur: 0,
      isRealDataBetter: false,
      isRealDataWorse: false,
    };
  }

  const defaultSeeWithMarkup = defaultSeeBase * (1 + markupRate);
  const defaultLiability = computeCbamCertificatesAndLiability({
    cbamSeeTco2ePerTon: defaultSeeWithMarkup,
    exportTonnes,
    benchmarkTco2ePerTon: cbam.benchmarkTco2ePerTon,
    reportingYear: cbam.reportingYear,
    cbamCertificatePriceEur: cbam.cbamCertificatePriceEur,
    eurToTndRate: cbam.eurToTndRate || EUR_TO_TND_RATE,
    isInCbamScope: cbam.isInCbamScope,
    carbonPricePaidAbroadEur: cbam.carbonPricePaidAbroadEur,
  });

  const liabilityDefaultEur = defaultLiability.estimatedLiabilityEur;
  const liabilityDefaultTnd = defaultLiability.estimatedLiabilityTnd;
  const liabilityActualEur = cbam.estimatedLiabilityEur;
  const liabilityActualTnd = cbam.estimatedLiabilityTnd;

  const savingForImporterEur = liabilityDefaultEur - liabilityActualEur;
  const savingForImporterTnd = Math.round(
    savingForImporterEur * (cbam.eurToTndRate || EUR_TO_TND_RATE)
  );
  const savingPerTonneEur =
    exportTonnes > 0 ? Number((savingForImporterEur / exportTonnes).toFixed(2)) : 0;

  return {
    hasDefaultValue: true,
    isFromTable,
    defaultSeeBase: Number(defaultSeeBase.toFixed(3)),
    markupRate,
    markupPct,
    defaultSeeWithMarkup: Number(defaultSeeWithMarkup.toFixed(3)),
    actualSee: cbam.cbamSeeTco2ePerTon,
    exportTonnes,
    defaultTotalEmissionsTco2e: Number(defaultLiability.cbamEmbeddedForExportRaw.toFixed(2)),
    actualTotalEmissionsTco2e: cbam.cbamEmbeddedForExportTco2e,
    liabilityDefaultEur,
    liabilityDefaultTnd,
    liabilityActualEur,
    liabilityActualTnd,
    savingForImporterEur,
    savingForImporterTnd,
    savingPerTonneEur,
    isRealDataBetter: savingForImporterEur > 0,
    isRealDataWorse: savingForImporterEur < 0,
  };
}
