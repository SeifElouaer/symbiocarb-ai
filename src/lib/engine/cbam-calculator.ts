// ==============================================================================
// EU CBAM (Regulation EU 2023/956) & ISO 14064 Deterministic Calculator
// Specific Embedded Emissions (SEE) & EU ETS Carbon Border Tax Liability
// ==============================================================================

import { CbamCalculationResult } from '@/types';

export interface PrecursorMaterial {
  name: string;
  cnCode8: string;
  quantityTons: number;
  efTco2ePerTon: number; // Scope 3 precursor factor
}

export interface CbamInput {
  productName: string;
  cnCode8: string;                      // e.g. '7209 16 90' (Cold-rolled steel coils)
  finishedProductTons: number;          // Activity Level AL
  scope1FuelKwh?: number;               // Direct natural gas / fuel consumption
  scope1EfKgCo2ePerKwh?: number;        // ~0.202 for gas
  scope2ElectricityKwh: number;         // STEG MT electricity consumed
  scope2GridEfKgCo2ePerKwh?: number;    // 0.473 for Tunisia
  precursors: PrecursorMaterial[];      // Steel, aluminum, chemicals
  euEtsPriceEur?: number;               // Default 85 EUR/tCO2e
  eurToTndRate?: number;                // 3.40 TND per EUR
}

export const CBAM_BENCHMARKS: Record<string, number> = {
  // Free allocation benchmark (tCO2e/t) under EU ETS
  '7208': 1.35, // Hot-rolled flat steel
  '7209': 1.42, // Cold-rolled steel
  '7214': 1.28, // Steel bars
  '7601': 6.80, // Unwrought aluminum
  '7604': 7.10, // Aluminum profiles
  '3102': 1.60, // Urea / fertilizers
  '2523': 0.70, // Cement clinker
  DEFAULT: 1.30,
};

export function calculateCbamSpecificEmbeddedEmissions(input: CbamInput): CbamCalculationResult {
  const {
    productName,
    cnCode8,
    finishedProductTons,
    scope1FuelKwh = 0,
    scope1EfKgCo2ePerKwh = 0.202,
    scope2ElectricityKwh,
    scope2GridEfKgCo2ePerKwh = 0.473,
    precursors,
    euEtsPriceEur = 85.0,
    eurToTndRate = 3.40,
  } = input;

  const al = Math.max(0.1, finishedProductTons);

  // 1. Scope 1: Direct emissions
  const scope1DirectTco2e = (scope1FuelKwh * scope1EfKgCo2ePerKwh) / 1000.0;

  // 2. Scope 2: Indirect electricity emissions
  const scope2IndirectTco2e = (scope2ElectricityKwh * scope2GridEfKgCo2ePerKwh) / 1000.0;

  // 3. Scope 3: Precursor materials (embedded in inputs)
  const scope3PrecursorsTco2e = precursors.reduce(
    (acc, item) => acc + item.quantityTons * item.efTco2ePerTon,
    0
  );

  // 4. Total embedded emissions & SEE (tCO2e / ton)
  const totalEmbeddedTco2e = scope1DirectTco2e + scope2IndirectTco2e + scope3PrecursorsTco2e;
  const specificEmbeddedEmissionsTco2ePerTon = totalEmbeddedTco2e / al;

  // 5. Benchmark & EU ETS Tax Liability
  const prefix4 = cnCode8.replace(/\s+/g, '').slice(0, 4);
  const benchmark = CBAM_BENCHMARKS[prefix4] || CBAM_BENCHMARKS.DEFAULT;
  
  // Tax is assessed on emissions above EU free allocation benchmark
  const taxableEmissionsTco2e = Math.max(0, totalEmbeddedTco2e - benchmark * al);
  const estimatedCbamTaxLiabilityEur = taxableEmissionsTco2e * euEtsPriceEur;
  const estimatedCbamTaxLiabilityTnd = estimatedCbamTaxLiabilityEur * eurToTndRate;

  return {
    productName,
    cnCode8,
    finishedProductTons: Number(finishedProductTons.toFixed(2)),
    scope1DirectTco2e: Number(scope1DirectTco2e.toFixed(2)),
    scope2IndirectTco2e: Number(scope2IndirectTco2e.toFixed(2)),
    scope3PrecursorsTco2e: Number(scope3PrecursorsTco2e.toFixed(2)),
    totalEmbeddedTco2e: Number(totalEmbeddedTco2e.toFixed(2)),
    specificEmbeddedEmissionsTco2ePerTon: Number(specificEmbeddedEmissionsTco2ePerTon.toFixed(3)),
    euEtsCarbonPriceEur: euEtsPriceEur,
    estimatedCbamTaxLiabilityEur: Math.round(estimatedCbamTaxLiabilityEur),
    estimatedCbamTaxLiabilityTnd: Math.round(estimatedCbamTaxLiabilityTnd),
    freeAllocationBenchmarkGap: Number((specificEmbeddedEmissionsTco2ePerTon - benchmark).toFixed(3)),
  };
}

