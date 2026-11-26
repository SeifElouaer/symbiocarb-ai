// ==============================================================================
// SymbioCarb AI - Guest-Only Demo Cases (Hédi 1 Winner & Hédi 2 Deficit)
// NEVER available inside an authenticated workspace. Used strictly in guest mode
// for jury demonstrations and sales walkthroughs.
// ==============================================================================

import { AuditWizardData } from './audit-context';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';

export type DemoCaseVariant = 'hedi1' | 'hedi2';

function buildStegMetrics(params: {
  kwhJour: number;
  kwhPointe: number;
  kwhSoir: number;
  kwhNuit: number;
  cosPhi: number;
  pSouscriteKva: number;
  pMaxAppeleeKva: number;
}) {
  const kwhTotal = params.kwhJour + params.kwhPointe + params.kwhSoir + params.kwhNuit;
  const tanPhi = Math.sqrt(1 - params.cosPhi * params.cosPhi) / params.cosPhi;
  const kvarhTotal = Math.round(kwhTotal * tanPhi);
  const bill = calculateStegMtBill({
    kwhJour: params.kwhJour,
    kwhPointe: params.kwhPointe,
    kwhSoir: params.kwhSoir,
    kwhNuit: params.kwhNuit,
    kvarhTotal,
    pSouscriteKva: params.pSouscriteKva,
    pMaxAppeleeKva: params.pMaxAppeleeKva,
    tariffRegime: 'MT_POSTES_HORAIRES',
  });
  return { kvarhTotal, bill };
}

const kwhJour = 68000;
const kwhPointe = 22000;
const kwhSoir = 18000;
const kwhNuit = 26000;
const cosPhi = 0.748;
const pSouscriteKva = 500;
const pMaxAppeleeKva = 525;
const legacySteg = buildStegMetrics({
  kwhJour,
  kwhPointe,
  kwhSoir,
  kwhNuit,
  cosPhi,
  pSouscriteKva,
  pMaxAppeleeKva,
});
const kvarhTotal = legacySteg.kvarhTotal;
const stegSample = legacySteg.bill;

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

// ------------------------------------------------------------------------------
// HÉDI 1 — Profil Gagnant (Sous seuil Benchmark UE 1.30 tCO2e/t, 0 pénalité STEG)
// ------------------------------------------------------------------------------
const hedi1Params = {
  kwhJour: 48000,
  kwhPointe: 10000,
  kwhSoir: 16000,
  kwhNuit: 32000,
  cosPhi: 0.94,
  pSouscriteKva: 450,
  pMaxAppeleeKva: 420,
};
const hedi1Steg = buildStegMetrics(hedi1Params);

export const DEMO_HEDI_1_WINNER: AuditWizardData = {
  companyName: 'Hédi 1 — Ateliers Acier Bas-Carbone (Ben Arous)',
  fiscalId: '1489201/A/M/001',
  governorate: 'Ben Arous',
  industrialZone: 'Zone Industrielle El Mghira',
  sector: 'metal_mechanics',
  contactEmail: '',
  contactPhone: '',
  exportCnCode: '7326 90 98',
  exportProductName: 'Pièces mécaniques usinées (filière EAF bas-carbone)',
  annualExportTons: 1200,
  annualProductionTons: 1200,

  tariffRegime: 'MT_POSTES_HORAIRES',
  districtSteg: 'Ben Arous',
  pSouscriteKva: hedi1Params.pSouscriteKva,
  pMaxAppeleeKva: hedi1Params.pMaxAppeleeKva,
  kwhJour: hedi1Params.kwhJour,
  kwhPointe: hedi1Params.kwhPointe,
  kwhSoir: hedi1Params.kwhSoir,
  kwhNuit: hedi1Params.kwhNuit,
  kvarhTotal: hedi1Steg.kvarhTotal,
  cosPhi: hedi1Params.cosPhi,
  monthlyBillTnd: Math.round(hedi1Steg.bill.totalTtcTnd),
  reactivePenaltyTnd: Number(hedi1Steg.bill.reactivePenaltyTnd.toFixed(2)),
  powerOverrunPenaltyTnd: Number(hedi1Steg.bill.overrunPenaltyTnd.toFixed(2)),

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

  solarRoofAreaM2: 1200,
  solarYieldKwhPerKwp: 1650,
  solarCapexTndPerKwp: 2800,
  flexibleLoadPct: 20,
  precursorSwitches: {},

  wasteType: 'date_pits',
  wasteMonthlyTons: 40,
  disposalCostTndPerTon: 45,
  moisturePercent: 12,

  monthlyBills: [
    {
      id: 'demo-bill-hedi1-2026-10',
      month: 10,
      year: 2026,
      districtSteg: 'Ben Arous',
      tariffRegime: 'MT_POSTES_HORAIRES',
      pSouscriteKva: hedi1Params.pSouscriteKva,
      pMaxAppeleeKva: hedi1Params.pMaxAppeleeKva,
      kwhJour: hedi1Params.kwhJour,
      kwhPointe: hedi1Params.kwhPointe,
      kwhSoir: hedi1Params.kwhSoir,
      kwhNuit: hedi1Params.kwhNuit,
      kvarhTotal: hedi1Steg.kvarhTotal,
      cosPhi: hedi1Params.cosPhi,
      reactivePenaltyTnd: Number(hedi1Steg.bill.reactivePenaltyTnd.toFixed(2)),
      powerOverrunPenaltyTnd: Number(hedi1Steg.bill.overrunPenaltyTnd.toFixed(2)),
      totalTtcTnd: Number(hedi1Steg.bill.totalTtcTnd.toFixed(2)),
      source: 'manual',
    },
  ],
  bomMaterials: [
    {
      id: 'demo-hedi1-bom-coils',
      name: 'Bobines acier recyclé EAF',
      cnCode8: '7209 16 90',
      quantityTons: 1050,
      efTco2ePerTon: 0.85,
      isCbamRelevantPrecursor: true,
    },
    {
      id: 'demo-hedi1-bom-bars',
      name: 'Barres acier électrique EAF',
      cnCode8: '7214 20 00',
      quantityTons: 200,
      efTco2ePerTon: 0.78,
      isCbamRelevantPrecursor: true,
    },
  ],
};

// ------------------------------------------------------------------------------
// HÉDI 2 — Profil Déficitaire (Hors seuil UE 1.30 tCO2e/t + pénalités STEG)
// ------------------------------------------------------------------------------
const hedi2Params = {
  kwhJour: 72000,
  kwhPointe: 34000,
  kwhSoir: 20000,
  kwhNuit: 18000,
  cosPhi: 0.71,
  pSouscriteKva: 500,
  pMaxAppeleeKva: 560,
};
const hedi2Steg = buildStegMetrics(hedi2Params);

export const DEMO_HEDI_2_LOSER: AuditWizardData = {
  companyName: 'Hédi 2 — Fonderie & Usinage Conventionnel (Ben Arous)',
  fiscalId: '1489201/B/M/002',
  governorate: 'Ben Arous',
  industrialZone: 'Zone Industrielle Ben Arous',
  sector: 'metal_mechanics',
  contactEmail: '',
  contactPhone: '',
  exportCnCode: '7326 90 98',
  exportProductName: 'Pièces mécaniques conventionnelles (filière BF-BOF)',
  annualExportTons: 1200,
  annualProductionTons: 1200,

  tariffRegime: 'MT_POSTES_HORAIRES',
  districtSteg: 'Ben Arous',
  pSouscriteKva: hedi2Params.pSouscriteKva,
  pMaxAppeleeKva: hedi2Params.pMaxAppeleeKva,
  kwhJour: hedi2Params.kwhJour,
  kwhPointe: hedi2Params.kwhPointe,
  kwhSoir: hedi2Params.kwhSoir,
  kwhNuit: hedi2Params.kwhNuit,
  kvarhTotal: hedi2Steg.kvarhTotal,
  cosPhi: hedi2Params.cosPhi,
  monthlyBillTnd: Math.round(hedi2Steg.bill.totalTtcTnd),
  reactivePenaltyTnd: Number(hedi2Steg.bill.reactivePenaltyTnd.toFixed(2)),
  powerOverrunPenaltyTnd: Number(hedi2Steg.bill.overrunPenaltyTnd.toFixed(2)),

  naturalGasM3: 12000,
  heavyFuelTons: 8,
  dieselLiters: 2500,
  steelTons: 0,
  aluminumTons: 0,
  scrapTons: 0,

  cbamReportingYear: 2026,
  cbamCertificatePriceEur: 85,
  euClientAnnualCbamTonnage: 1200,
  carbonPricePaidAbroadEur: 0,
  euDefaultSeeOverride: null,

  solarRoofAreaM2: 1800,
  solarYieldKwhPerKwp: 1650,
  solarCapexTndPerKwp: 2800,
  flexibleLoadPct: 35,
  precursorSwitches: {
    'demo-hedi2-bom-coils': {
      alternativeEfTco2ePerTon: 0.85,
      pricePremiumTndPerTon: 85,
      alternativeLabel: 'Acier recyclé EAF certifié',
    },
    'demo-hedi2-bom-bars': {
      alternativeEfTco2ePerTon: 0.78,
      pricePremiumTndPerTon: 70,
      alternativeLabel: 'Barres électriques EAF',
    },
  },

  wasteType: 'date_pits',
  wasteMonthlyTons: 54,
  disposalCostTndPerTon: 45,
  moisturePercent: 12,

  monthlyBills: [
    {
      id: 'demo-bill-hedi2-2026-10',
      month: 10,
      year: 2026,
      districtSteg: 'Ben Arous',
      tariffRegime: 'MT_POSTES_HORAIRES',
      pSouscriteKva: hedi2Params.pSouscriteKva,
      pMaxAppeleeKva: hedi2Params.pMaxAppeleeKva,
      kwhJour: hedi2Params.kwhJour,
      kwhPointe: hedi2Params.kwhPointe,
      kwhSoir: hedi2Params.kwhSoir,
      kwhNuit: hedi2Params.kwhNuit,
      kvarhTotal: hedi2Steg.kvarhTotal,
      cosPhi: hedi2Params.cosPhi,
      reactivePenaltyTnd: Number(hedi2Steg.bill.reactivePenaltyTnd.toFixed(2)),
      powerOverrunPenaltyTnd: Number(hedi2Steg.bill.overrunPenaltyTnd.toFixed(2)),
      totalTtcTnd: Number(hedi2Steg.bill.totalTtcTnd.toFixed(2)),
      source: 'manual',
    },
  ],
  bomMaterials: [
    {
      id: 'demo-hedi2-bom-coils',
      name: 'Bobines acier BF-BOF (importé)',
      cnCode8: '7209 16 90',
      quantityTons: 1150,
      efTco2ePerTon: 2.45,
      isCbamRelevantPrecursor: true,
    },
    {
      id: 'demo-hedi2-bom-bars',
      name: 'Barres acier conventionnel',
      cnCode8: '7214 20 00',
      quantityTons: 250,
      efTco2ePerTon: 2.15,
      isCbamRelevantPrecursor: true,
    },
  ],
};
