// ==============================================================================
// SymbioCarb AI - Guest-Only Demo Case (Hédi, Ben Arous)
// NEVER available inside an authenticated workspace. Used strictly in guest mode
// for jury demonstrations and sales walkthroughs.
// ==============================================================================

import { AuditWizardData } from './audit-context';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';

const kwhJour = 68000;
const kwhPointe = 22000;
const kwhSoir = 18000;
const kwhNuit = 26000;
const kwhTotal = kwhJour + kwhPointe + kwhSoir + kwhNuit; // 134,000 kWh/month
const cosPhi = 0.748;
const tanPhi = Math.sqrt(1 - cosPhi * cosPhi) / cosPhi;
const kvarhTotal = Math.round(kwhTotal * tanPhi);
const pSouscriteKva = 500;
const pMaxAppeleeKva = 525;

const stegSample = calculateStegMtBill({
  kwhJour,
  kwhPointe,
  kwhSoir,
  kwhNuit,
  kvarhTotal,
  pSouscriteKva,
  pMaxAppeleeKva,
  tariffRegime: 'MT_POSTES_HORAIRES',
});

export const DEMO_HEDI_BEN_AROUS: AuditWizardData = {
  companyName: 'Ateliers Mécaniques Hédi (Ben Arous)',
  fiscalId: '1489201/A/M/000',
  governorate: 'Ben Arous',
  industrialZone: 'Zone Industrielle Ben Arous',
  sector: 'metal_mechanics',
  contactEmail: '',
  contactPhone: '',
  exportCnCode: '7326 90 98',
  exportProductName: 'Pièces mécaniques usinées en acier',
  annualExportTons: 1200,
  annualProductionTons: 1200,

  tariffRegime: 'MT_POSTES_HORAIRES',
  districtSteg: 'Ben Arous',
  pSouscriteKva,
  pMaxAppeleeKva,
  kwhJour,
  kwhPointe,
  kwhSoir,
  kwhNuit,
  kvarhTotal,
  cosPhi,
  monthlyBillTnd: Math.round(stegSample.totalTtcTnd),
  reactivePenaltyTnd: Number(stegSample.reactivePenaltyTnd.toFixed(2)),
  powerOverrunPenaltyTnd: Number(stegSample.overrunPenaltyTnd.toFixed(2)),

  naturalGasM3: 0,
  heavyFuelTons: 0,
  dieselLiters: 0,
  steelTons: 0,
  aluminumTons: 0,
  scrapTons: 0,

  cbamReportingYear: 2026,
  cbamCertificatePriceEur: 85,
  euClientAnnualCbamTonnage: 1200,
  carbonPricePaidAbroadEur: 0,
  euDefaultSeeOverride: null,

  solarRoofAreaM2: 0,
  solarYieldKwhPerKwp: 1650,
  solarCapexTndPerKwp: 2800,
  flexibleLoadPct: 25,
  precursorSwitches: {},

  wasteType: 'date_pits',
  wasteMonthlyTons: 54,
  disposalCostTndPerTon: 45,
  moisturePercent: 12,

  monthlyBills: [
    {
      id: 'demo-bill-hedi-2026-10',
      month: 10,
      year: 2026,
      districtSteg: 'Ben Arous',
      tariffRegime: 'MT_POSTES_HORAIRES',
      pSouscriteKva,
      pMaxAppeleeKva,
      kwhJour,
      kwhPointe,
      kwhSoir,
      kwhNuit,
      kvarhTotal,
      cosPhi,
      reactivePenaltyTnd: Number(stegSample.reactivePenaltyTnd.toFixed(2)),
      powerOverrunPenaltyTnd: Number(stegSample.overrunPenaltyTnd.toFixed(2)),
      totalTtcTnd: Number(stegSample.totalTtcTnd.toFixed(2)),
      source: 'manual',
    },
  ],
  bomMaterials: [
    {
      id: 'demo-bom-coils-7209',
      name: 'Bobines acier laminées à froid',
      cnCode8: '7209 16 90',
      quantityTons: 1100,
      efTco2ePerTon: 2.05,
      isCbamRelevantPrecursor: true,
    },
    {
      id: 'demo-bom-bars-7214',
      name: 'Barres acier usinage',
      cnCode8: '7214 20 00',
      quantityTons: 250,
      efTco2ePerTon: 1.65,
      isCbamRelevantPrecursor: true,
    },
  ],
};
