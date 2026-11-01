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
}

export const BIOCLAIRA_CONSTANTS = {
  // Market values in Tunisian Dinars (TND)
  PRIX_MARCHE_CHARBON_ACTIF_TND_TONNE: 7500.0, // Replacing imported AC at 6,500 - 9,000 TND/t
  PRIX_MARCHE_BIOCHAR_AMENDEMENT_TND_TONNE: 1200.0,
  PRIX_MARCHE_BIOCOMBUSTIBLE_TND_TONNE: 480.0, // Biomass fuel pellets
  
  // OPEX per ton of raw biomass processed in Tunisia
  OPEX_PYROLYSE_ACTIVATION_TND_TONNE: 780.0, // Electricity, labor, inert gas (N2), steam
  
  // Carbon Factors (tCO2e per ton)
  EF_DECHARGE_METHANE_AGRO: 0.820,       // Methane avoided per ton of diverted wet waste
  EF_CHARBON_ACTIF_FOSSILE_IMPORTE: 4.200, // Imported coal/lignite-based AC lifecycle
  EF_PYROLYSE_LOCALE_BIOMASSE: 0.650,    // Local renewable pyrolysis emissions
};

export function simulateBioClairaValorization(input: BioClairaInput): BioClairaSimulationResult {
  const {
    wasteType,
    rawTonnage,
    moisturePct = wasteType === 'date_pits' ? 12.0 : wasteType === 'olive_pomace' ? 45.0 : 10.0,
    pyrolysisTempC = 650,
    activationMethod = 'steam',
  } = input;

  // 1. Dry matter calculation
  const dryTonnage = rawTonnage * (1 - moisturePct / 100);

  // 2. Thermochemical Yields depending on biomass substrate
  let activatedCarbonYieldPct = 0;
  let biocharYieldPct = 0;
  let syngasMwhPerTon = 0;
  let estimatedBetSurfaceAreaM2g = 0;
  let iodineNumberMgG = 0;
  let marketPricePerTonTnd = BIOCLAIRA_CONSTANTS.PRIX_MARCHE_CHARBON_ACTIF_TND_TONNE;

  if (wasteType === 'date_pits') {
    // Deglet Nour date pits have high lignin content (~35%) and compact microporosity
    // Optimal activation (H3PO4 or steam at 650-750°C) produces high-grade microporous AC
    const tempFactor = (pyrolysisTempC - 450) / 400; // 0 to 1
    
    if (activationMethod === 'h3po4') {
      activatedCarbonYieldPct = 34.0 - tempFactor * 4.0; // 30% - 34%
      estimatedBetSurfaceAreaM2g = 1150 + tempFactor * 300; // 1,150 - 1,450 m²/g
      iodineNumberMgG = 950 + tempFactor * 250; // 950 - 1,200 mg/g
    } else {
      // Steam physical activation
      activatedCarbonYieldPct = 29.0 - tempFactor * 3.5; // 25.5% - 29%
      estimatedBetSurfaceAreaM2g = 850 + tempFactor * 280; // 850 - 1,130 m²/g
      iodineNumberMgG = 820 + tempFactor * 220; // 820 - 1,040 mg/g
    }
    
    biocharYieldPct = 0; // All directed to AC
    syngasMwhPerTon = 1.45; // Syngas recycled for reactor self-heating
    marketPricePerTonTnd = BIOCLAIRA_CONSTANTS.PRIX_MARCHE_CHARBON_ACTIF_TND_TONNE;
  } else if (wasteType === 'olive_pomace') {
    // Olive grignons: suitable for Biochar agricultural amendment or biomass briquettes
    activatedCarbonYieldPct = 14.0;
    biocharYieldPct = 28.0;
    syngasMwhPerTon = 1.10;
    estimatedBetSurfaceAreaM2g = 620;
    iodineNumberMgG = 580;
    marketPricePerTonTnd = BIOCLAIRA_CONSTANTS.PRIX_MARCHE_BIOCHAR_AMENDEMENT_TND_TONNE;
  } else {
    // Other scrap/materials
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

  // 4. Financial Economics in TND
  const grossMarketValueTnd = activatedCarbonTons * marketPricePerTonTnd + biocharTons * BIOCLAIRA_CONSTANTS.PRIX_MARCHE_BIOCHAR_AMENDEMENT_TND_TONNE;
  const estimatedAnnualOpexTnd = rawTonnage * BIOCLAIRA_CONSTANTS.OPEX_PYROLYSE_ACTIVATION_TND_TONNE;
  const netAnnualProfitTnd = Math.max(0, grossMarketValueTnd - estimatedAnnualOpexTnd);

  // 5. Environmental Carbon Impact (avoided emissions)
  // Methane avoided from rotting biomass in open air or landfill
  const avoidedMethaneTco2e = rawTonnage * BIOCLAIRA_CONSTANTS.EF_DECHARGE_METHANE_AGRO;
  
  // Substitution of imported fossil coal-based activated carbon
  const substitutedFossilCarbonTco2e = activatedCarbonTons * (
    BIOCLAIRA_CONSTANTS.EF_CHARBON_ACTIF_FOSSILE_IMPORTE - BIOCLAIRA_CONSTANTS.EF_PYROLYSE_LOCALE_BIOMASSE
  );

  const netAvoidedTco2e = avoidedMethaneTco2e + substitutedFossilCarbonTco2e;

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
    grossMarketValueTnd: Math.round(grossMarketValueTnd),
    marketPricePerTonTnd,
    estimatedAnnualOpexTnd: Math.round(estimatedAnnualOpexTnd),
    netAnnualProfitTnd: Math.round(netAnnualProfitTnd),
    avoidedMethaneTco2e: Math.round(avoidedMethaneTco2e),
    substitutedFossilCarbonTco2e: Math.round(substitutedFossilCarbonTco2e),
    netAvoidedTco2e: Math.round(netAvoidedTco2e),
  };
}

