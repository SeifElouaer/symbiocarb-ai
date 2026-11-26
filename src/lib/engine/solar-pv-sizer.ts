// ==============================================================================
// SymbioCarb AI - Industrial Rooftop Solar PV Self-Consumption Sizer
// Sizes PV capacity so annual generation <= 80% of annual Jour-slot demand
// (strict self-consumption, zero grid export assumption), optionally capped by roof area.
// ==============================================================================

import { STEG_GRID_EF_KG_CO2E_PER_KWH } from './cbam-config';
import { STEG_MT_RATES } from './steg-tariffs';

export const SOLAR_PV_CONFIG = {
  // VERIFY: ANME / PVGIS Tunisia industrial rooftop specific yield (kWh / kWp / year)
  DEFAULT_SPECIFIC_YIELD_KWH_PER_KWP_YEAR: 1650,
  // VERIFY: Tunisian commercial & industrial rooftop PV turnkey CAPEX (TND / kWp)
  DEFAULT_CAPEX_TND_PER_KWP: 2800,
  // VERIFY: Annual PV O&M cost as fraction of initial CAPEX (1% / yr)
  ANNUAL_OM_PCT_OF_CAPEX: 0.01,
  // VERIFY: Industrial rooftop area requirement (m² per kWp installed)
  ROOF_AREA_M2_PER_KWP: 6.0,
  // VERIFY: Maximum self-consumption target relative to Jour-slot electricity consumption (80%)
  SELF_CONSUMPTION_JOUR_CAP_RATIO: 0.80,
  // VERIFY: Standard industrial solar PV economic lifetime (years)
  LIFETIME_YEARS: 20,
} as const;

export interface SolarPvInput {
  monthlyJourKwh: number;
  roofAreaM2?: number;
  specificYieldKwhPerKwp?: number;
  capexTndPerKwp?: number;
  jourTariffTndPerKwh?: number;
}

export interface SolarPvSizingResult {
  available: boolean;
  installedKwp: number;
  annualPvKwh: number;
  annualJourKwh: number;
  capexTnd: number;
  grossAnnualSavingTnd: number;
  annualOmCostTnd: number;
  annualNetSavingTnd: number;
  annualTco2eAvoided: number;
  paybackYears: number;
  lifetimeYears: number;
  cappedByRoofArea: boolean;
}

export function sizeRooftopSolarPv(input: SolarPvInput): SolarPvSizingResult {
  const monthlyJourKwh =
    typeof input.monthlyJourKwh === 'number' &&
    Number.isFinite(input.monthlyJourKwh) &&
    input.monthlyJourKwh > 0
      ? input.monthlyJourKwh
      : 0;
  const specificYield =
    typeof input.specificYieldKwhPerKwp === 'number' &&
    Number.isFinite(input.specificYieldKwhPerKwp) &&
    input.specificYieldKwhPerKwp > 0
      ? input.specificYieldKwhPerKwp
      : SOLAR_PV_CONFIG.DEFAULT_SPECIFIC_YIELD_KWH_PER_KWP_YEAR;
  const capexPerKwp =
    typeof input.capexTndPerKwp === 'number' &&
    Number.isFinite(input.capexTndPerKwp) &&
    input.capexTndPerKwp >= 0
      ? input.capexTndPerKwp
      : SOLAR_PV_CONFIG.DEFAULT_CAPEX_TND_PER_KWP;
  const jourTariff =
    typeof input.jourTariffTndPerKwh === 'number' &&
    Number.isFinite(input.jourTariffTndPerKwh) &&
    input.jourTariffTndPerKwh > 0
      ? input.jourTariffTndPerKwh
      : STEG_MT_RATES.TARIF_JOUR;
  const roofAreaM2 =
    typeof input.roofAreaM2 === 'number' && Number.isFinite(input.roofAreaM2) && input.roofAreaM2 > 0
      ? input.roofAreaM2
      : 0;

  if (monthlyJourKwh <= 0) {
    return {
      available: false,
      installedKwp: 0,
      annualPvKwh: 0,
      annualJourKwh: 0,
      capexTnd: 0,
      grossAnnualSavingTnd: 0,
      annualOmCostTnd: 0,
      annualNetSavingTnd: 0,
      annualTco2eAvoided: 0,
      paybackYears: 0,
      lifetimeYears: SOLAR_PV_CONFIG.LIFETIME_YEARS,
      cappedByRoofArea: false,
    };
  }

  const annualJourKwh = monthlyJourKwh * 12;
  const targetMaxPvKwh = annualJourKwh * SOLAR_PV_CONFIG.SELF_CONSUMPTION_JOUR_CAP_RATIO;
  const kwpByLoad = targetMaxPvKwh / specificYield;
  const kwpByRoof =
    roofAreaM2 > 0 ? roofAreaM2 / SOLAR_PV_CONFIG.ROOF_AREA_M2_PER_KWP : Number.POSITIVE_INFINITY;

  const cappedByRoofArea = kwpByRoof < kwpByLoad;
  const installedKwp = Number(Math.max(0, Math.min(kwpByLoad, kwpByRoof)).toFixed(2));
  const annualPvKwh = Math.round(installedKwp * specificYield);
  const capexTnd = Math.round(installedKwp * capexPerKwp);
  const grossAnnualSavingTnd = annualPvKwh * jourTariff;
  const annualOmCostTnd = capexTnd * SOLAR_PV_CONFIG.ANNUAL_OM_PCT_OF_CAPEX;
  const annualNetSavingTnd = Number((grossAnnualSavingTnd - annualOmCostTnd).toFixed(2));

  const gridMinusPvEf =
    STEG_GRID_EF_KG_CO2E_PER_KWH - STEG_MT_RATES.GRID_EF_SOLAR_AUTOCONSUMPTION;
  const annualTco2eAvoided = Number(((annualPvKwh * gridMinusPvEf) / 1000).toFixed(2));

  const paybackYears =
    annualNetSavingTnd > 0 ? Number((capexTnd / annualNetSavingTnd).toFixed(1)) : 99.9;

  return {
    available: installedKwp > 0,
    installedKwp,
    annualPvKwh,
    annualJourKwh,
    capexTnd,
    grossAnnualSavingTnd: Number(grossAnnualSavingTnd.toFixed(2)),
    annualOmCostTnd: Number(annualOmCostTnd.toFixed(2)),
    annualNetSavingTnd,
    annualTco2eAvoided,
    paybackYears,
    lifetimeYears: SOLAR_PV_CONFIG.LIFETIME_YEARS,
    cappedByRoofArea,
  };
}
