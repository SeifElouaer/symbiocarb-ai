import { describe, it, expect } from 'vitest';
import {
  DEMO_HEDI_BEN_AROUS,
  DEMO_HEDI_1_WINNER,
  DEMO_HEDI_2_LOSER,
} from '../demo-case';
import { calculateCbamReport } from '@/lib/engine/cbam-calculator';
import { compareDefaultVsActual } from '@/lib/engine/cbam-default-comparator';
import { buildAbatementPlan } from '@/lib/engine/abatement-plan';
import { simulateBioClairaValorization } from '@/lib/engine/bioclaira-simulator';

describe('Task 5: Guest-only Hédi (Ben Arous) demo case key figures', () => {
  it('computes coherent CBAM A vs B, 2026 liability, default vs actual saving, and top 3 levers', () => {
    const kwhTotal =
      DEMO_HEDI_BEN_AROUS.kwhJour +
      DEMO_HEDI_BEN_AROUS.kwhPointe +
      DEMO_HEDI_BEN_AROUS.kwhSoir +
      DEMO_HEDI_BEN_AROUS.kwhNuit;

    expect(kwhTotal).toBe(134000);
    expect(DEMO_HEDI_BEN_AROUS.cosPhi).toBe(0.748);
    expect(DEMO_HEDI_BEN_AROUS.annualProductionTons).toBe(1200);
    expect(DEMO_HEDI_BEN_AROUS.wasteMonthlyTons).toBe(54);

    const cbam = calculateCbamReport({
      productName: DEMO_HEDI_BEN_AROUS.exportProductName,
      cnCode8: DEMO_HEDI_BEN_AROUS.exportCnCode,
      finishedProductTons: DEMO_HEDI_BEN_AROUS.annualProductionTons,
      annualExportTons: DEMO_HEDI_BEN_AROUS.annualExportTons,
      naturalGasM3PerMonth: DEMO_HEDI_BEN_AROUS.naturalGasM3,
      heavyFuelTonsPerMonth: DEMO_HEDI_BEN_AROUS.heavyFuelTons,
      dieselLitersPerMonth: DEMO_HEDI_BEN_AROUS.dieselLiters,
      annualElectricityKwh: kwhTotal * 12,
      precursors: DEMO_HEDI_BEN_AROUS.bomMaterials,
      reportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    const comparison = compareDefaultVsActual({
      cbamResult: cbam,
      overrideDefaultSee: DEMO_HEDI_BEN_AROUS.euDefaultSeeOverride,
    });

    const plan = buildAbatementPlan({
      sector: DEMO_HEDI_BEN_AROUS.sector,
      subscriptionPlan: 'pro',
      kwhJour: DEMO_HEDI_BEN_AROUS.kwhJour,
      kwhPointe: DEMO_HEDI_BEN_AROUS.kwhPointe,
      kwhSoir: DEMO_HEDI_BEN_AROUS.kwhSoir,
      kwhNuit: DEMO_HEDI_BEN_AROUS.kwhNuit,
      cosPhi: DEMO_HEDI_BEN_AROUS.cosPhi,
      reactivePenaltyTnd: DEMO_HEDI_BEN_AROUS.reactivePenaltyTnd,
      flexibleLoadPct: DEMO_HEDI_BEN_AROUS.flexibleLoadPct,
      exportCnCode: DEMO_HEDI_BEN_AROUS.exportCnCode,
      annualProductionTons: DEMO_HEDI_BEN_AROUS.annualProductionTons,
      annualExportTons: DEMO_HEDI_BEN_AROUS.annualExportTons,
      bomMaterials: DEMO_HEDI_BEN_AROUS.bomMaterials,
      wasteType: DEMO_HEDI_BEN_AROUS.wasteType,
      wasteMonthlyTons: DEMO_HEDI_BEN_AROUS.wasteMonthlyTons,
      moisturePercent: DEMO_HEDI_BEN_AROUS.moisturePercent,
      cbamReportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    const bioGold = simulateBioClairaValorization({
      wasteType: 'date_pits',
      rawTonnage: DEMO_HEDI_BEN_AROUS.wasteMonthlyTons * 12,
      moisturePct: DEMO_HEDI_BEN_AROUS.moisturePercent,
      pyrolysisTempC: 650,
    });

    // Print pitch deck summary in test stdout
    console.info('=== HÉDI BEN AROUS PITCH-DECK KEY FIGURES ===');
    console.info('Corporate Footprint A (tCO2e/yr):', cbam.corporateFootprint.totalTco2e);
    console.info('Corporate Intensity A (tCO2e/t):', cbam.corporateFootprint.intensityTco2ePerTon);
    console.info('CBAM Embedded B (tCO2e/yr):', cbam.cbamScope.totalCbamEmbeddedTco2e);
    console.info('CBAM SEE B (tCO2e/t):', cbam.cbamScope.cbamSeeTco2ePerTon);
    console.info('2026 CBAM Certificates:', cbam.cbamScope.certificatesRequired);
    console.info('2026 CBAM Liability (EUR / TND):', cbam.cbamScope.estimatedLiabilityEur, '/', cbam.cbamScope.estimatedLiabilityTnd);
    console.info('Default vs Actual Importer Saving (EUR / TND / EUR-per-t):', comparison.savingForImporterEur, '/', comparison.savingForImporterTnd, '/', comparison.savingPerTonneEur);
    console.info('Top 3 MACC Levers:', plan.curveLevers.slice(0, 3).map((l) => ({
      id: l.id,
      tco2e: l.annualTco2eAvoided,
      capexTnd: l.capexTnd,
      netSavingTnd: l.annualNetSavingTnd,
      costPerTco2Tnd: l.costPerTco2Tnd,
    })));
    console.info('BioClaira Gold (650°C date pits 54 t/mo):', {
      activatedCarbonTons: bioGold.activatedCarbonTons,
      netAvoidedTco2e: bioGold.netAvoidedTco2e,
      netAnnualProfitTnd: bioGold.netAnnualProfitTnd,
      anmeSubsidizedCapexTnd: bioGold.anmeSubsidizedCapexTnd,
    });

    expect(cbam.corporateFootprint.totalTco2e).toBeGreaterThan(cbam.cbamScope.totalCbamEmbeddedTco2e);
    expect(cbam.cbamScope.estimatedLiabilityEur).toBeGreaterThan(0);
    expect(comparison.savingForImporterEur).toBeGreaterThan(0);
    expect(plan.curveLevers.length).toBeGreaterThanOrEqual(3);
  });

  it('DEMO_HEDI_1_WINNER stays below EU benchmark with 0 CBAM liability and 0 STEG penalties', () => {
    const kwhTotal =
      DEMO_HEDI_1_WINNER.kwhJour +
      DEMO_HEDI_1_WINNER.kwhPointe +
      DEMO_HEDI_1_WINNER.kwhSoir +
      DEMO_HEDI_1_WINNER.kwhNuit;

    const cbam = calculateCbamReport({
      productName: DEMO_HEDI_1_WINNER.exportProductName,
      cnCode8: DEMO_HEDI_1_WINNER.exportCnCode,
      finishedProductTons: DEMO_HEDI_1_WINNER.annualProductionTons,
      annualExportTons: DEMO_HEDI_1_WINNER.annualExportTons,
      naturalGasM3PerMonth: DEMO_HEDI_1_WINNER.naturalGasM3,
      heavyFuelTonsPerMonth: DEMO_HEDI_1_WINNER.heavyFuelTons,
      dieselLitersPerMonth: DEMO_HEDI_1_WINNER.dieselLiters,
      annualElectricityKwh: kwhTotal * 12,
      precursors: DEMO_HEDI_1_WINNER.bomMaterials,
      reportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    const comparison = compareDefaultVsActual({
      cbamResult: cbam,
      overrideDefaultSee: DEMO_HEDI_1_WINNER.euDefaultSeeOverride,
    });

    expect(cbam.cbamScope.cbamSeeTco2ePerTon).toBeLessThanOrEqual(cbam.cbamScope.benchmarkTco2ePerTon);
    expect(cbam.cbamScope.estimatedLiabilityEur).toBe(0);
    expect(comparison.savingForImporterEur).toBeGreaterThan(0);
    expect(comparison.isRealDataWorse).toBe(false);
    expect(DEMO_HEDI_1_WINNER.reactivePenaltyTnd).toBe(0);
    expect(DEMO_HEDI_1_WINNER.powerOverrunPenaltyTnd).toBe(0);
  });

  it('DEMO_HEDI_2_LOSER exceeds EU benchmark with deficit, STEG penalties, and actionable compensation plan', () => {
    const kwhTotal =
      DEMO_HEDI_2_LOSER.kwhJour +
      DEMO_HEDI_2_LOSER.kwhPointe +
      DEMO_HEDI_2_LOSER.kwhSoir +
      DEMO_HEDI_2_LOSER.kwhNuit;

    const cbam = calculateCbamReport({
      productName: DEMO_HEDI_2_LOSER.exportProductName,
      cnCode8: DEMO_HEDI_2_LOSER.exportCnCode,
      finishedProductTons: DEMO_HEDI_2_LOSER.annualProductionTons,
      annualExportTons: DEMO_HEDI_2_LOSER.annualExportTons,
      naturalGasM3PerMonth: DEMO_HEDI_2_LOSER.naturalGasM3,
      heavyFuelTonsPerMonth: DEMO_HEDI_2_LOSER.heavyFuelTons,
      dieselLitersPerMonth: DEMO_HEDI_2_LOSER.dieselLiters,
      annualElectricityKwh: kwhTotal * 12,
      precursors: DEMO_HEDI_2_LOSER.bomMaterials,
      reportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    const comparison = compareDefaultVsActual({
      cbamResult: cbam,
      overrideDefaultSee: DEMO_HEDI_2_LOSER.euDefaultSeeOverride,
    });

    const plan = buildAbatementPlan({
      sector: DEMO_HEDI_2_LOSER.sector,
      subscriptionPlan: 'gold',
      kwhJour: DEMO_HEDI_2_LOSER.kwhJour,
      kwhPointe: DEMO_HEDI_2_LOSER.kwhPointe,
      kwhSoir: DEMO_HEDI_2_LOSER.kwhSoir,
      kwhNuit: DEMO_HEDI_2_LOSER.kwhNuit,
      cosPhi: DEMO_HEDI_2_LOSER.cosPhi,
      reactivePenaltyTnd: DEMO_HEDI_2_LOSER.reactivePenaltyTnd,
      flexibleLoadPct: DEMO_HEDI_2_LOSER.flexibleLoadPct,
      solarRoofAreaM2: DEMO_HEDI_2_LOSER.solarRoofAreaM2,
      solarYieldKwhPerKwp: DEMO_HEDI_2_LOSER.solarYieldKwhPerKwp,
      solarCapexTndPerKwp: DEMO_HEDI_2_LOSER.solarCapexTndPerKwp,
      exportCnCode: DEMO_HEDI_2_LOSER.exportCnCode,
      annualProductionTons: DEMO_HEDI_2_LOSER.annualProductionTons,
      annualExportTons: DEMO_HEDI_2_LOSER.annualExportTons,
      naturalGasM3: DEMO_HEDI_2_LOSER.naturalGasM3,
      heavyFuelTons: DEMO_HEDI_2_LOSER.heavyFuelTons,
      dieselLiters: DEMO_HEDI_2_LOSER.dieselLiters,
      bomMaterials: DEMO_HEDI_2_LOSER.bomMaterials,
      precursorSwitches: DEMO_HEDI_2_LOSER.precursorSwitches,
      wasteType: DEMO_HEDI_2_LOSER.wasteType,
      wasteMonthlyTons: DEMO_HEDI_2_LOSER.wasteMonthlyTons,
      moisturePercent: DEMO_HEDI_2_LOSER.moisturePercent,
      cbamReportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    expect(cbam.cbamScope.cbamSeeTco2ePerTon).toBeGreaterThan(cbam.cbamScope.benchmarkTco2ePerTon);
    expect(cbam.cbamScope.estimatedLiabilityEur).toBeGreaterThan(0);
    expect(comparison.isRealDataWorse).toBe(true);
    expect(DEMO_HEDI_2_LOSER.reactivePenaltyTnd).toBeGreaterThan(0);
    expect(DEMO_HEDI_2_LOSER.powerOverrunPenaltyTnd).toBeGreaterThan(0);
    expect(plan.totalCbamAvoidedTco2e).toBeGreaterThan(1500);
    expect(plan.cbamAnnualSavedEur).toBeGreaterThan(0);
  });
});
