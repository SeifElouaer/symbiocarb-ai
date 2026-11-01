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
  ambientTempC?: number;        // TGBT ambient temp in Tunisian summer (default 42°C)
  thdUPercent?: number;         // Total Harmonic Distortion Voltage (IEEE 519 limit 5%)
  thdIPercent?: number;         // Total Harmonic Distortion Current
}

export function solveCosPhiCompensation(input: CosPhiInput): CosPhiResult {
  const currentCosPhi = Math.max(0.5, Math.min(0.99, input.currentCosPhi));
  const targetCosPhi = Math.max(currentCosPhi + 0.01, Math.min(0.99, input.targetCosPhi ?? 0.950));
  const ambientTemp = input.ambientTempC ?? 42;
  const thdU = input.thdUPercent ?? (input.hasHarmonicLoads ? 6.2 : 2.8);
  const thdI = input.thdIPercent ?? (input.hasHarmonicLoads ? 24.5 : 9.0);

  // Compute tan(φ) = sqrt(1 - cos²φ) / cosφ
  const currentTanPhi = Math.sqrt(1 - currentCosPhi * currentCosPhi) / currentCosPhi;
  const targetTanPhi = Math.sqrt(1 - targetCosPhi * targetCosPhi) / targetCosPhi;

  // Exact required reactive compensation: Qc = P * (tan φ1 - tan φ2)
  const exactQcKvar = input.activePowerKw * (currentTanPhi - targetTanPhi);

  // Step 1: Base compensation step (multiples of 25 kVAR)
  const baseRequiredQcKvar = Math.max(25, Math.ceil(exactQcKvar / 25) * 25);

  // Step 2: Ambient temperature derating factor (IEC 60831 standard for tropical/arid zones)
  // At > 40°C in electrical rooms, capacitors experience dielectric stress; derate or upsize by 15-20%
  let ambientDeratingFactor = 1.0;
  if (ambientTemp > 45) {
    ambientDeratingFactor = 1.25; // 25% thermal derating allowance
  } else if (ambientTemp > 38) {
    ambientDeratingFactor = 1.15; // 15% allowance
  }

  // Nominal installed Qc with thermal derating
  const nominalQcWithDeratingKvar = Math.ceil((baseRequiredQcKvar * ambientDeratingFactor) / 25) * 25;

  // Step 3: Harmonic analysis & detuned reactor requirement (189 Hz / 7%)
  const antiHarmonicReactorRecommended = input.hasHarmonicLoads || thdU > 5.0 || thdI > 15.0 || currentCosPhi < 0.78;
  const resonanceRiskWarning = (thdU > 5.0 || currentCosPhi < 0.75) && !antiHarmonicReactorRecommended;
  
  let harmonicOrderRisk = 'Faible (Réseau linéaire)';
  if (thdI > 20.0 || thdU > 5.0) {
    harmonicOrderRisk = 'Élevé : Risque d\'amplification des rangs 5 (250 Hz) et 7 (350 Hz)';
  } else if (thdI > 12.0) {
    harmonicOrderRisk = 'Modéré : Risque de surcharge harmonique sur condensateurs standards';
  }

  // Joule loss reduction: deltaP / P = 1 - (cos φ1 / cos φ2)²
  // Typically cable & transformer losses account for 2.5% of total industrial energy
  const lossReductionRatio = Math.max(0, 1 - Math.pow(currentCosPhi / targetCosPhi, 2));
  const jouleLossesReducedKwh = input.annualActiveKwh * 0.025 * lossReductionRatio;
  const jouleSavingsTnd = jouleLossesReducedKwh * 0.248; // Average MT kWh price

  // Total annual financial savings
  const annualPenaltySavedTnd = input.annualReactivePenaltyTnd;
  const totalAnnualGainTnd = annualPenaltySavedTnd + jouleSavingsTnd;

  // Equipment CAPEX (with reinforced 525V capacitors and 189 Hz detuned reactors if harmonics present):
  // Standard capacitor bank: ~85 TND/kVAR
  // Detuned capacitor bank with anti-harmonic reactor (189 Hz / 7% p-factor): ~140 TND/kVAR
  const unitCostPerKvar = antiHarmonicReactorRecommended ? 140 : 85;
  const estimatedCapexTnd = nominalQcWithDeratingKvar * unitCostPerKvar + 2200; // +2200 TND installation, MCCB, contactors

  // Payback period
  const paybackPeriodMonths = totalAnnualGainTnd > 0
    ? Number(((estimatedCapexTnd / totalAnnualGainTnd) * 12).toFixed(1))
    : 99.9;

  return {
    currentCosPhi: Number(currentCosPhi.toFixed(3)),
    targetCosPhi: Number(targetCosPhi.toFixed(3)),
    currentTanPhi: Number(currentTanPhi.toFixed(3)),
    targetTanPhi: Number(targetTanPhi.toFixed(3)),
    requiredQcKvar: baseRequiredQcKvar,
    nominalQcWithDeratingKvar,
    ambientDeratingFactor: Number(ambientDeratingFactor.toFixed(2)),
    thdUPercent: Number(thdU.toFixed(1)),
    thdIPercent: Number(thdI.toFixed(1)),
    harmonicOrderRisk,
    annualPenaltySavedTnd: Number(annualPenaltySavedTnd.toFixed(2)),
    jouleLossesReducedKwh: Math.round(jouleLossesReducedKwh),
    jouleSavingsTnd: Number(jouleSavingsTnd.toFixed(2)),
    totalAnnualGainTnd: Number(totalAnnualGainTnd.toFixed(2)),
    estimatedCapexTnd: Math.round(estimatedCapexTnd),
    paybackPeriodMonths,
    resonanceRiskWarning,
    antiHarmonicReactorRecommended,
  };
}

