import { describe, it, expect } from 'vitest';
import { calculateCbamReport } from '../cbam-calculator';
import { compareDefaultVsActual } from '../cbam-default-comparator';

describe('Task 3: EU default values vs actual verified data comparator', () => {
  it('computes exact saving on a hand-computed steel example', () => {
    // 1000 t CN 7326 (benchmark 1.30), 2026 (free alloc factor 0.975, markup 10%), 85 EUR/t
    // Actual CBAM SEE = 1.60 tCO2e/t -> total 1600 -> ded 1267.5 -> cert 332.5 -> 28,263 EUR
    // Default override = 2.20 tCO2e/t -> +10% markup = 2.42 -> total 2420 -> ded 1267.5 -> cert 1152.5 -> 97,963 EUR
    // Saving = 97,963 - 28,263 = 69,700 EUR (69.70 EUR/t)
    const cbamResult = calculateCbamReport({
      productName: 'Pièces acier',
      cnCode8: '7326 90 98',
      finishedProductTons: 1000,
      annualExportTons: 1000,
      directScope1Tco2e: 400,
      directScope2Tco2e: 200, // excluded for steel
      precursors: [
        { name: 'Acier', cnCode8: '7209 16 90', quantityTons: 600, efTco2ePerTon: 2.0 }, // 1200
      ],
      reportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    const cmp = compareDefaultVsActual({
      cbamResult,
      overrideDefaultSee: 2.2,
    });

    expect(cmp.hasDefaultValue).toBe(true);
    expect(cmp.markupPct).toBe(10);
    expect(cmp.defaultSeeWithMarkup).toBe(2.42);
    expect(cmp.actualSee).toBe(1.6);
    expect(cmp.liabilityActualEur).toBe(28263);
    expect(cmp.liabilityDefaultEur).toBe(97963);
    expect(cmp.savingForImporterEur).toBe(69700);
    expect(cmp.savingPerTonneEur).toBe(69.7);
    expect(cmp.isRealDataBetter).toBe(true);
    expect(cmp.isRealDataWorse).toBe(false);
  });

  it('handles the case where real SEE is worse than the marked-up default honestly', () => {
    const cbamResult = calculateCbamReport({
      productName: 'Acier forte intensité',
      cnCode8: '7326 90 98',
      finishedProductTons: 500,
      annualExportTons: 500,
      directScope1Tco2e: 600,
      precursors: [
        { name: 'Acier', cnCode8: '7209 16 90', quantityTons: 500, efTco2ePerTon: 2.2 }, // 1100
      ], // CBAM total = 1700 -> SEE = 3.40
      reportingYear: 2026,
      cbamCertificatePriceEur: 85,
    });

    const cmp = compareDefaultVsActual({
      cbamResult,
      overrideDefaultSee: 2.0, // +10% = 2.20 < 3.40
    });

    expect(cmp.hasDefaultValue).toBe(true);
    expect(cmp.isRealDataWorse).toBe(true);
    expect(cmp.isRealDataBetter).toBe(false);
    expect(cmp.savingForImporterEur).toBeLessThan(0);
    expect(cmp.savingPerTonneEur).toBeLessThan(0);
  });

  it('handles missing default value gracefully without crashing', () => {
    // CN 7604 (aluminium) is intentionally not in the demo default table
    const cbamResult = calculateCbamReport({
      productName: 'Profilés aluminium',
      cnCode8: '7604 21 00',
      finishedProductTons: 400,
      directScope1Tco2e: 200,
      precursors: [
        { name: 'Aluminium primaire', cnCode8: '7601 10 00', quantityTons: 400, efTco2ePerTon: 8.0 },
      ],
      reportingYear: 2026,
    });

    const cmp = compareDefaultVsActual({
      cbamResult,
      overrideDefaultSee: null,
    });

    expect(cmp.hasDefaultValue).toBe(false);
    expect(cmp.liabilityDefaultEur).toBe(0);
    expect(cmp.savingForImporterEur).toBe(0);
    expect(Number.isNaN(cmp.savingForImporterEur)).toBe(false);
  });
});
