import { describe, it, expect } from 'vitest';
import { calculateCbamReport } from '../cbam-calculator';

describe('Task 2: CBAM 2026+ definitive period rules', () => {
  it('excludes Scope 2 indirect emissions (300 t) from B for steel CN 7326 while including them in A', () => {
    const res = calculateCbamReport({
      productName: 'Pièces acier usinées',
      cnCode8: '7326 90 98',
      finishedProductTons: 1000,
      directScope1Tco2e: 200,
      directScope2Tco2e: 300,
      precursors: [
        {
          name: 'Bobines acier',
          cnCode8: '7209 16 90',
          quantityTons: 500,
          efTco2ePerTon: 2.0, // 1000 tCO2e
        },
      ],
      reportingYear: 2026,
    });

    // Result A includes Scope 1 (200) + Scope 2 (300) + Scope 3 (1000) = 1500
    expect(res.corporateFootprint.scope1DirectTco2e).toBe(200);
    expect(res.corporateFootprint.scope2IndirectTco2e).toBe(300);
    expect(res.corporateFootprint.scope3AllBomTco2e).toBe(1000);
    expect(res.corporateFootprint.totalTco2e).toBe(1500);

    // Result B excludes Scope 2 (300) for steel, keeping Scope 1 (200) + precursor (1000) = 1200
    expect(res.cbamScope.sector).toBe('iron_steel');
    expect(res.cbamScope.indirectEmissionsIncluded).toBe(false);
    expect(res.cbamScope.indirectEmissionsForInfoTco2e).toBe(300);
    expect(res.cbamScope.indirectEmissionsCountedTco2e).toBe(0);
    expect(res.cbamScope.totalCbamEmbeddedTco2e).toBe(1200);
    expect(res.cbamScope.cbamSeeTco2ePerTon).toBe(1.2);
  });

  it('includes Scope 2 indirect emissions in B for cement (CN 2523)', () => {
    const res = calculateCbamReport({
      productName: 'Clinker Portland',
      cnCode8: '2523 10 00',
      finishedProductTons: 1000,
      directScope1Tco2e: 500,
      directScope2Tco2e: 300,
      precursors: [],
      reportingYear: 2026,
    });

    expect(res.cbamScope.sector).toBe('cement');
    expect(res.cbamScope.indirectEmissionsIncluded).toBe(true);
    expect(res.cbamScope.indirectEmissionsCountedTco2e).toBe(300);
    expect(res.cbamScope.totalCbamEmbeddedTco2e).toBe(800);
    expect(res.corporateFootprint.totalTco2e).toBe(800);
  });

  it('includes non-CBAM BOM items (e.g. plastics CN 3901) in A and excludes them from B', () => {
    const res = calculateCbamReport({
      productName: 'Profilés acier gainés',
      cnCode8: '7326 90 98',
      finishedProductTons: 500,
      directScope1Tco2e: 100,
      directScope2Tco2e: 50,
      precursors: [
        {
          name: 'Barres acier',
          cnCode8: '7214 20 00',
          quantityTons: 300,
          efTco2ePerTon: 1.5, // 450 tCO2e (CBAM precursor)
        },
        {
          name: 'Granulés polymère HDPE',
          cnCode8: '3901 20 90',
          quantityTons: 100,
          efTco2ePerTon: 2.0, // 200 tCO2e (non-CBAM)
        },
      ],
    });

    expect(res.corporateFootprint.scope3AllBomTco2e).toBe(650);
    expect(res.corporateFootprint.totalTco2e).toBe(800); // 100 + 50 + 650

    expect(res.cbamScope.cbamRelevantPrecursorsTco2e).toBe(450);
    expect(res.cbamScope.excludedBomTco2e).toBe(200);
    expect(res.cbamScope.totalCbamEmbeddedTco2e).toBe(550); // 100 + 450
  });

  it('computes exact hand-checked phase-in liabilities for 2026 vs 2030', () => {
    // CN 7326 benchmark = 1.30 tCO2e/t
    // Total CBAM B = 2000 tCO2e over 1000 t production & 1000 t export, price = 85 EUR/t
    // 2026: factor 0.975 -> deduction = 1.30 * 1000 * 0.975 = 1267.5 -> cert = 732.5 -> 732.5 * 85 = 62,262.5 -> 62,263 €
    // 2030: factor 0.515 -> deduction = 1.30 * 1000 * 0.515 = 669.5  -> cert = 1330.5 -> 1330.5 * 85 = 113,092.5 -> 113,093 €
    const base = {
      productName: 'Acier usiné',
      cnCode8: '7326 90 98',
      finishedProductTons: 1000,
      annualExportTons: 1000,
      directScope1Tco2e: 400,
      directScope2Tco2e: 250,
      precursors: [
        { name: 'Acier brut', cnCode8: '7208 51 20', quantityTons: 800, efTco2ePerTon: 2.0 },
      ],
      cbamCertificatePriceEur: 85,
    };

    const y2026 = calculateCbamReport({ ...base, reportingYear: 2026 });
    const y2030 = calculateCbamReport({ ...base, reportingYear: 2030 });

    expect(y2026.cbamScope.totalCbamEmbeddedTco2e).toBe(2000);
    expect(y2026.cbamScope.freeAllocationFactor).toBe(0.975);
    expect(y2026.cbamScope.certificatesRequired).toBe(732.5);
    expect(y2026.cbamScope.estimatedLiabilityEur).toBe(62263);

    expect(y2030.cbamScope.freeAllocationFactor).toBe(0.515);
    expect(y2030.cbamScope.certificatesRequired).toBe(1330.5);
    expect(y2030.cbamScope.estimatedLiabilityEur).toBe(113093);
  });

  it('returns a clean zero-state object with no NaN or Infinity for zero or empty inputs', () => {
    const res = calculateCbamReport({
      productName: '',
      cnCode8: '',
      finishedProductTons: 0,
      annualExportTons: 0,
      naturalGasM3PerMonth: 0,
      annualElectricityKwh: 0,
      precursors: [],
    });

    expect(res.hasData).toBe(false);
    expect(res.hasProduction).toBe(false);
    expect(res.corporateFootprint.totalTco2e).toBe(0);
    expect(res.corporateFootprint.intensityTco2ePerTon).toBe(0);
    expect(res.cbamScope.cbamSeeTco2ePerTon).toBe(0);
    expect(res.cbamScope.certificatesRequired).toBe(0);
    expect(res.cbamScope.estimatedLiabilityEur).toBe(0);
    expect(Number.isNaN(res.cbamScope.cbamSeeTco2ePerTon)).toBe(false);
    expect(Number.isFinite(res.cbamScope.estimatedLiabilityEur)).toBe(true);
  });

  it('clamps certificates to 0 when free allocation (benchmark * production * factor) exceeds emissions', () => {
    const res = calculateCbamReport({
      productName: 'Acier bas carbone',
      cnCode8: '7326 90 98',
      finishedProductTons: 1000,
      directScope1Tco2e: 100,
      directScope2Tco2e: 50,
      precursors: [
        { name: 'Acier EAF recyclé', cnCode8: '7214 20 00', quantityTons: 800, efTco2ePerTon: 0.5 },
      ],
      reportingYear: 2026, // benchmark 1.30 * 1000 * 0.975 = 1267.5 > 500
    });

    expect(res.cbamScope.totalCbamEmbeddedTco2e).toBe(500);
    expect(res.cbamScope.certificatesRequired).toBe(0);
    expect(res.cbamScope.estimatedLiabilityEur).toBe(0);
  });
});
