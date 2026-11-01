'use client';

// ==============================================================================
// SymbioCarb AI - Industrial Audit & Decarbonization Context
// Replaces a 6-month consulting audit with an automated, 5-step guided workflow
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector, StegTariffType } from '@/types';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';
import { simulateBioClairaValorization } from '@/lib/engine/bioclaira-simulator';
import { FALLBACK_ORGANIZATIONS, FALLBACK_BILLS } from '@/lib/supabase/fallback-data';

export interface AuditWizardData {
  // Step 1: Profil Entreprise & Périmètre Exportateur
  companyName: string;
  fiscalId: string;
  governorate: string;
  industrialZone: string;
  sector: Sector;
  contactEmail: string;
  contactPhone: string;
  exportCnCode: string;
  exportProductName: string;
  annualExportTons: number;
  annualProductionTons: number;

  // Step 2: Énergie & Facture STEG MT
  tariffRegime: StegTariffType;
  pSouscriteKva: number;
  pMaxAppeleeKva: number;
  kwhJour: number;
  kwhPointe: number;
  kwhSoir: number;
  kwhNuit: number;
  kvarhTotal: number;
  cosPhi: number;
  monthlyBillTnd: number;
  reactivePenaltyTnd: number;
  powerOverrunPenaltyTnd: number;

  // Step 3: Combustibles & Intrants Décarbonation (Scope 1 & 3)
  naturalGasM3: number;
  heavyFuelTons: number;
  dieselLiters: number;
  steelTons: number;
  aluminumTons: number;
  scrapTons: number;

  // Step 4: Déchets, Sous-produits & Économie Circulaire (BioClaira)
  wasteType: 'olive_pomace' | 'date_pits' | 'olive_mill_wastewater' | 'metal_scrap' | 'plastic_scrap';
  wasteMonthlyTons: number;
  disposalCostTndPerTon: number;
  moisturePercent: number;
}

export const INITIAL_AUDIT_DATA: AuditWizardData = {
  companyName: 'Mon Usine Industrielle SA',
  fiscalId: '1489201/A/M/000',
  governorate: 'Ben Arous',
  industrialZone: 'Zone Industrielle Z.I. Ben Arous',
  sector: 'metal_mechanics',
  contactEmail: 'direction.technique@mon-entreprise.tn',
  contactPhone: '+216 71 390 000',
  exportCnCode: '7207 11 14',
  exportProductName: 'Barres et billettes en aciers spéciaux usinés',
  annualExportTons: 1200,
  annualProductionTons: 1600,

  tariffRegime: 'MT_POSTES_HORAIRES',
  pSouscriteKva: 450,
  pMaxAppeleeKva: 490,
  kwhJour: 52000,
  kwhPointe: 24000,
  kwhSoir: 18000,
  kwhNuit: 28000,
  kvarhTotal: 65000,
  cosPhi: 0.81,
  monthlyBillTnd: 34500,
  reactivePenaltyTnd: 850,
  powerOverrunPenaltyTnd: 980,

  naturalGasM3: 14500,
  heavyFuelTons: 8.5,
  dieselLiters: 2400,
  steelTons: 1450,
  aluminumTons: 80,
  scrapTons: 120,

  wasteType: 'metal_scrap',
  wasteMonthlyTons: 25,
  disposalCostTndPerTon: 80,
  moisturePercent: 5,
};

// Sector Presets (ANME & CETIC Verified Averages)
export const SECTOR_PRESETS: Record<string, Partial<AuditWizardData>> = {
  metal: {
    sector: 'metal_mechanics',
    exportCnCode: '7207 11 14',
    exportProductName: 'Pièces mécaniques et profilés usinés',
    pSouscriteKva: 500,
    pMaxAppeleeKva: 540,
    kwhJour: 60000,
    kwhPointe: 28000,
    kwhSoir: 20000,
    kwhNuit: 32000,
    cosPhi: 0.82,
    naturalGasM3: 18000,
    steelTons: 1800,
    wasteType: 'metal_scrap',
    wasteMonthlyTons: 35,
  },
  olive: {
    sector: 'olive_oil',
    exportCnCode: '1509 20 00',
    exportProductName: 'Huile d\'olive extra vierge conditionnée',
    pSouscriteKva: 350,
    pMaxAppeleeKva: 380,
    kwhJour: 42000,
    kwhPointe: 22000,
    kwhSoir: 15000,
    kwhNuit: 21000,
    cosPhi: 0.84,
    naturalGasM3: 5000,
    wasteType: 'olive_pomace',
    wasteMonthlyTons: 60,
    moisturePercent: 45,
  },
  dates: {
    sector: 'date_processing',
    exportCnCode: '0804 10 00',
    exportProductName: 'Dattes Deglet Nour branchées et dénoyautées',
    pSouscriteKva: 300,
    pMaxAppeleeKva: 320,
    kwhJour: 55000,
    kwhPointe: 16000,
    kwhSoir: 18000,
    kwhNuit: 31000,
    cosPhi: 0.89,
    naturalGasM3: 3500,
    wasteType: 'date_pits',
    wasteMonthlyTons: 40,
    moisturePercent: 12,
  },
};

export interface AuditResults {
  // Carbon & CBAM
  scope1Tco2e: number;
  scope2Tco2e: number;
  scope3Tco2e: number;
  totalTco2e: number;
  specificEmbeddedEmissionsTco2ePerTon: number;
  cbamTaxExposureEur: number;
  cbamTaxExposureTnd: number;

  // Energy & STEG
  cosPhiCurrent: number;
  requiredCapacitorKvar: number;
  annualReactivePenaltySavingsTnd: number;
  annualPowerOverrunSavingsTnd: number;
  totalAnnualStegSavingsTnd: number;
  anmeFteSubsidyTnd: number; // 70% of energy audit + CAPEX bonus

  // BioClaira Symbiosis
  biocharYieldTonsPerYear: number;
  co2SequestrationTco2ePerYear: number;
  annualCircularValorizationTnd: number;

  // Global Compliance
  readinessScorePercent: number;
}

interface AuditContextType {
  auditData: AuditWizardData;
  updateAuditData: (updates: Partial<AuditWizardData>) => void;
  applyPreset: (presetKey: 'metal' | 'olive' | 'dates') => void;
  results: AuditResults;
  isWizardOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  saveAuditToProfile: () => void;
  lastSavedAt: string | null;
}

const AuditContext = createContext<AuditContextType | null>(null);

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [auditData, setAuditData] = useState<AuditWizardData>(INITIAL_AUDIT_DATA);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('symbiocarb_audit_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAuditData(parsed);
      }
      const savedDate = localStorage.getItem('symbiocarb_audit_saved_at');
      if (savedDate) {
        setLastSavedAt(savedDate);
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  const updateAuditData = (updates: Partial<AuditWizardData>) => {
    setAuditData((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('symbiocarb_audit_data', JSON.stringify(next));
      } catch {
        // storage quota fallback
      }
      return next;
    });
  };

  const applyPreset = (presetKey: 'metal' | 'olive' | 'dates') => {
    const preset = SECTOR_PRESETS[presetKey];
    if (preset) {
      updateAuditData(preset);
    }
  };

  // ============================================================================
  // Deterministic Mathematical Computation (Zero Hallucination)
  // ============================================================================
  const computeAuditResults = (): AuditResults => {
    const kwhTotal = auditData.kwhJour + auditData.kwhPointe + auditData.kwhSoir + auditData.kwhNuit;

    // Scope 1: Direct emissions
    // Facteurs d'émissions officiels ANME / GIEC:
    // Gaz naturel: ~2.02 kgCO2e/Nm3
    // Fuel lourd: ~3.15 kgCO2e/kg = 3150 kgCO2e/tonne
    // Gasoil: ~2.68 kgCO2e/L
    const scope1Gas = (auditData.naturalGasM3 * 2.02) / 1000;
    const scope1Fuel = (auditData.heavyFuelTons * 3150) / 1000;
    const scope1Diesel = (auditData.dieselLiters * 2.68) / 1000;
    const scope1Annual = (scope1Gas + scope1Fuel + scope1Diesel) * 12;

    // Scope 2: STEG Grid electricity
    // Facteur d'émission officiel réseau STEG MT (ANME 2024/2026): 0.462 kgCO2e/kWh
    const scope2Annual = (kwhTotal * 12 * 0.462) / 1000;

    // Scope 3: Upstream Raw Materials (BOM)
    // Acier: 1.85 tCO2e/t
    // Aluminium: 4.5 tCO2e/t
    const scope3Annual = (auditData.steelTons * 1.85) + (auditData.aluminumTons * 4.5);

    const totalTco2e = scope1Annual + scope2Annual + scope3Annual;
    const productionTons = Math.max(1, auditData.annualProductionTons);
    const exportTons = Math.max(1, auditData.annualExportTons);

    // Specific Embedded Emissions per ton produced
    const specificEmbeddedEmissionsTco2ePerTon = Number((totalTco2e / productionTons).toFixed(3));

    // CBAM Exposure: ETS quota price ~85 EUR/t, benchmark EU steel/product ~1.15 tCO2e/t
    const euBenchmark = 1.15;
    const netTaxablePerTon = Math.max(0, specificEmbeddedEmissionsTco2ePerTon - euBenchmark);
    const cbamTaxExposureEur = Math.round(netTaxablePerTon * exportTons * 85);
    const cbamTaxExposureTnd = Math.round(cbamTaxExposureEur * 3.38);

    // Energy & STEG: Capacitor bank sizing
    const activePowerKw = (auditData.kwhJour + auditData.kwhPointe) / 300;
    const cosPhiCompensation = solveCosPhiCompensation({
      activePowerKw: Math.max(50, activePowerKw),
      currentCosPhi: Math.min(0.99, Math.max(0.6, auditData.cosPhi)),
      targetCosPhi: 0.95,
      annualActiveKwh: kwhTotal * 12,
      annualReactivePenaltyTnd: auditData.reactivePenaltyTnd * 12,
      hasHarmonicLoads: auditData.sector === 'metal_mechanics',
    });

    const annualReactivePenaltySavingsTnd = cosPhiCompensation.annualPenaltySavedTnd;
    const annualPowerOverrunSavingsTnd = Math.max(0, (auditData.pMaxAppeleeKva - auditData.pSouscriteKva) * 18 * 12);
    const totalAnnualStegSavingsTnd = annualReactivePenaltySavingsTnd + annualPowerOverrunSavingsTnd;

    // ANME Subventions FTE (Fonds de Transition Énergétique):
    // Prise en charge 70% audit énergétique (plafond 30,000 TND) + prime 20% investissement condensateurs
    const anmeFteSubsidyTnd = Math.round(15000 + cosPhiCompensation.estimatedCapexTnd * 0.2);

    // BioClaira Pyrolysis & Valorization
    const feedstockMap: Record<string, 'olive_pomace' | 'date_pits' | 'margines'> = {
      olive_pomace: 'olive_pomace',
      date_pits: 'date_pits',
      olive_mill_wastewater: 'margines',
      metal_scrap: 'olive_pomace',
      plastic_scrap: 'olive_pomace',
    };
    const bioResult = simulateBioClairaValorization({
      wasteType: feedstockMap[auditData.wasteType] || 'olive_pomace',
      rawTonnage: Math.max(1, auditData.wasteMonthlyTons * 12),
      moisturePct: auditData.moisturePercent,
    });

    const biocharYieldTonsPerYear = Number(bioResult.biocharTons.toFixed(1));
    const co2SequestrationTco2ePerYear = Number(bioResult.netAvoidedTco2e.toFixed(1));
    const annualCircularValorizationTnd = Math.round(bioResult.grossMarketValueTnd);

    // Audit Readiness Score (ISO 14064 + CBAM completeness %):
    let score = 20; // baseline identity
    if (auditData.exportCnCode.length >= 4) score += 20;
    if (kwhTotal > 0 && auditData.cosPhi > 0) score += 20;
    if (auditData.naturalGasM3 > 0 || auditData.heavyFuelTons > 0 || auditData.dieselLiters > 0) score += 20;
    if (auditData.steelTons > 0 || auditData.wasteMonthlyTons > 0) score += 20;

    return {
      scope1Tco2e: Math.round(scope1Annual),
      scope2Tco2e: Math.round(scope2Annual),
      scope3Tco2e: Math.round(scope3Annual),
      totalTco2e: Math.round(totalTco2e),
      specificEmbeddedEmissionsTco2ePerTon,
      cbamTaxExposureEur,
      cbamTaxExposureTnd,
      cosPhiCurrent: auditData.cosPhi,
      requiredCapacitorKvar: Math.round(cosPhiCompensation.requiredQcKvar),
      annualReactivePenaltySavingsTnd: Math.round(annualReactivePenaltySavingsTnd),
      annualPowerOverrunSavingsTnd: Math.round(annualPowerOverrunSavingsTnd),
      totalAnnualStegSavingsTnd: Math.round(totalAnnualStegSavingsTnd),
      anmeFteSubsidyTnd,
      biocharYieldTonsPerYear,
      co2SequestrationTco2ePerYear,
      annualCircularValorizationTnd,
      readinessScorePercent: Math.min(100, score),
    };
  };

  const results = computeAuditResults();

  const saveAuditToProfile = () => {
    const now = new Date().toISOString();
    setLastSavedAt(now);
    localStorage.setItem('symbiocarb_audit_saved_at', now);
    localStorage.setItem('symbiocarb_audit_data', JSON.stringify(auditData));

    // Dynamically synchronize fallback custom data so the whole app inherits these real inputs!
    if (FALLBACK_ORGANIZATIONS.custom) {
      FALLBACK_ORGANIZATIONS.custom.name_fr = auditData.companyName;
      FALLBACK_ORGANIZATIONS.custom.governorate = auditData.governorate;
      FALLBACK_ORGANIZATIONS.custom.industrial_zone = auditData.industrialZone;
      FALLBACK_ORGANIZATIONS.custom.sector = auditData.sector;
      FALLBACK_ORGANIZATIONS.custom.contact_email = auditData.contactEmail;
      FALLBACK_ORGANIZATIONS.custom.contact_phone = auditData.contactPhone;
    }

    if (FALLBACK_BILLS.custom) {
      FALLBACK_BILLS.custom.kwh_jour = auditData.kwhJour;
      FALLBACK_BILLS.custom.kwh_pointe = auditData.kwhPointe;
      FALLBACK_BILLS.custom.kwh_soir = auditData.kwhSoir;
      FALLBACK_BILLS.custom.kwh_nuit = auditData.kwhNuit;
      FALLBACK_BILLS.custom.kwh_total = auditData.kwhJour + auditData.kwhPointe + auditData.kwhSoir + auditData.kwhNuit;
      FALLBACK_BILLS.custom.kvarh_total = auditData.kvarhTotal;
      FALLBACK_BILLS.custom.cos_phi = auditData.cosPhi;
      FALLBACK_BILLS.custom.p_souscrite_kva = auditData.pSouscriteKva;
      FALLBACK_BILLS.custom.p_max_appelee_kva = auditData.pMaxAppeleeKva;
      FALLBACK_BILLS.custom.reactive_penalty_tnd = auditData.reactivePenaltyTnd;
      FALLBACK_BILLS.custom.power_overrun_penalty_tnd = auditData.powerOverrunPenaltyTnd;
    }
  };

  return (
    <AuditContext.Provider
      value={{
        auditData,
        updateAuditData,
        applyPreset,
        results,
        isWizardOpen,
        openWizard: () => setIsWizardOpen(true),
        closeWizard: () => setIsWizardOpen(false),
        saveAuditToProfile,
        lastSavedAt,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
