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
  requiresNightShiftWorkers?: boolean; // Whether human operators are required during shifted hours
  numberOfNightOperators?: number; // Number of operators on night shift (default 3)
  operatingDaysPerMonth?: number;  // Default 25 days
}

export function solveLoadShifting(input: LoadShiftingInput): LoadShiftingResult {
  const { 
    currentPointeKwh, 
    flexibleCapacityPct, 
    targetSlot = 'nuit',
    requiresNightShiftWorkers = true,
    numberOfNightOperators = 3,
    operatingDaysPerMonth = 25,
  } = input;

  const validPct = Math.max(0, Math.min(80, flexibleCapacityPct));
  const shiftedKwhFromPointe = (currentPointeKwh * validPct) / 100;

  // Rate delta: Pointe (0.412) vs Nuit (0.188) or Jour (0.248)
  const targetRate = targetSlot === 'nuit' ? STEG_MT_RATES.TARIF_NUIT : STEG_MT_RATES.TARIF_JOUR;
  const rateDeltaTnd = STEG_MT_RATES.TARIF_POINTE - targetRate; // e.g. 0.224 TND / kWh

  // Gross energy bill savings
  const monthlyBillSavingsTnd = shiftedKwhFromPointe * rateDeltaTnd;
  const annualBillSavingsTnd = monthlyBillSavingsTnd * 12;

  // HR & Labor Law Cost Adjustments (Tunisian Code du Travail Art. 68-76 & Collective Bargaining):
  // 1. +50% Night shift wage premium: Base SMIG/industrial hourly rate ~4.80 TND/h -> night premium = 2.40 TND/h
  // Assuming 4 shifted hours per night shift
  let additionalLaborNightCostTnd = 0;
  let nightTransportCostTnd = 0;

  if (targetSlot === 'nuit' && requiresNightShiftWorkers && shiftedKwhFromPointe > 0) {
    const nightShiftHours = 4;
    const nightHourlyPremiumTnd = 2.40;
    additionalLaborNightCostTnd = numberOfNightOperators * nightHourlyPremiumTnd * nightShiftHours * operatingDaysPerMonth;
    
    // Obligatory nocturnal employee transport shuttle (navette de nuit): ~45 TND / day
    nightTransportCostTnd = operatingDaysPerMonth * 45;
  }

  // Net True Financial Savings
  const netTrueMonthlyGainTnd = monthlyBillSavingsTnd - additionalLaborNightCostTnd - nightTransportCostTnd;
  const netTrueAnnualGainTnd = netTrueMonthlyGainTnd * 12;
  const isEconomicallyViable = netTrueMonthlyGainTnd > 0;

  let hrFeasibilityNote = 'Viable : Les gains énergétiques dépassent largement les surprimes salariales de nuit.';
  if (!isEconomicallyViable) {
    hrFeasibilityNote = 'Attention : Les coûts sociaux et transport de nuit (Code du Travail) excèdent l\'économie STEG. Privilégier des procédés 100% automatisés sans opérateur.';
  } else if (netTrueMonthlyGainTnd < monthlyBillSavingsTnd * 0.4) {
    hrFeasibilityNote = 'Marge nette réduite : Rentable uniquement si les navettes d\'atelier sont mutualisées avec une équipe existante.';
  }

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
    additionalLaborNightCostTnd: Number(additionalLaborNightCostTnd.toFixed(2)),
    nightTransportCostTnd: Number(nightTransportCostTnd.toFixed(2)),
    netTrueMonthlyGainTnd: Number(netTrueMonthlyGainTnd.toFixed(2)),
    netTrueAnnualGainTnd: Number(netTrueAnnualGainTnd.toFixed(2)),
    isEconomicallyViable,
    hrFeasibilityNote,
  };
}

