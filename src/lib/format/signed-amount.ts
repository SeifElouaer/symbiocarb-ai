// ==============================================================================
// SymbioCarb AI - Shared Signed Amount Formatter
// Guarantees unambiguous sign display (+1 234 TND / −501 TND), true Unicode minus,
// consistent semantic colors (emerald/crimson/neutral), and safe empty handling.
// ==============================================================================

import { Locale } from '@/types';

export interface SignedAmountFormatted {
  text: string;
  tone: 'positive' | 'negative' | 'neutral';
  colorClass: string;
}

export const UNICODE_MINUS = '\u2212';

function getIntlLocale(locale: Locale): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'ar-TN') return 'fr-TN'; // Keep Western Arabic numerals cleanly formatted across Tunisian industry
  return 'fr-FR';
}

export function formatSignedAmount(
  value: number | null | undefined,
  currency?: string,
  locale: Locale = 'fr',
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): SignedAmountFormatted {
  if (value === null || value === undefined || typeof value !== 'number' || !Number.isFinite(value)) {
    return {
      text: '—',
      tone: 'neutral',
      colorClass: 'text-slate-400',
    };
  }

  const maxDigits = options?.maximumFractionDigits ?? (Math.abs(value) >= 100 ? 0 : 2);
  const minDigits = options?.minimumFractionDigits ?? 0;

  // Normalize near-zero floating noise to strict 0
  const normalized = Math.abs(value) < 1e-9 ? 0 : value;
  const suffix = currency ? ` ${currency}` : '';

  if (normalized === 0) {
    return {
      text: `0${suffix}`,
      tone: 'neutral',
      colorClass: 'text-slate-300',
    };
  }

  const absFormatted = new Intl.NumberFormat(getIntlLocale(locale), {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  })
    .format(Math.abs(normalized))
    .replace(/[\u202f\u00a0]/g, ' ');

  if (normalized > 0) {
    return {
      text: `+${absFormatted}${suffix}`,
      tone: 'positive',
      colorClass: 'text-emerald-400',
    };
  }

  return {
    text: `${UNICODE_MINUS}${absFormatted}${suffix}`,
    tone: 'negative',
    colorClass: 'text-red-400',
  };
}
