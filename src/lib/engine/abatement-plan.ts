// ==============================================================================
// SymbioCarb AI - Marginal Abatement Cost Curve (MACC) & Action Plan Engine
// Deterministic decarbonization ranking across STEG cos phi, load shifting,
// rooftop solar PV, CBAM precursor supplier switching, and BioClaira.
// ==============================================================================

import { Sector } from '@/types';
import {
  BIOCLAIRA_DEFAULT_WACC,
  simulateBioClairaValorization,
} from './bioclaira-simulator';
import {
  CbamReportInput,
  PrecursorMaterial,
  calculateCbamReport,
  resolvePrecursorRelevance,
} from './cbam-calculator';
import { STEG_GRID_EF_KG_CO2E_PER_KWH, deriveCbamSector } from './cbam-config';
import { solveCosPhiCompensation } from './cos-phi-solver';
import { solveLoadShifting } from './load-shifting-lp';
import { sizeRooftopSolarPv } from './solar-pv-sizer';

export type AbatementLeverId =
  | 'cos_phi'
  | 'load_shifting'
  | 'solar_pv'
  | 'precursor_switch'
  | 'bioclaira';

export interface PrecursorSwitchInput {
  alternativeEfTco2ePerTon: number;
  pricePremiumTndPerTon: number;
  alternativeLabel?: string;
}

export interface AbatementPlanInput {
  sector: Sector;
  subscriptionPlan: 'starter' | 'pro' | 'gold';
  // Energy / STEG inputs
  kwhJour: number;
  kwhPointe: number;
  kwhSoir: number;
  kwhNuit: number;
  cosPhi: number;
  reactivePenaltyTnd: number;
  flexibleLoadPct?: number;
  requiresNightShiftWorkers?: boolean;
  // Solar PV options
  solarRoofAreaM2?: number;
  solarYieldKwhPerKwp?: number;
  solarCapexTndPerKwp?: number;
  // CBAM / BOM inputs
  exportCnCode: string;
  exportProductName?: string;
  annualProductionTons: number;
  annualExportTons?: number;
  naturalGasM3?: number;
  heavyFuelTons?: number;
  dieselLiters?: number;
  bomMaterials: (PrecursorMaterial & { id: string })[];
  precursorSwitches?: Record<string, PrecursorSwitchInput>;
  cbamReportingYear?: number;
  cbamCertificatePriceEur?: number;
  carbonPricePaidAbroadEur?: number;
  // BioClaira waste inputs
  wasteType: 'olive_pomace' | 'date_pits' | 'olive_mill_wastewater' | 'metal_scrap' | 'plastic_scrap';
  wasteMonthlyTons: number;
  moisturePercent?: number;
  // Optional WACC override (defaults to BIOCLAIRA_DEFAULT_WACC = 0.085)
  waccRate?: number;
}

export interface AbatementLeverResult {
  id: AbatementLeverId;
  labelKey: string;
  annualTco2eAvoided: number;
  capexTnd: number;
  annualNetSavingTnd: number;
  lifetimeYears: number;
  costPerTco2Tnd: number;
  reducesCbamLiability: boolean;
  cbamTco2eAvoided: number;
  assumptions: string[];
  available: boolean;
  missingInputs: string[];
  isFinancialOnly: boolean;
  paybackYears: number | null;
}

export interface AbatementPlanResult {
  hasAnyAvailableLever: boolean;
  waccRate: number;
  levers: AbatementLeverResult[];
  curveLevers: AbatementLeverResult[];
  financialOnlyLevers: AbatementLeverResult[];
  unavailableLevers: AbatementLeverResult[];
  totalFootprintAvoidedTco2e: number;
  totalCbamAvoidedTco2e: number;
  totalAnnualNetSavingTnd: number;
  totalCapexTnd: number;
  cbamLiabilityBeforeEur: number;
  cbamLiabilityAfterEur: number;
  cbamAnnualSavedEur: number;
  reportingYear: number;
}

/**
 * Capital Recovery Factor: CRF(r, n) = r(1 + r)^n / ((1 + r)^n - 1).
 */
export function computeCrf(rate: number, lifetimeYears: number): number {
  if (!Number.isFinite(lifetimeYears) || lifetimeYears <= 0) return 1;
  if (!Number.isFinite(rate) || rate <= 0) return 1 / lifetimeYears;
  const factor = Math.pow(1 + rate, lifetimeYears);
  return (rate * factor) / (factor - 1);
}

export function computeAbatementCostPerTonne(
  capexTnd: number,
  annualNetSavingTnd: number,
  annualTco2eAvoided: number,
  lifetimeYears: number,
  waccRate: number = BIOCLAIRA_DEFAULT_WACC
): number {
  if (annualTco2eAvoided <= 0 || !Number.isFinite(annualTco2eAvoided)) return 0;
  const crf = computeCrf(waccRate, lifetimeYears);
  const annualisedCost = capexTnd * crf - annualNetSavingTnd;
  return Number((annualisedCost / annualTco2eAvoided).toFixed(2));
}

export function buildAbatementPlan(input: AbatementPlanInput): AbatementPlanResult {
  const waccRate =
    typeof input.waccRate === 'number' && Number.isFinite(input.waccRate) && input.waccRate >= 0
      ? input.waccRate
      : BIOCLAIRA_DEFAULT_WACC;
  const reportingYear =
    typeof input.cbamReportingYear === 'number' && Number.isFinite(input.cbamReportingYear)
      ? Math.trunc(input.cbamReportingYear)
      : 2026;

  const kwhJour = Math.max(0, input.kwhJour || 0);
  const kwhPointe = Math.max(0, input.kwhPointe || 0);
  const kwhSoir = Math.max(0, input.kwhSoir || 0);
  const kwhNuit = Math.max(0, input.kwhNuit || 0);
  const kwhTotal = kwhJour + kwhPointe + kwhSoir + kwhNuit;

  const sectorInfo = deriveCbamSector(input.exportCnCode || '');
  const indirectCountsInCbam =
    sectorInfo.isInCbamScope && sectorInfo.indirectEmissionsIncluded;

  const levers: AbatementLeverResult[] = [];
  let avoidedCbamElectricityKwhEquivalent = 0;
  let avoidedCbamPrecursorsTco2e = 0;

  // --------------------------------------------------------------------------
  // 1. cos phi Compensation (Life 10 yrs)
  // --------------------------------------------------------------------------
  const cosPhiMissing: string[] = [];
  if (kwhTotal <= 0) cosPhiMissing.push('stegConsumptionKwh');
  if (!input.cosPhi || input.cosPhi <= 0) cosPhiMissing.push('cosPhi');
  else if (input.cosPhi >= 0.95) cosPhiMissing.push('cosPhiAlreadyOptimal');

  if (cosPhiMissing.length === 0) {
    const activePowerKw = Math.max(1, (kwhJour + kwhPointe) / 300);
    const cosPhiRes = solveCosPhiCompensation({
      activePowerKw,
      currentCosPhi: Math.min(0.99, Math.max(0.5, input.cosPhi)),
      targetCosPhi: 0.95,
      annualActiveKwh: kwhTotal * 12,
      annualReactivePenaltyTnd: Math.max(0, input.reactivePenaltyTnd || 0) * 12,
      hasHarmonicLoads: input.sector === 'metal_mechanics',
    });

    const annualTco2eAvoided = Number(
      ((cosPhiRes.jouleLossesReducedKwh * STEG_GRID_EF_KG_CO2E_PER_KWH) / 1000).toFixed(2)
    );
    const capexTnd = cosPhiRes.estimatedCapexTnd;
    const annualNetSavingTnd = Number(cosPhiRes.totalAnnualGainTnd.toFixed(2));
    const lifetimeYears = 10;
    const isFinancialOnly = annualTco2eAvoided <= 0;
    const cbamTco2eAvoided =
      !isFinancialOnly && indirectCountsInCbam ? annualTco2eAvoided : 0;
    if (indirectCountsInCbam && annualTco2eAvoided > 0) {
      avoidedCbamElectricityKwhEquivalent += cosPhiRes.jouleLossesReducedKwh;
    }

    levers.push({
      id: 'cos_phi',
      labelKey: 'cosPhi',
      annualTco2eAvoided,
      capexTnd,
      annualNetSavingTnd,
      lifetimeYears,
      costPerTco2Tnd: isFinancialOnly
        ? 0
        : computeAbatementCostPerTonne(
            capexTnd,
            annualNetSavingTnd,
            annualTco2eAvoided,
            lifetimeYears,
            waccRate
          ),
      reducesCbamLiability: indirectCountsInCbam,
      cbamTco2eAvoided,
      assumptions: [
        `Capacitor bank ${cosPhiRes.nominalQcWithDeratingKvar} kVAR (target cos φ 0.95)`,
        `Joule losses avoided: ${cosPhiRes.jouleLossesReducedKwh.toLocaleString()} kWh/yr × ${STEG_GRID_EF_KG_CO2E_PER_KWH} kgCO₂e/kWh`,
        `CAPEX: ${capexTnd.toLocaleString()} TND, lifetime ${lifetimeYears} yrs, WACC ${(waccRate * 100).toFixed(1)}%`,
      ],
      available: true,
      missingInputs: [],
      isFinancialOnly,
      paybackYears:
        annualNetSavingTnd > 0 ? Number((capexTnd / annualNetSavingTnd).toFixed(1)) : null,
    });
  } else {
    levers.push({
      id: 'cos_phi',
      labelKey: 'cosPhi',
      annualTco2eAvoided: 0,
      capexTnd: 0,
      annualNetSavingTnd: 0,
      lifetimeYears: 10,
      costPerTco2Tnd: 0,
      reducesCbamLiability: indirectCountsInCbam,
      cbamTco2eAvoided: 0,
      assumptions: [],
      available: false,
      missingInputs: cosPhiMissing,
      isFinancialOnly: false,
      paybackYears: null,
    });
  }

  // --------------------------------------------------------------------------
  // 2. Pointe -> Nuit Load Shifting (CAPEX 0, Life 1 yr)
  // --------------------------------------------------------------------------
  const shiftMissing: string[] = [];
  if (kwhPointe <= 0) shiftMissing.push('kwhPointe');

  if (shiftMissing.length === 0) {
    const flexPct =
      typeof input.flexibleLoadPct === 'number' && Number.isFinite(input.flexibleLoadPct)
        ? input.flexibleLoadPct
        : 25;
    const shiftRes = solveLoadShifting({
      currentPointeKwh: kwhPointe,
      flexibleCapacityPct: flexPct,
      targetSlot: 'nuit',
      requiresNightShiftWorkers: input.requiresNightShiftWorkers ?? true,
    });

    const annualTco2eAvoided = Number((shiftRes.avoidedGridCarbonKg / 1000).toFixed(2));
    const capexTnd = 0;
    const annualNetSavingTnd = shiftRes.netTrueAnnualGainTnd;
    const lifetimeYears = 1;
    const isFinancialOnly = annualTco2eAvoided <= 0;
    const cbamTco2eAvoided =
      !isFinancialOnly && indirectCountsInCbam ? annualTco2eAvoided : 0;

    if (indirectCountsInCbam && annualTco2eAvoided > 0) {
      avoidedCbamElectricityKwhEquivalent +=
        (shiftRes.avoidedGridCarbonKg / STEG_GRID_EF_KG_CO2E_PER_KWH);
    }

    levers.push({
      id: 'load_shifting',
      labelKey: 'loadShifting',
      annualTco2eAvoided,
      capexTnd,
      annualNetSavingTnd,
      lifetimeYears,
      costPerTco2Tnd: isFinancialOnly
        ? 0
        : computeAbatementCostPerTonne(
            capexTnd,
            annualNetSavingTnd,
            annualTco2eAvoided,
            lifetimeYears,
            waccRate
          ),
      reducesCbamLiability: indirectCountsInCbam,
      cbamTco2eAvoided,
      assumptions: [
        `${flexPct}% flexible Pointe load shifted (${shiftRes.shiftedKwhFromPointe.toLocaleString()} kWh/month)`,
        `Marginal grid emission delta: 0.150 kgCO₂e/kWh (peaker vs combined cycle)`,
        `Includes Tunisian Code du Travail night premium & shuttle costs`,
      ],
      available: true,
      missingInputs: [],
      isFinancialOnly,
      paybackYears: annualNetSavingTnd > 0 ? 0 : null,
    });
  } else {
    levers.push({
      id: 'load_shifting',
      labelKey: 'loadShifting',
      annualTco2eAvoided: 0,
      capexTnd: 0,
      annualNetSavingTnd: 0,
      lifetimeYears: 1,
      costPerTco2Tnd: 0,
      reducesCbamLiability: indirectCountsInCbam,
      cbamTco2eAvoided: 0,
      assumptions: [],
      available: false,
      missingInputs: shiftMissing,
      isFinancialOnly: false,
      paybackYears: null,
    });
  }

  // --------------------------------------------------------------------------
  // 3. Rooftop Solar Self-Consumption (Life 20 yrs)
  // --------------------------------------------------------------------------
  if (kwhJour > 0) {
    const pv = sizeRooftopSolarPv({
      monthlyJourKwh: kwhJour,
      roofAreaM2: input.solarRoofAreaM2,
      specificYieldKwhPerKwp: input.solarYieldKwhPerKwp,
      capexTndPerKwp: input.solarCapexTndPerKwp,
    });

    const isFinancialOnly = pv.annualTco2eAvoided <= 0;
    const cbamTco2eAvoided =
      !isFinancialOnly && indirectCountsInCbam ? pv.annualTco2eAvoided : 0;
    if (indirectCountsInCbam && pv.annualTco2eAvoided > 0) {
      avoidedCbamElectricityKwhEquivalent += pv.annualPvKwh;
    }

    levers.push({
      id: 'solar_pv',
      labelKey: 'solarPv',
      annualTco2eAvoided: pv.annualTco2eAvoided,
      capexTnd: pv.capexTnd,
      annualNetSavingTnd: pv.annualNetSavingTnd,
      lifetimeYears: pv.lifetimeYears,
      costPerTco2Tnd: isFinancialOnly
        ? 0
        : computeAbatementCostPerTonne(
            pv.capexTnd,
            pv.annualNetSavingTnd,
            pv.annualTco2eAvoided,
            pv.lifetimeYears,
            waccRate
          ),
      reducesCbamLiability: indirectCountsInCbam,
      cbamTco2eAvoided,
      assumptions: [
        `Sized at ${pv.installedKwp} kWp (<= 80% of annual Jour demand${pv.cappedByRoofArea ? `, capped by ${input.solarRoofAreaM2} m² roof` : ''})`,
        `Output ${pv.annualPvKwh.toLocaleString()} kWh/yr × (0.473 − 0.045) kgCO₂e/kWh`,
        `Jour tariff saving 0.248 TND/kWh minus 1%/yr O&M, lifetime 20 yrs`,
      ],
      available: true,
      missingInputs: [],
      isFinancialOnly,
      paybackYears: pv.paybackYears,
    });
  } else {
    levers.push({
      id: 'solar_pv',
      labelKey: 'solarPv',
      annualTco2eAvoided: 0,
      capexTnd: 0,
      annualNetSavingTnd: 0,
      lifetimeYears: 20,
      costPerTco2Tnd: 0,
      reducesCbamLiability: indirectCountsInCbam,
      cbamTco2eAvoided: 0,
      assumptions: [],
      available: false,
      missingInputs: ['kwhJour'],
      isFinancialOnly: false,
      paybackYears: null,
    });
  }

  // --------------------------------------------------------------------------
  // 4. Low-Carbon Precursor Supplier Switch (Life 1 yr, reduces CBAM)
  // --------------------------------------------------------------------------
  const cbamBomItems = (input.bomMaterials || []).filter((item) =>
    resolvePrecursorRelevance(item)
  );
  const switches = input.precursorSwitches || {};
  const configuredSwitches = cbamBomItems.filter((item) => {
    const sw = switches[item.id];
    return sw && typeof sw.alternativeEfTco2ePerTon === 'number' && sw.alternativeEfTco2ePerTon >= 0;
  });

  if (cbamBomItems.length === 0) {
    levers.push({
      id: 'precursor_switch',
      labelKey: 'precursorSwitch',
      annualTco2eAvoided: 0,
      capexTnd: 0,
      annualNetSavingTnd: 0,
      lifetimeYears: 1,
      costPerTco2Tnd: 0,
      reducesCbamLiability: sectorInfo.isInCbamScope,
      cbamTco2eAvoided: 0,
      assumptions: [],
      available: false,
      missingInputs: ['cbamPrecursorBom'],
      isFinancialOnly: false,
      paybackYears: null,
    });
  } else if (configuredSwitches.length === 0) {
    levers.push({
      id: 'precursor_switch',
      labelKey: 'precursorSwitch',
      annualTco2eAvoided: 0,
      capexTnd: 0,
      annualNetSavingTnd: 0,
      lifetimeYears: 1,
      costPerTco2Tnd: 0,
      reducesCbamLiability: sectorInfo.isInCbamScope,
      cbamTco2eAvoided: 0,
      assumptions: [],
      available: false,
      missingInputs: ['alternativeSupplierEf'],
      isFinancialOnly: false,
      paybackYears: null,
    });
  } else {
    let totalPrecursorCo2Avoided = 0;
    let totalAnnualNetSaving = 0;
    const assumptionLines: string[] = [];

    for (const item of configuredSwitches) {
      const sw = switches[item.id];
      const deltaEf = item.efTco2ePerTon - sw.alternativeEfTco2ePerTon;
      const avoided = item.quantityTons * deltaEf;
      const netSaving = -sw.pricePremiumTndPerTon * item.quantityTons;
      totalPrecursorCo2Avoided += avoided;
      totalAnnualNetSaving += netSaving;
      assumptionLines.push(
        `${item.name}: ${item.quantityTons} t × (${item.efTco2ePerTon} → ${sw.alternativeEfTco2ePerTon} tCO₂e/t), premium ${sw.pricePremiumTndPerTon} TND/t`
      );
    }

    const annualTco2eAvoided = Number(totalPrecursorCo2Avoided.toFixed(2));
    const annualNetSavingTnd = Number(totalAnnualNetSaving.toFixed(2));
    const isFinancialOnly = annualTco2eAvoided <= 0;
    const cbamTco2eAvoided =
      !isFinancialOnly && sectorInfo.isInCbamScope ? annualTco2eAvoided : 0;
    if (cbamTco2eAvoided > 0) {
      avoidedCbamPrecursorsTco2e += cbamTco2eAvoided;
    }

    levers.push({
      id: 'precursor_switch',
      labelKey: 'precursorSwitch',
      annualTco2eAvoided,
      capexTnd: 0,
      annualNetSavingTnd,
      lifetimeYears: 1,
      costPerTco2Tnd: isFinancialOnly
        ? 0
        : computeAbatementCostPerTonne(
            0,
            annualNetSavingTnd,
            annualTco2eAvoided,
            1,
            waccRate
          ),
      reducesCbamLiability: sectorInfo.isInCbamScope,
      cbamTco2eAvoided,
      assumptions: assumptionLines,
      available: true,
      missingInputs: [],
      isFinancialOnly,
      paybackYears: annualNetSavingTnd > 0 ? 0 : null,
    });
  }

  // --------------------------------------------------------------------------
  // 5. BioClaira Valorisation (Gold Plan + waste data, reducesCbamLiability: false)
  // --------------------------------------------------------------------------
  const bioMissing: string[] = [];
  if (input.subscriptionPlan !== 'gold') bioMissing.push('goldPlanRequired');
  if (!input.wasteMonthlyTons || input.wasteMonthlyTons <= 0) bioMissing.push('wasteMonthlyTons');

  if (bioMissing.length === 0) {
    const feedstockMap: Record<
      AbatementPlanInput['wasteType'],
      'olive_pomace' | 'date_pits' | 'margines' | 'metal_shavings' | 'hdpe_plastic'
    > = {
      olive_pomace: 'olive_pomace',
      date_pits: 'date_pits',
      olive_mill_wastewater: 'margines',
      metal_scrap: 'metal_shavings',
      plastic_scrap: 'hdpe_plastic',
    };
    const bioRes = simulateBioClairaValorization({
      wasteType: feedstockMap[input.wasteType] || 'olive_pomace',
      rawTonnage: input.wasteMonthlyTons * 12,
      moisturePct: input.moisturePercent && input.moisturePercent > 0 ? input.moisturePercent : undefined,
      discountRatePct: waccRate * 100,
    });

    const annualTco2eAvoided = bioRes.netAvoidedTco2e;
    const capexTnd = bioRes.anmeSubsidizedCapexTnd;
    const annualNetSavingTnd = bioRes.netAnnualProfitTnd;
    const lifetimeYears = 7;
    const isFinancialOnly = annualTco2eAvoided <= 0;

    levers.push({
      id: 'bioclaira',
      labelKey: 'bioclaira',
      annualTco2eAvoided,
      capexTnd,
      annualNetSavingTnd,
      lifetimeYears,
      costPerTco2Tnd: isFinancialOnly
        ? 0
        : computeAbatementCostPerTonne(
            capexTnd,
            annualNetSavingTnd,
            annualTco2eAvoided,
            lifetimeYears,
            waccRate
          ),
      reducesCbamLiability: false,
      cbamTco2eAvoided: 0,
      assumptions: [
        `Feedstock: ${bioRes.rawTonnage} t/yr (${bioRes.wasteType}), CAPEX net of ANME FTE 20% grant: ${capexTnd.toLocaleString()} TND`,
        `Output: ${bioRes.activatedCarbonTons} t activated carbon + ${bioRes.biocharTons} t biochar`,
        `Reduces corporate footprint (Scope A) only; does not reduce product CBAM embedded emissions`,
      ],
      available: true,
      missingInputs: [],
      isFinancialOnly,
      paybackYears: bioRes.paybackYears,
    });
  } else {
    levers.push({
      id: 'bioclaira',
      labelKey: 'bioclaira',
      annualTco2eAvoided: 0,
      capexTnd: 0,
      annualNetSavingTnd: 0,
      lifetimeYears: 7,
      costPerTco2Tnd: 0,
      reducesCbamLiability: false,
      cbamTco2eAvoided: 0,
      assumptions: [],
      available: false,
      missingInputs: bioMissing,
      isFinancialOnly: false,
      paybackYears: null,
    });
  }

  // Sort curve levers ascending by costPerTco2Tnd (exclude unavailable and <= 0 CO2)
  const curveLevers = levers
    .filter((l) => l.available && !l.isFinancialOnly && l.annualTco2eAvoided > 0)
    .sort((a, b) => a.costPerTco2Tnd - b.costPerTco2Tnd);

  const financialOnlyLevers = levers.filter((l) => l.available && l.isFinancialOnly);
  const unavailableLevers = levers.filter((l) => !l.available);

  const totalFootprintAvoidedTco2e = Number(
    curveLevers.reduce((acc, l) => acc + l.annualTco2eAvoided, 0).toFixed(2)
  );
  const totalCbamAvoidedTco2e = Number(
    curveLevers.reduce((acc, l) => acc + l.cbamTco2eAvoided, 0).toFixed(2)
  );
  const totalAnnualNetSavingTnd = Number(
    curveLevers.reduce((acc, l) => acc + l.annualNetSavingTnd, 0).toFixed(2)
  );
  const totalCapexTnd = Math.round(
    curveLevers.reduce((acc, l) => acc + l.capexTnd, 0)
  );

  // Re-use Task 2 CBAM engine to compute CBAM € saved for selected year
  const baseCbamInput: CbamReportInput = {
    productName: input.exportProductName || '',
    cnCode8: input.exportCnCode || '',
    finishedProductTons: input.annualProductionTons,
    annualExportTons: input.annualExportTons,
    naturalGasM3PerMonth: input.naturalGasM3 || 0,
    heavyFuelTonsPerMonth: input.heavyFuelTons || 0,
    dieselLitersPerMonth: input.dieselLiters || 0,
    annualElectricityKwh: kwhTotal * 12,
    precursors: input.bomMaterials,
    reportingYear,
    cbamCertificatePriceEur: input.cbamCertificatePriceEur,
    carbonPricePaidAbroadEur: input.carbonPricePaidAbroadEur,
  };

  const cbamBefore = calculateCbamReport(baseCbamInput);

  // Apply CBAM-relevant switches to precursors & indirect electricity (only when sector counts indirect)
  const adjustedPrecursors = (input.bomMaterials || []).map((item) => {
    const sw = switches[item.id];
    if (
      resolvePrecursorRelevance(item) &&
      sw &&
      typeof sw.alternativeEfTco2ePerTon === 'number' &&
      sw.alternativeEfTco2ePerTon >= 0 &&
      sw.alternativeEfTco2ePerTon < item.efTco2ePerTon
    ) {
      return { ...item, efTco2ePerTon: sw.alternativeEfTco2ePerTon };
    }
    return item;
  });

  const adjustedAnnualKwh = Math.max(
    0,
    kwhTotal * 12 - avoidedCbamElectricityKwhEquivalent
  );

  const cbamAfter = calculateCbamReport({
    ...baseCbamInput,
    annualElectricityKwh: adjustedAnnualKwh,
    precursors: adjustedPrecursors,
  });

  const cbamLiabilityBeforeEur = cbamBefore.cbamScope.estimatedLiabilityEur;
  const cbamLiabilityAfterEur = cbamAfter.cbamScope.estimatedLiabilityEur;
  const cbamAnnualSavedEur =
    avoidedCbamElectricityKwhEquivalent > 0 || avoidedCbamPrecursorsTco2e > 0
      ? Math.max(0, cbamLiabilityBeforeEur - cbamLiabilityAfterEur)
      : 0;

  return {
    hasAnyAvailableLever: curveLevers.length > 0 || financialOnlyLevers.length > 0,
    waccRate,
    levers,
    curveLevers,
    financialOnlyLevers,
    unavailableLevers,
    totalFootprintAvoidedTco2e,
    totalCbamAvoidedTco2e,
    totalAnnualNetSavingTnd,
    totalCapexTnd,
    cbamLiabilityBeforeEur,
    cbamLiabilityAfterEur,
    cbamAnnualSavedEur,
    reportingYear,
  };
}
