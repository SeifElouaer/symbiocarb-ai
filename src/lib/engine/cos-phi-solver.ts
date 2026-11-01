// ==============================================================================
// Reactive Power Compensation (cos φ) & Capacitor Bank Deterministic Optimizer
// Unit-tested mathematical calculations for industrial power factor correction
// ==============================================================================

import { CosPhiResult } from '@/types';

export interface CosPhiInput {
  activePowerKw: number;        // Average or maximum active load (kW)
  currentCosPhi: number;        // e.g. 0.748
  targetCosPhi?: number;        // Recommended 0.950 (STEG bonus range > 0.92)
  annualActiveKwh: number;      // Annual consumption
  annualReactivePenaltyTnd: number; // Sum of STEG reactive penalties paid
  hasHarmonicLoads?: boolean;   // Inverters, rectifiers, induction furnaces
}

export function solveCosPhiCompensation(input: CosPhiInput): CosPhiResult {
  const currentCosPhi = Math.max(0.5, Math.min(0.99, input.currentCosPhi));
  const targetCosPhi = Math.max(currentCosPhi + 0.01, Math.min(0.99, input.targetCosPhi ?? 0.950));

  // Compute tan(φ) = sqrt(1 - cos²φ) / cosφ
  const currentTanPhi = Math.sqrt(1 - currentCosPhi * currentCosPhi) / currentCosPhi;
  const targetTanPhi = Math.sqrt(1 - targetCosPhi * targetCosPhi) / targetCosPhi;

  // Exact required reactive compensation: Qc = P * (tan φ1 - tan φ2)
  const exactQcKvar = input.activePowerKw * (currentTanPhi - targetTanPhi);

  // Round up to nearest standard Tunisian industrial capacitor bank step (multiples of 25 kVAR)
  const requiredQcKvar = Math.max(25, Math.ceil(exactQcKvar / 25) * 25);

  // Joule loss reduction: deltaP / P = 1 - (cos φ1 / cos φ2)²
  // Typically cable & transformer losses account for 2.5% of total industrial energy
  const lossReductionRatio = Math.max(0, 1 - Math.pow(currentCosPhi / targetCosPhi, 2));
  const jouleLossesReducedKwh = input.annualActiveKwh * 0.025 * lossReductionRatio;
  const jouleSavingsTnd = jouleLossesReducedKwh * 0.248; // Average MT kWh price

  // Total annual financial savings
  const annualPenaltySavedTnd = input.annualReactivePenaltyTnd;
  const totalAnnualGainTnd = annualPenaltySavedTnd + jouleSavingsTnd;

  // Equipment CAPEX:
  // Standard capacitor bank: ~85 TND/kVAR
  // Detuned capacitor bank with anti-harmonic reactor (189 Hz / 7%): ~140 TND/kVAR
  const antiHarmonicReactorRecommended = input.hasHarmonicLoads || currentCosPhi < 0.78;
  const unitCostPerKvar = antiHarmonicReactorRecommended ? 140 : 85;
  const estimatedCapexTnd = requiredQcKvar * unitCostPerKvar + 1500; // +1500 TND installation & protections

  // Payback period
  const paybackPeriodMonths = totalAnnualGainTnd > 0
    ? Number(((estimatedCapexTnd / totalAnnualGainTnd) * 12).toFixed(1))
    : 99.9;

  return {
    currentCosPhi: Number(currentCosPhi.toFixed(3)),
    targetCosPhi: Number(targetCosPhi.toFixed(3)),
    currentTanPhi: Number(currentTanPhi.toFixed(3)),
    targetTanPhi: Number(targetTanPhi.toFixed(3)),
    requiredQcKvar,
    annualPenaltySavedTnd: Number(annualPenaltySavedTnd.toFixed(2)),
    jouleLossesReducedKwh: Math.round(jouleLossesReducedKwh),
    jouleSavingsTnd: Number(jouleSavingsTnd.toFixed(2)),
    totalAnnualGainTnd: Number(totalAnnualGainTnd.toFixed(2)),
    estimatedCapexTnd: Math.round(estimatedCapexTnd),
    paybackPeriodMonths,
    resonanceRiskWarning: currentCosPhi < 0.75,
    antiHarmonicReactorRecommended,
  };
}

