// ==============================================================================
// BioClaira Physico-Chemical Pyrolysis & Circular Valorization Simulator
// Models conversion of Tunisian agro-waste (Date pits, Olive pomace, Margines)
// into High-Value Activated Carbon, Biochar, and Energy
// ==============================================================================

import { BioClairaSimulationResult } from '@/types';

export interface BioClairaInput {
  wasteType: 'date_pits' | 'olive_pomace' | 'margines' | 'metal_shavings' | 'hdpe_plastic';
  rawTonnage: number;            // Metric tons per year
  moisturePct?: number;          // % water content
  pyrolysisTempC?: number;       // 450°C - 850°C (Default: 650°C for date pits)
  activationMethod?: 'steam' | 'h3po4' | 'koh'; // Physical or Chemical activation
  transportDistanceKm?: number;  // Supply chain transport distance (km)
  discountRatePct?: number;      // WACC for NPV calculation (default 8.5%)
}

export const BIOCLAIRA_CONSTANTS = {
  // Market values in Tunisian Dinars (TND)
  PRIX_MARCHE_CHARBON_ACTIF_TND_TONNE: 7500.0, // Replacing imported AC at 6,500 - 9,000 TND/t
  PRIX_MARCHE_BIOCHAR_AMENDEMENT_TND_TONNE: 1200.0,
  PRIX_MARCHE_BIOCOMBUSTIBLE_TND_TONNE: 480.0, // Biomass fuel pellets
  
  // Baseline OPEX per ton of raw biomass processed in Tunisia
  OPEX_PYROLYSE_ACTIVATION_TND_TONNE: 780.0, // Electricity, labor, inert gas (N2), steam
  
  // Neutralization OPEX for chemical washwater (lime Ca(OH)2 treatment)
  OPEX_EFFLUENT_NEUTRALIZATION_TND_M3: 45.0,
  WASHWATER_M3_PER_TON_AC: 6.0,

  // Carbon Factors (tCO2e per ton)
  EF_DECHARGE_METHANE_AGRO_HUMIDE: 0.820,  // Wet olive pomace / margines in anaerobic lagoons
  EF_DECHARGE_METHANE_AGRO_SEC: 0.220,     // Dry date pits (12% moisture in arid climate)
  EF_CHARBON_ACTIF_FOSSILE_IMPORTE: 4.200, // Imported coal/lignite-based AC lifecycle
  EF_PYROLYSE_LOCALE_BIOMASSE: 0.650,      // Local renewable pyrolysis emissions
  EF_DIESEL_FREIGHT_TCO2E_PER_TKM: 0.000062, // Euro 5 heavy truck (0.062 kgCO2e/t.km)
};

export function simulateBioClairaValorization(input: BioClairaInput): BioClairaSimulationResult {
  const {
    wasteType,
    rawTonnage,
    moisturePct = wasteType === 'date_pits' ? 12.0 : wasteType === 'olive_pomace' ? 45.0 : 10.0,
    pyrolysisTempC = 650,
    activationMethod = 'h3po4',
    transportDistanceKm = 120,
    discountRatePct = 8.5,
  } = input;

  // 1. Dry matter & Pre-drying requirements
  const dryTonnage = rawTonnage * (1 - moisturePct / 100);
  const requiresPreDrying = moisturePct > 20.0;
  const targetMoistureAfterDrying = 12.0;
  
  let dryingThermalMwh = 0;
  if (requiresPreDrying) {
    const waterToEvaporateTons = rawTonnage * Math.max(0, (moisturePct - targetMoistureAfterDrying) / 100);
    dryingThermalMwh = Number((waterToEvaporateTons * 0.85).toFixed(1)); // 0.85 MWh thermal per ton water
  }

  // 2. Thermochemical Yields & Pore Structure (with high-temperature pore sintering check)
  let activatedCarbonYieldPct = 0;
  let biocharYieldPct = 0;
  let syngasMwhPerTon = 0;
  let estimatedBetSurfaceAreaM2g = 0;
  let iodineNumberMgG = 0;
  let marketPricePerTonTnd = BIOCLAIRA_CONSTANTS.PRIX_MARCHE_CHARBON_ACTIF_TND_TONNE;

  // Sintering warning when temperature exceeds 780°C (micropore collapse)
  const poreSinteringWarning = pyrolysisTempC > 780;
  const tempFactor = (pyrolysisTempC - 450) / 400; // 0 to 1

  if (wasteType === 'date_pits') {
    if (activationMethod === 'h3po4') {
      // Chemical activation
      activatedCarbonYieldPct = 34.0 - tempFactor * 4.0; // 30% - 34%
      // Non-linear peak at 720-750°C; drops if overheated
      const peakFactor = poreSinteringWarning ? Math.max(0.7, 1 - (pyrolysisTempC - 780) * 0.003) : 1.0;
      estimatedBetSurfaceAreaM2g = (1150 + tempFactor * 300) * peakFactor;
      iodineNumberMgG = (950 + tempFactor * 250) * peakFactor;
    } else {
      // Steam physical activation
      activatedCarbonYieldPct = 29.0 - tempFactor * 3.5;
      const peakFactor = poreSinteringWarning ? 0.85 : 1.0;
      estimatedBetSurfaceAreaM2g = (850 + tempFactor * 280) * peakFactor;
      iodineNumberMgG = (820 + tempFactor * 220) * peakFactor;
    }
    
    biocharYieldPct = 0;
    syngasMwhPerTon = 1.45;
    marketPricePerTonTnd = BIOCLAIRA_CONSTANTS.PRIX_MARCHE_CHARBON_ACTIF_TND_TONNE;
  } else if (wasteType === 'olive_pomace') {
    activatedCarbonYieldPct = 14.0;
    biocharYieldPct = 28.0;
    syngasMwhPerTon = 1.10;
    estimatedBetSurfaceAreaM2g = 620;
    iodineNumberMgG = 580;
    marketPricePerTonTnd = BIOCLAIRA_CONSTANTS.PRIX_MARCHE_BIOCHAR_AMENDEMENT_TND_TONNE;
  } else {
    activatedCarbonYieldPct = 20.0;
    biocharYieldPct = 15.0;
    syngasMwhPerTon = 0.8;
    estimatedBetSurfaceAreaM2g = 500;
    iodineNumberMgG = 450;
    marketPricePerTonTnd = 3500.0;
  }

  // 3. Physical Quantities
  const activatedCarbonTons = (dryTonnage * activatedCarbonYieldPct) / 100;
  const biocharTons = (dryTonnage * biocharYieldPct) / 100;
  const syngasBioOilMwh = dryTonnage * syngasMwhPerTon;

  // 4. Acid Effluent Volume & Treatment OPEX
  const acidEffluentVolumeM3 = activationMethod === 'steam' ? 0 : Math.round(activatedCarbonTons * BIOCLAIRA_CONSTANTS.WASHWATER_M3_PER_TON_AC);
  const effluentTreatmentCostTnd = acidEffluentVolumeM3 * BIOCLAIRA_CONSTANTS.OPEX_EFFLUENT_NEUTRALIZATION_TND_M3;

  // 5. Financial Economics (Gross, OPEX & Net Annual Cash Flow)
  const grossMarketValueTnd = activatedCarbonTons * marketPricePerTonTnd + biocharTons * BIOCLAIRA_CONSTANTS.PRIX_MARCHE_BIOCHAR_AMENDEMENT_TND_TONNE;
  const baseOpexTnd = rawTonnage * BIOCLAIRA_CONSTANTS.OPEX_PYROLYSE_ACTIVATION_TND_TONNE;
  const dryingOpexTnd = dryingThermalMwh * 45; // 45 TND/MWh thermal fuel cost
  const estimatedAnnualOpexTnd = baseOpexTnd + dryingOpexTnd + effluentTreatmentCostTnd;
  const netAnnualProfitTnd = Math.max(0, grossMarketValueTnd - estimatedAnnualOpexTnd);

  // 6. Realistic Industrial CAPEX Sizing & Discounted Cash Flows (NPV / IRR / Payback)
  // Scaling law: Cost = Cost_base * (Tonnage / 600)^0.65
  const scale = Math.pow(Math.max(100, rawTonnage) / 600, 0.65);
  let baseModularCapex = 1100000; // Rotary pyrolysis kiln & controls
  if (requiresPreDrying) baseModularCapex += 220000; // Rotary dryer
  if (activationMethod !== 'steam') baseModularCapex += 260000; // Acid impregnation & scrubber
  
  const totalCapexTnd = Math.round(baseModularCapex * scale);
  // ANME FTE Investment Grant (20% of equipment, max ceiling 200,000 TND in Tunisia)
  const anmeGrantTnd = Math.min(200000, totalCapexTnd * 0.20);
  const anmeSubsidizedCapexTnd = totalCapexTnd - anmeGrantTnd;

  // 7-year NPV calculation (VAN à WACC 8.5%)
  const r = discountRatePct / 100;
  let npv7YearsTnd = -anmeSubsidizedCapexTnd;
  for (let year = 1; year <= 7; year++) {
    npv7YearsTnd += netAnnualProfitTnd / Math.pow(1 + r, year);
  }
  npv7YearsTnd = Math.round(npv7YearsTnd);

  // Simple Payback in years
  const paybackYears = netAnnualProfitTnd > 0
    ? Number((anmeSubsidizedCapexTnd / netAnnualProfitTnd).toFixed(1))
    : 99.0;

  // Approximate IRR (TRI)
  let irrPercent = 0;
  if (netAnnualProfitTnd > 0 && anmeSubsidizedCapexTnd > 0) {
    const rawIrr = (netAnnualProfitTnd / anmeSubsidizedCapexTnd) * 100 - (100 / 7);
    irrPercent = Number(Math.max(0, Math.min(85, rawIrr)).toFixed(1));
  }

  // 7. Rigorous Carbon Accounting
  // Methane avoidance differentiated by biological moisture
  const methaneEf = wasteType === 'date_pits'
    ? BIOCLAIRA_CONSTANTS.EF_DECHARGE_METHANE_AGRO_SEC
    : BIOCLAIRA_CONSTANTS.EF_DECHARGE_METHANE_AGRO_HUMIDE;

  const avoidedMethaneTco2e = rawTonnage * methaneEf;

  // Substitution of imported fossil coal-based activated carbon
  const substitutedFossilCarbonTco2e = activatedCarbonTons * (
    BIOCLAIRA_CONSTANTS.EF_CHARBON_ACTIF_FOSSILE_IMPORTE - BIOCLAIRA_CONSTANTS.EF_PYROLYSE_LOCALE_BIOMASSE
  );

  // Supply chain transport emissions (diesel freight)
  const transportEmissionsTco2e = (rawTonnage * transportDistanceKm * BIOCLAIRA_CONSTANTS.EF_DIESEL_FREIGHT_TCO2E_PER_TKM);

  const netAvoidedTco2e = Math.max(0, avoidedMethaneTco2e + substitutedFossilCarbonTco2e - transportEmissionsTco2e);

  return {
    wasteType,
    rawTonnage,
    moisturePct,
    dryTonnage: Number(dryTonnage.toFixed(1)),
    pyrolysisTempC,
    activationMethod,
    activatedCarbonYieldPct: Number(activatedCarbonYieldPct.toFixed(1)),
    activatedCarbonTons: Number(activatedCarbonTons.toFixed(1)),
    biocharTons: Number(biocharTons.toFixed(1)),
    syngasBioOilMwh: Number(syngasBioOilMwh.toFixed(1)),
    estimatedBetSurfaceAreaM2g: Math.round(estimatedBetSurfaceAreaM2g),
    iodineNumberMgG: Math.round(iodineNumberMgG),
    poreSinteringWarning,
    requiresPreDrying,
    dryingThermalMwh,
    acidEffluentVolumeM3,
    effluentTreatmentCostTnd: Math.round(effluentTreatmentCostTnd),
    transportEmissionsTco2e: Number(transportEmissionsTco2e.toFixed(1)),
    grossMarketValueTnd: Math.round(grossMarketValueTnd),
    marketPricePerTonTnd,
    estimatedAnnualOpexTnd: Math.round(estimatedAnnualOpexTnd),
    netAnnualProfitTnd: Math.round(netAnnualProfitTnd),
    totalCapexTnd,
    anmeSubsidizedCapexTnd,
    npv7YearsTnd,
    irrPercent,
    paybackYears,
    avoidedMethaneTco2e: Math.round(avoidedMethaneTco2e),
    substitutedFossilCarbonTco2e: Math.round(substitutedFossilCarbonTco2e),
    netAvoidedTco2e: Math.round(netAvoidedTco2e),
  };
}

