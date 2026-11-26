import { describe, it, expect } from 'vitest';
import {
  buildAbatementPlan,
  computeAbatementCostPerTonne,
  computeCrf,
} from '../abatement-plan';
import { sizeRooftopSolarPv } from '../solar-pv-sizer';

describe('Task 4: Abatement plan & MACC engine', () => {
  it('computes CRF(0.085, 10) and CRF(0.085, 20) accurately', () => {
    // CRF(0.085, 10) = 0.085 * 1.085^10 / (1.085^10 - 1) = 0.1524077...
    expect(computeCrf(0.085, 10)).toBeCloseTo(0.152408, 5);
    // CRF(0.085, 20) = 0.085 * 1.085^20 / (1.085^20 - 1) = 0.105671...
    expect(computeCrf(0.085, 20)).toBeCloseTo(0.105671, 5);
    expect(computeCrf(0, 10)).toBeCloseTo(0.1, 6);
  });

  it('sizes rooftop solar PV <= 80% of Jour kWh and respects roof area cap', () => {
    // 50,000 kWh/month Jour = 600,000 kWh/yr -> 80% = 480,000 kWh/yr -> /1650 = 290.91 kWp
    const uncapped = sizeRooftopSolarPv({ monthlyJourKwh: 50000 });
    expect(uncapped.available).toBe(true);
    expect(uncapped.cappedByRoofArea).toBe(false);
    expect(uncapped.installedKwp).toBeCloseTo(290.91, 2);

    // Cap with 600 m² roof -> 600 / 6 = 100 kWp
    const capped = sizeRooftopSolarPv({ monthlyJourKwh: 50000, roofAreaM2: 600 });
    expect(capped.cappedByRoofArea).toBe(true);
    expect(capped.installedKwp).toBe(100);
    expect(capped.annualPvKwh).toBe(165000);
    // CO2 = 165000 * (0.473 - 0.045) / 1000 = 70.62 tCO2e
    expect(capped.annualTco2eAvoided).toBe(70.62);
    // CAPEX = 100 * 2800 = 280,000; saving = 165000*0.248 - 2800 = 40920 - 2800 = 38,120
    expect(capped.capexTnd).toBe(280000);
    expect(capped.annualNetSavingTnd).toBe(38120);
  });

  it('builds all 5 levers for cement with Gold plan, sorts ascending by cost/tCO2e, and respects CBAM rules', () => {
    const plan = buildAbatementPlan({
      sector: 'chemicals',
      subscriptionPlan: 'gold',
      kwhJour: 70000,
      kwhPointe: 22000,
      kwhSoir: 16000,
      kwhNuit: 26000,
      cosPhi: 0.748,
      reactivePenaltyTnd: 3200,
      flexibleLoadPct: 25,
      requiresNightShiftWorkers: true,
      solarRoofAreaM2: 1200, // 200 kWp
      exportCnCode: '2523 29 00', // cement -> electricity counts in CBAM!
      annualProductionTons: 5000,
      annualExportTons: 5000,
      naturalGasM3: 150000, // realistic kiln direct emissions (~3,636 tCO2e) so plant exceeds 3,412.5 t free alloc
      bomMaterials: [
        {
          id: 'bom-1',
          name: 'Clinker importé',
          cnCode8: '2523 10 00',
          quantityTons: 1000,
          efTco2ePerTon: 0.85,
          isCbamRelevantPrecursor: true,
        },
      ],
      precursorSwitches: {
        'bom-1': {
          alternativeEfTco2ePerTon: 0.65, // -0.20 tCO2e/t -> 200 tCO2e avoided
          pricePremiumTndPerTon: 35, // +35 TND/t -> net saving -35,000 TND -> cost/t = +175 TND/t
        },
      },
      wasteType: 'date_pits',
      wasteMonthlyTons: 54,
      moisturePercent: 12,
      cbamReportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    expect(plan.curveLevers.length).toBe(5);
    // Must be sorted ascending by costPerTco2Tnd
    for (let i = 1; i < plan.curveLevers.length; i++) {
      expect(plan.curveLevers[i].costPerTco2Tnd).toBeGreaterThanOrEqual(
        plan.curveLevers[i - 1].costPerTco2Tnd
      );
    }

    const byId = Object.fromEntries(plan.levers.map((l) => [l.id, l]));
    // Cement: cos_phi, load_shifting, solar_pv, precursor_switch reduce CBAM; bioclaira NEVER reduces CBAM
    expect(byId.cos_phi.reducesCbamLiability).toBe(true);
    expect(byId.load_shifting.reducesCbamLiability).toBe(true);
    expect(byId.solar_pv.reducesCbamLiability).toBe(true);
    expect(byId.precursor_switch.reducesCbamLiability).toBe(true);
    expect(byId.bioclaira.reducesCbamLiability).toBe(false);
    expect(byId.bioclaira.cbamTco2eAvoided).toBe(0);

    // Precursor switch hand check: 200 t avoided, -35,000 TND net saving -> +175 TND/tCO2e
    expect(byId.precursor_switch.annualTco2eAvoided).toBe(200);
    expect(byId.precursor_switch.annualNetSavingTnd).toBe(-35000);
    expect(byId.precursor_switch.costPerTco2Tnd).toBe(175);

    expect(plan.totalFootprintAvoidedTco2e).toBeGreaterThan(0);
    expect(plan.totalCbamAvoidedTco2e).toBeGreaterThan(0);
    expect(plan.cbamAnnualSavedEur).toBeGreaterThan(0);
  });

  it('marks electricity levers as non-CBAM for steel (CN 7326) while keeping precursor_switch CBAM-relevant', () => {
    const plan = buildAbatementPlan({
      sector: 'metal_mechanics',
      subscriptionPlan: 'pro',
      kwhJour: 60000,
      kwhPointe: 20000,
      kwhSoir: 15000,
      kwhNuit: 25000,
      cosPhi: 0.75,
      reactivePenaltyTnd: 2000,
      exportCnCode: '7326 90 98',
      annualProductionTons: 1200,
      bomMaterials: [
        {
          id: 'bom-steel',
          name: 'Tôles acier',
          cnCode8: '7209 16 90',
          quantityTons: 1000,
          efTco2ePerTon: 2.1,
          isCbamRelevantPrecursor: true,
        },
      ],
      precursorSwitches: {
        'bom-steel': {
          alternativeEfTco2ePerTon: 0.8,
          pricePremiumTndPerTon: 90,
        },
      },
      wasteType: 'date_pits',
      wasteMonthlyTons: 54,
    });

    const byId = Object.fromEntries(plan.levers.map((l) => [l.id, l]));
    expect(byId.cos_phi.reducesCbamLiability).toBe(false);
    expect(byId.solar_pv.reducesCbamLiability).toBe(false);
    expect(byId.precursor_switch.reducesCbamLiability).toBe(true);
    // BioClaira unavailable because plan is 'pro', not 'gold'
    expect(byId.bioclaira.available).toBe(false);
    expect(byId.bioclaira.missingInputs).toContain('goldPlanRequired');
  });

  it('returns clean zero-state when no data is entered', () => {
    const plan = buildAbatementPlan({
      sector: 'metal_mechanics',
      subscriptionPlan: 'starter',
      kwhJour: 0,
      kwhPointe: 0,
      kwhSoir: 0,
      kwhNuit: 0,
      cosPhi: 0,
      reactivePenaltyTnd: 0,
      exportCnCode: '',
      annualProductionTons: 0,
      bomMaterials: [],
      wasteType: 'olive_pomace',
      wasteMonthlyTons: 0,
    });

    expect(plan.hasAnyAvailableLever).toBe(false);
    expect(plan.curveLevers).toHaveLength(0);
    expect(plan.unavailableLevers).toHaveLength(5);
    expect(plan.totalFootprintAvoidedTco2e).toBe(0);
    expect(plan.cbamAnnualSavedEur).toBe(0);
  });

  it('excludes levers with annualTco2eAvoided <= 0 from the MACC curve as financial-only', () => {
    const plan = buildAbatementPlan({
      sector: 'metal_mechanics',
      subscriptionPlan: 'pro',
      kwhJour: 50000,
      kwhPointe: 0,
      kwhSoir: 0,
      kwhNuit: 0,
      cosPhi: 0,
      reactivePenaltyTnd: 0,
      exportCnCode: '7326 90 98',
      annualProductionTons: 1000,
      bomMaterials: [
        {
          id: 'bom-1',
          name: 'Acier',
          cnCode8: '7209 16 90',
          quantityTons: 500,
          efTco2ePerTon: 1.5,
          isCbamRelevantPrecursor: true,
        },
      ],
      precursorSwitches: {
        'bom-1': {
          // Worse EF -> negative CO2 avoided (-250 tCO2e), must be excluded from curve!
          alternativeEfTco2ePerTon: 2.0,
          pricePremiumTndPerTon: -50,
        },
      },
      wasteType: 'olive_pomace',
      wasteMonthlyTons: 0,
    });

    const switchLever = plan.levers.find((l) => l.id === 'precursor_switch')!;
    expect(switchLever.available).toBe(true);
    expect(switchLever.isFinancialOnly).toBe(true);
    expect(plan.financialOnlyLevers.some((l) => l.id === 'precursor_switch')).toBe(true);
    expect(plan.curveLevers.some((l) => l.id === 'precursor_switch')).toBe(false);
    expect(computeAbatementCostPerTonne(1000, 500, -10, 5)).toBe(0);
  });
});
