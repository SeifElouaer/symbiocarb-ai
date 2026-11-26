// ==============================================================================
// SymbioCarb AI - EU CBAM Definitive Period Default Values & Mark-up Config
// Contains ONLY the data structure, yearly mark-up schedule, and demo CN entries
// for Tunisia. Every numeric value MUST be verified against official EC tables.
// ==============================================================================

import { CbamSector, normalizeCnCode } from './cbam-config';

export interface CbamDefaultValueEntry {
  cnCode: string;
  country: 'TN';
  year: number;
  defaultSeeDirect: number;
  defaultSeeIndirect: number;
  sourceNote: string;
}

// VERIFY: Implementing Reg. (EU) 2025/XXXX — EC definitive-period default value mark-up schedule
export const CBAM_DEFAULT_MARKUP_STANDARD: Record<number, number> = {
  2026: 0.10,
  2027: 0.20,
  2028: 0.30,
};

// VERIFY: Implementing Reg. (EU) 2025/XXXX — EC lower mark-up schedule for fertilisers
export const CBAM_DEFAULT_MARKUP_FERTILISERS: Record<number, number> = {
  2026: 0.01,
  2027: 0.02,
  2028: 0.03,
};

export function getDefaultMarkupRate(year: number, sector: CbamSector): number {
  const table =
    sector === 'fertilisers'
      ? CBAM_DEFAULT_MARKUP_FERTILISERS
      : CBAM_DEFAULT_MARKUP_STANDARD;
  if (!Number.isFinite(year) || year <= 2026) return table[2026];
  if (year === 2027) return table[2027];
  return table[2028];
}

// Shipped with ONLY the structure and the demo CN codes (iron & steel Tunisia demo).
// Unmapped CN codes return null so the UI prompts the user for the published EC value.
export const CBAM_DEFAULT_VALUES_TABLE: Record<string, CbamDefaultValueEntry> = {
  // VERIFY: EC "Default values definitive period" Excel, Tunisia row (CN 7326)
  'TN:7326': {
    cnCode: '7326',
    country: 'TN',
    year: 2026,
    defaultSeeDirect: 2.35,
    defaultSeeIndirect: 0.35,
    sourceNote: 'VERIFY: EC Default values definitive period Excel, Tunisia row (CN 7326)',
  },
  // VERIFY: EC "Default values definitive period" Excel, Tunisia row (CN 7209)
  'TN:7209': {
    cnCode: '7209',
    country: 'TN',
    year: 2026,
    defaultSeeDirect: 2.28,
    defaultSeeIndirect: 0.32,
    sourceNote: 'VERIFY: EC Default values definitive period Excel, Tunisia row (CN 7209)',
  },
  // VERIFY: EC "Default values definitive period" Excel, Tunisia row (CN 7214)
  'TN:7214': {
    cnCode: '7214',
    country: 'TN',
    year: 2026,
    defaultSeeDirect: 2.15,
    defaultSeeIndirect: 0.28,
    sourceNote: 'VERIFY: EC Default values definitive period Excel, Tunisia row (CN 7214)',
  },
};

/**
 * Looks up a Tunisia default SEE entry by 8-digit CN code with 4-digit fallback.
 * Returns null if no entry is present in the demo table.
 */
export function lookupDefaultValue(
  cnCode: string,
  country: 'TN' = 'TN'
): CbamDefaultValueEntry | null {
  const clean = normalizeCnCode(cnCode);
  if (clean.length < 4) return null;

  if (clean.length >= 8) {
    const exact8 = CBAM_DEFAULT_VALUES_TABLE[`${country}:${clean.slice(0, 8)}`];
    if (exact8) return exact8;
  }

  const fallback4 = CBAM_DEFAULT_VALUES_TABLE[`${country}:${clean.slice(0, 4)}`];
  return fallback4 || null;
}
