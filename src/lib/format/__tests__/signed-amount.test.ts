import { describe, it, expect } from 'vitest';
import { formatSignedAmount, UNICODE_MINUS } from '../signed-amount';

describe('formatSignedAmount', () => {
  it('formats positive numbers with + prefix and emerald color', () => {
    const res = formatSignedAmount(1234, 'TND', 'fr');
    expect(res.text).toBe('+1 234 TND');
    expect(res.tone).toBe('positive');
    expect(res.colorClass).toContain('emerald');
  });

  it('formats negative numbers with true Unicode minus (never +-) and crimson color', () => {
    const res = formatSignedAmount(-501, 'TND/mois', 'fr');
    expect(res.text).toBe(`${UNICODE_MINUS}501 TND/mois`);
    expect(res.text).not.toContain('+-');
    expect(res.tone).toBe('negative');
    expect(res.colorClass).toContain('red');
  });

  it('handles zero and negative zero neutrally without sign', () => {
    expect(formatSignedAmount(0, 'TND', 'en').text).toBe('0 TND');
    expect(formatSignedAmount(-0, 'TND', 'en').text).toBe('0 TND');
    expect(formatSignedAmount(0, 'TND', 'en').tone).toBe('neutral');
  });

  it('handles NaN, Infinity, null and undefined by rendering em-dash', () => {
    expect(formatSignedAmount(NaN, 'TND').text).toBe('—');
    expect(formatSignedAmount(Infinity, 'TND').text).toBe('—');
    expect(formatSignedAmount(undefined, 'TND').text).toBe('—');
    expect(formatSignedAmount(null, 'TND').text).toBe('—');
  });
});
