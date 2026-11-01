// ==============================================================================
// STEG MT/HT Deterministic Tariff Engine (Tunisian Moyenne Tension Postes Horaires)
// Compliant with official Ministère de l'Industrie, des Mines et de l'Énergie decrees
// ==============================================================================

import { StegTariffResult } from '@/types';

export interface StegTariffInput {
  kwhJour: number;
  kwhPointe: number;
  kwhSoir: number;
  kwhNuit: number;
  kvarhTotal: number;
  pSouscriteKva: number;
  pMaxAppeleeKva: number;
}

export const STEG_MT_RATES = {
  // Official rates in TND/kWh (Medium Voltage Postes Horaires)
  TARIF_JOUR: 0.248,
  TARIF_POINTE: 0.412,
  TARIF_SOIR: 0.235,
  TARIF_NUIT: 0.188,
  
  // Power & Overrun
  REDEVANCE_PUISSANCE_PAR_KVA: 3.850, // TND/kVA/month
  PENALITE_DEPASSEMENT_PAR_KVA: 25.000, // TND/kVA over p_souscrite
  
  // Reactive Energy Thresholds
  COS_PHI_REGULATORY_THRESHOLD: 0.850,
  TAN_PHI_REGULATORY_THRESHOLD: 0.620,
  PRIX_KVARH_PENALITE: 0.045, // TND per excess kVARh
  
  // Taxes & Levies
  TAUX_FTR_PAR_KWH: 0.005, // Fonds de Transition Énergétique
  TAUX_TAXE_MUNICIPALE_PAR_KWH: 0.003,
  TAUX_TVA: 0.19, // 19%
  
  // Grid Emission Factor
  GRID_EF_KGCO2E_KWH: 0.473, // ANME / IGES 2024
};

export function calculateStegMtBill(input: StegTariffInput): StegTariffResult {
  const {
    kwhJour,
    kwhPointe,
    kwhSoir,
    kwhNuit,
    kvarhTotal,
    pSouscriteKva,
    pMaxAppeleeKva,
  } = input;

  const totalKwh = kwhJour + kwhPointe + kwhSoir + kwhNuit;

  // 1. Active energy cost across 4 time slots
  const costJourTnd = kwhJour * STEG_MT_RATES.TARIF_JOUR;
  const costPointeTnd = kwhPointe * STEG_MT_RATES.TARIF_POINTE;
  const costSoirTnd = kwhSoir * STEG_MT_RATES.TARIF_SOIR;
  const costNuitTnd = kwhNuit * STEG_MT_RATES.TARIF_NUIT;
  const baseCostTnd = costJourTnd + costPointeTnd + costSoirTnd + costNuitTnd;

  // 2. Fixed subscription power fee
  const redevancePuissanceTnd = pSouscriteKva * STEG_MT_RATES.REDEVANCE_PUISSANCE_PAR_KVA;

  // 3. Power overrun penalty (Dépassement de puissance souscrite)
  const overrunKva = Math.max(0, pMaxAppeleeKva - pSouscriteKva);
  const overrunPenaltyTnd = overrunKva * STEG_MT_RATES.PENALITE_DEPASSEMENT_PAR_KVA;

  // 4. Reactive energy penalty (Redevance d'énergie réactive)
  // In Tunisia, allowed reactive energy is Q_allowed = totalKwh * tan_phi_max (0.62)
  const allowedKvarh = totalKwh * STEG_MT_RATES.TAN_PHI_REGULATORY_THRESHOLD;
  const excessKvarh = Math.max(0, kvarhTotal - allowedKvarh);
  const reactivePenaltyTnd = excessKvarh * STEG_MT_RATES.PRIX_KVARH_PENALITE;

  // 5. Taxes & Contributions
  const ftrTnd = totalKwh * STEG_MT_RATES.TAUX_FTR_PAR_KWH;
  const municipalTaxTnd = totalKwh * STEG_MT_RATES.TAUX_TAXE_MUNICIPALE_PAR_KWH;

  const totalHtTnd = baseCostTnd + redevancePuissanceTnd + overrunPenaltyTnd + reactivePenaltyTnd;
  const tvaTnd = totalHtTnd * STEG_MT_RATES.TAUX_TVA;
  const totalTtcTnd = totalHtTnd + tvaTnd + ftrTnd + municipalTaxTnd;

  // 6. Grid carbon emission calculation
  const co2Tons = (totalKwh * STEG_MT_RATES.GRID_EF_KGCO2E_KWH) / 1000.0;

  return {
    baseCostTnd: Number(baseCostTnd.toFixed(3)),
    costJourTnd: Number(costJourTnd.toFixed(3)),
    costPointeTnd: Number(costPointeTnd.toFixed(3)),
    costSoirTnd: Number(costSoirTnd.toFixed(3)),
    costNuitTnd: Number(costNuitTnd.toFixed(3)),
    redevancePuissanceTnd: Number(redevancePuissanceTnd.toFixed(3)),
    overrunPenaltyTnd: Number(overrunPenaltyTnd.toFixed(3)),
    reactivePenaltyTnd: Number(reactivePenaltyTnd.toFixed(3)),
    ftrTnd: Number(ftrTnd.toFixed(3)),
    municipalTaxTnd: Number(municipalTaxTnd.toFixed(3)),
    tvaTnd: Number(tvaTnd.toFixed(3)),
    totalTtcTnd: Number(totalTtcTnd.toFixed(3)),
    co2Tons: Number(co2Tons.toFixed(2)),
  };
}

