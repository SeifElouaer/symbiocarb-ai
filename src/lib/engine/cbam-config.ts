// ==============================================================================
// SymbioCarb AI - Central Regulatory & Emission Factor Configuration
// Single source of truth for EU CBAM (2026+ definitive period), STEG & fuels.
// Every regulatory constant carries its source and a // VERIFY: tag.
// ==============================================================================

export type CbamSector =
  | 'iron_steel'
  | 'aluminium'
  | 'cement'
  | 'fertilisers'
  | 'outside_scope';

// VERIFY: Central Bank of Tunisia (BCT) EUR/TND reference exchange rate
export const EUR_TO_TND_RATE = 3.40;

// VERIFY: EU ETS EUA auction price; official CBAM certificate price is published quarterly in 2026 and weekly from 2027 per Reg. (EU) 2023/956 Art. 21
export const DEFAULT_CBAM_CERTIFICATE_PRICE_EUR = 85.0;

// VERIFY: ANME / STEG Tunisia national grid emission factor (kgCO2e/kWh)
export const STEG_GRID_EF_KG_CO2E_PER_KWH = 0.473;

export const FUEL_EMISSION_FACTORS = {
  // VERIFY: IPCC 2006 / ADEME Base Empreinte — Natural gas stationary combustion (kgCO2e / Nm³)
  NATURAL_GAS_KG_CO2E_PER_NM3: 2.02,
  // VERIFY: IPCC 2006 / ADEME Base Empreinte — Heavy fuel oil combustion (kgCO2e / metric ton)
  HEAVY_FUEL_KG_CO2E_PER_TON: 3150,
  // VERIFY: IPCC 2006 / ADEME Base Empreinte — Diesel / gasoil combustion (kgCO2e / liter)
  DIESEL_KG_CO2E_PER_LITER: 2.68,
} as const;

// VERIFY: ETS Directive Art. 10a(1a) / Implementing Reg. (EU) 2025/2620 — CBAM free-allocation phase-in schedule
export const CBAM_FREE_ALLOCATION_FACTORS: Record<number, number> = {
  2026: 0.975,
  2027: 0.95,
  2028: 0.90,
  2029: 0.775,
  2030: 0.515,
  2031: 0.39,
  2032: 0.265,
  2033: 0.14,
  2034: 0.0,
};

export const CBAM_PHASE_IN_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034] as const;

export function getFreeAllocationFactor(year: number): number {
  if (!Number.isFinite(year)) return CBAM_FREE_ALLOCATION_FACTORS[2026];
  const roundedYear = Math.trunc(year);
  if (roundedYear <= 2026) return CBAM_FREE_ALLOCATION_FACTORS[2026];
  if (roundedYear >= 2034) return 0.0;
  return CBAM_FREE_ALLOCATION_FACTORS[roundedYear] ?? 0.0;
}

// VERIFY: Implementing Reg. (EU) 2025/2620 — EU ETS / CBAM product benchmarks (tCO2e/t)
export const CBAM_BENCHMARKS: Record<string, number> = {
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Hot-rolled flat steel (CN 7208)
  '7208': 1.35,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Cold-rolled flat steel (CN 7209)
  '7209': 1.42,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Steel bars and rods (CN 7214)
  '7214': 1.28,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Other articles of iron or steel (CN 7326)
  '7326': 1.30,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Unwrought aluminium (CN 7601)
  '7601': 6.80,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Aluminium bars, rods & profiles (CN 7604)
  '7604': 7.10,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Mineral/chemical nitrogenous fertilisers (CN 3102)
  '3102': 1.60,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Portland / aluminous cement & clinker (CN 2523)
  '2523': 0.70,
  // VERIFY: Implementing Reg. (EU) 2025/2620 — Fallback benchmark when CN 4-digit code is unmapped
  DEFAULT: 1.30,
};

// VERIFY: Regulation (EU) 2025/2083 — Single 50 tonnes/year mass de minimis threshold across iron & steel, aluminium, cement and fertilisers
export const CBAM_DE_MINIMIS_TONNES_PER_YEAR = 50;

// VERIFY: Regulation (EU) 2023/956 Annex I — Listed CN chapter 73 goods in CBAM scope
export const CBAM_ANNEX1_CN73_PREFIXES = [
  '7301',
  '7302',
  '7303',
  '7304',
  '7305',
  '7306',
  '7307',
  '7308',
  '7309',
  '7310',
  '7311',
  '7318',
  '7326',
] as const;

export function normalizeCnCode(cnCode: string): string {
  return (cnCode || '').replace(/\s+/g, '').replace(/[^0-9]/g, '');
}

export interface CbamSectorInfo {
  sector: CbamSector;
  isInCbamScope: boolean;
  indirectEmissionsIncluded: boolean;
  benchmarkTco2ePerTon: number;
}

/**
 * Derives CBAM sector, whether the good falls in CBAM scope, and whether
 * indirect (electricity) emissions enter CBAM-relevant embedded emissions.
 * Per Reg. (EU) 2023/956 Annex II: indirect emissions count for cement & fertilisers,
 * and are excluded from CBAM embedded emissions for iron & steel and aluminium.
 */
export function deriveCbamSector(cnCode: string): CbamSectorInfo {
  const clean = normalizeCnCode(cnCode);
  const prefix2 = clean.slice(0, 2);
  const prefix4 = clean.slice(0, 4);

  let sector: CbamSector = 'outside_scope';
  if (prefix2 === '72' || prefix2 === '73') {
    sector = 'iron_steel';
  } else if (prefix2 === '76') {
    sector = 'aluminium';
  } else if (prefix4 === '2523') {
    sector = 'cement';
  } else if (
    prefix2 === '31' ||
    prefix4 === '2808' ||
    prefix4 === '2814' ||
    prefix4 === '2834'
  ) {
    sector = 'fertilisers';
  }

  const isInCbamScope = sector !== 'outside_scope';
  const indirectEmissionsIncluded = sector === 'cement' || sector === 'fertilisers';
  const benchmarkTco2ePerTon = isInCbamScope
    ? CBAM_BENCHMARKS[prefix4] ?? CBAM_BENCHMARKS.DEFAULT
    : 0;

  return {
    sector,
    isInCbamScope,
    indirectEmissionsIncluded,
    benchmarkTco2ePerTon,
  };
}

/**
 * Determines whether a BOM input material CN code corresponds to a CBAM-relevant precursor
 * (chapters 72, listed 73 codes, 76, 2523, 31, 2808/2814/2834, and hydrogen 2804 10).
 */
export function isCbamPrecursorCnCode(cnCode: string): boolean {
  const clean = normalizeCnCode(cnCode);
  if (clean.length < 2) return false;
  const prefix2 = clean.slice(0, 2);
  const prefix4 = clean.slice(0, 4);
  const prefix6 = clean.slice(0, 6);

  if (prefix2 === '72') return true;
  if (prefix2 === '73') {
    if (clean.length < 4) return false;
    return (CBAM_ANNEX1_CN73_PREFIXES as readonly string[]).includes(prefix4);
  }
  if (prefix2 === '76') return true;
  if (prefix4 === '2523') return true;
  if (prefix2 === '31') return true;
  if (prefix4 === '2808' || prefix4 === '2814' || prefix4 === '2834') return true;
  if (prefix6 === '280410') return true;

  return false;
}

export const CBAM_REGULATORY_DISCLAIMER =
  'Communication des émissions destinée à votre importateur UE (Règlement UE 2023/956). ' +
  'La déclaration CBAM officielle et le paiement des certificats incombent au déclarant CBAM autorisé dans l’UE. ' +
  'Les données d’installation doivent être vérifiées par un vérificateur accrédité (ISO 14065).';
