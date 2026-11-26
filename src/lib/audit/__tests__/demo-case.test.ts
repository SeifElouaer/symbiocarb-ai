import { describe, it, expect } from 'vitest';
import { DEMO_HEDI_BEN_AROUS } from '../demo-case';
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
});
