// ==============================================================================
// STEG Peak Load Shifting & Flexible Energy Optimization Solver
// Optimizes rescheduling flexible industrial batches (crushing, milling, chillers)
// from expensive Pointe hours (0.412 TND) to off-peak Nuit hours (0.188 TND)
// ==============================================================================

import { LoadShiftingResult } from '@/types';
import { STEG_MT_RATES } from './steg-tariffs';

export interface LoadShiftingInput {
  currentPointeKwh: number;        // Current monthly kWh during Pointe
  flexibleCapacityPct: number;     // 10% - 60% of loads can be rescheduled
  targetSlot?: 'nuit' | 'jour';    // Target destination (default 'nuit')
}

export function solveLoadShifting(input: LoadShiftingInput): LoadShiftingResult {
  const { currentPointeKwh, flexibleCapacityPct, targetSlot = 'nuit' } = input;

  const validPct = Math.max(0, Math.min(80, flexibleCapacityPct));
  const shiftedKwhFromPointe = (currentPointeKwh * validPct) / 100;

  // Rate delta: Pointe (0.412) vs Nuit (0.188) or Jour (0.248)
  const targetRate = targetSlot === 'nuit' ? STEG_MT_RATES.TARIF_NUIT : STEG_MT_RATES.TARIF_JOUR;
  const rateDeltaTnd = STEG_MT_RATES.TARIF_POINTE - targetRate; // e.g. 0.224 TND / kWh

  // Bill savings
  const monthlyBillSavingsTnd = shiftedKwhFromPointe * rateDeltaTnd;
  const annualBillSavingsTnd = monthlyBillSavingsTnd * 12;

  // Peak grid carbon avoidance:
  // At peak hours, STEG starts open-cycle gas turbines (peakers) with higher emissions (~0.580 kg/kWh)
  // Base night load uses efficient combined-cycle plants (~0.430 kg/kWh)
  const peakAvoidedEfDelta = 0.150; // kgCO2e / kWh
  const avoidedGridCarbonKg = shiftedKwhFromPointe * peakAvoidedEfDelta * 12;

  const newPointeLoadKwh = currentPointeKwh - shiftedKwhFromPointe;

  return {
    shiftedKwhFromPointe: Math.round(shiftedKwhFromPointe),
    monthlyBillSavingsTnd: Number(monthlyBillSavingsTnd.toFixed(2)),
    annualBillSavingsTnd: Number(annualBillSavingsTnd.toFixed(2)),
    avoidedGridCarbonKg: Math.round(avoidedGridCarbonKg),
    newPointeLoadKwh: Math.round(newPointeLoadKwh),
  };
}

