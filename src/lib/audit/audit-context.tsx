'use client';

// ==============================================================================
// SymbioCarb AI - Industrial Factory Data & Deterministic Calculation Context
// Strict zero-state initialization: no demo personas, no fake defaults, no NaN.
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector, StegTariffType } from '@/types';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';
import { simulateBioClairaValorization } from '@/lib/engine/bioclaira-simulator';
import { useAuth } from '@/lib/auth/auth-context';

export interface MonthlyBillEntry {
  id: string;
  month: number;
  year: number;
  districtSteg?: string;
  tariffRegime: StegTariffType;
  pSouscriteKva: number;
  pMaxAppeleeKva: number;
  kwhJour: number;
  kwhPointe: number;
  kwhSoir: number;
  kwhNuit: number;
  kvarhTotal: number;
  cosPhi: number;
  reactivePenaltyTnd: number;
  powerOverrunPenaltyTnd: number;
  totalTtcTnd: number;
  source: 'manual' | 'ocr' | 'csv';
}

export interface BomMaterialEntry {
  id: string;
  name: string;
  cnCode8: string;
  quantityTons: number;
  efTco2ePerTon: number;
}

export type WasteStreamType =
  | 'olive_pomace'
  | 'date_pits'
  | 'olive_mill_wastewater'
  | 'metal_scrap'
  | 'plastic_scrap';

export interface AuditWizardData {
  // 1. Identité & Profil Usine
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

  // 2. Énergie & Facture STEG MT (Période active / moyenne mensuelle)
  tariffRegime: StegTariffType;
  districtSteg: string;
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

  // 3. Combustibles & Intrants CBAM (Scope 1 & Scope 3)
  naturalGasM3: number;
  heavyFuelTons: number;
  dieselLiters: number;
  steelTons: number;
  aluminumTons: number;
  scrapTons: number;

  // 4. BioClaira (Audit Déchet Séparé - Pack Gold)
  wasteType: WasteStreamType;
  wasteMonthlyTons: number;
  disposalCostTndPerTon: number;
  moisturePercent: number;

  // 5. Historique multi-périodes & Nomenclature BOM
  monthlyBills: MonthlyBillEntry[];
  bomMaterials: BomMaterialEntry[];
}

export const INITIAL_AUDIT_DATA: AuditWizardData = {
  companyName: '',
  fiscalId: '',
  governorate: '',
  industrialZone: '',
  sector: 'metal_mechanics',
  contactEmail: '',
  contactPhone: '',
  exportCnCode: '',
  exportProductName: '',
  annualExportTons: 0,
  annualProductionTons: 0,

  tariffRegime: 'MT_POSTES_HORAIRES',
  districtSteg: '',
  pSouscriteKva: 0,
  pMaxAppeleeKva: 0,
  kwhJour: 0,
  kwhPointe: 0,
  kwhSoir: 0,
  kwhNuit: 0,
  kvarhTotal: 0,
  cosPhi: 0,
  monthlyBillTnd: 0,
  reactivePenaltyTnd: 0,
  powerOverrunPenaltyTnd: 0,

  naturalGasM3: 0,
  heavyFuelTons: 0,
  dieselLiters: 0,
  steelTons: 0,
  aluminumTons: 0,
  scrapTons: 0,

  wasteType: 'olive_pomace',
  wasteMonthlyTons: 0,
  disposalCostTndPerTon: 0,
  moisturePercent: 0,

  monthlyBills: [],
  bomMaterials: [],
};

export interface AuditResults {
  hasEnergyData: boolean;
  hasCarbonData: boolean;
  hasWasteData: boolean;
  hasAnyData: boolean;

  // Energy totals & shares
  kwhTotal: number;
  pctJour: number;
  pctPointe: number;
  pctSoir: number;
  pctNuit: number;
  estimatedMonthlyStegTnd: number;

  // Carbon & CBAM
  scope1Tco2e: number;
  scope2Tco2e: number;
  scope3Tco2e: number;
  totalTco2e: number;
  specificEmbeddedEmissionsTco2ePerTon: number;
  cbamTaxExposureEur: number;
  cbamTaxExposureTnd: number;

  // STEG Optimization
  cosPhiCurrent: number;
  requiredCapacitorKvar: number;
  annualReactivePenaltySavingsTnd: number;
  annualPowerOverrunSavingsTnd: number;
  totalAnnualStegSavingsTnd: number;
  anmeFteSubsidyTnd: number;

  // BioClaira (Gold Option)
  biocharYieldTonsPerYear: number;
  co2SequestrationTco2ePerYear: number;
  annualCircularValorizationTnd: number;

  // Global Readiness
  readinessScorePercent: number;
}

interface AuditContextType {
  auditData: AuditWizardData;
  updateAuditData: (updates: Partial<AuditWizardData>) => void;
  addMonthlyBill: (bill: Omit<MonthlyBillEntry, 'id'>) => void;
  importMonthlyBills: (bills: Omit<MonthlyBillEntry, 'id'>[]) => void;
  removeMonthlyBill: (id: string) => void;
  addBomMaterial: (material: Omit<BomMaterialEntry, 'id'>) => void;
  removeBomMaterial: (id: string) => void;
  resetAuditData: () => void;
  results: AuditResults;
  isAddDataOpen: boolean;
  addDataInitialTab: 'steg' | 'cbam' | 'profile';
  openAddDataModal: (tab?: 'steg' | 'cbam' | 'profile') => void;
  closeAddDataModal: () => void;
  saveAuditToProfile: () => void;
  lastSavedAt: string | null;
}

const AuditContext = createContext<AuditContextType | null>(null);

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [auditData, setAuditData] = useState<AuditWizardData>(INITIAL_AUDIT_DATA);
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);
  const [addDataInitialTab, setAddDataInitialTab] = useState<'steg' | 'cbam' | 'profile'>('steg');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const storageKey = user?.id ? `symbiocarb_factory_data_${user.id}` : null;
  const savedAtKey = user?.id ? `symbiocarb_factory_saved_at_${user.id}` : null;

  // Hydrate factory data scoped strictly to the authenticated user (or clean zero-state)
  useEffect(() => {
    if (!isAuthenticated || !storageKey) {
      setAuditData(INITIAL_AUDIT_DATA);
      setLastSavedAt(null);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAuditData({
          ...INITIAL_AUDIT_DATA,
          ...parsed,
          monthlyBills: Array.isArray(parsed.monthlyBills) ? parsed.monthlyBills : [],
          bomMaterials: Array.isArray(parsed.bomMaterials) ? parsed.bomMaterials : [],
        });
      } else {
        setAuditData({
          ...INITIAL_AUDIT_DATA,
          contactEmail: user?.email || '',
        });
      }
      if (savedAtKey) {
        const savedDate = localStorage.getItem(savedAtKey);
        setLastSavedAt(savedDate || null);
      }
    } catch {
      setAuditData(INITIAL_AUDIT_DATA);
    }
  }, [isAuthenticated, storageKey, savedAtKey, user?.email]);

  const persistData = (next: AuditWizardData) => {
    const now = new Date().toISOString();
    setLastSavedAt(now);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        if (savedAtKey) localStorage.setItem(savedAtKey, now);
      } catch {
        // ignore quota errors
      }
    }
  };

  const updateAuditData = (updates: Partial<AuditWizardData>) => {
    setAuditData((prev) => {
      const next = { ...prev, ...updates };
      persistData(next);
      return next;
    });
  };

  const syncSummaryFromBills = (bills: MonthlyBillEntry[], prev: AuditWizardData): Partial<AuditWizardData> => {
    if (bills.length === 0) return {};
    const sorted = [...bills].sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
    const latest = sorted[0];
    const count = bills.length;
    const avg = (fn: (b: MonthlyBillEntry) => number) =>
      Math.round((bills.reduce((acc, b) => acc + fn(b), 0) / count) * 100) / 100;

    return {
      tariffRegime: latest.tariffRegime,
      districtSteg: latest.districtSteg || prev.districtSteg,
      pSouscriteKva: latest.pSouscriteKva,
      pMaxAppeleeKva: Math.max(...bills.map((b) => b.pMaxAppeleeKva)),
      kwhJour: Math.round(avg((b) => b.kwhJour)),
      kwhPointe: Math.round(avg((b) => b.kwhPointe)),
      kwhSoir: Math.round(avg((b) => b.kwhSoir)),
      kwhNuit: Math.round(avg((b) => b.kwhNuit)),
      kvarhTotal: Math.round(avg((b) => b.kvarhTotal)),
      cosPhi: Number((bills.reduce((acc, b) => acc + b.cosPhi, 0) / count).toFixed(3)),
      reactivePenaltyTnd: avg((b) => b.reactivePenaltyTnd),
      powerOverrunPenaltyTnd: avg((b) => b.powerOverrunPenaltyTnd),
      monthlyBillTnd: avg((b) => b.totalTtcTnd),
    };
  };

  const addMonthlyBill = (bill: Omit<MonthlyBillEntry, 'id'>) => {
    setAuditData((prev) => {
      const newEntry: MonthlyBillEntry = {
        ...bill,
        id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const updatedBills = [newEntry, ...prev.monthlyBills];
      const synced = syncSummaryFromBills(updatedBills, prev);
      const next: AuditWizardData = { ...prev, ...synced, monthlyBills: updatedBills };
      persistData(next);
      return next;
    });
  };

  const importMonthlyBills = (bills: Omit<MonthlyBillEntry, 'id'>[]) => {
    if (bills.length === 0) return;
    setAuditData((prev) => {
      const newEntries: MonthlyBillEntry[] = bills.map((b, idx) => ({
        ...b,
        id: `bill-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
      }));
      const updatedBills = [...newEntries, ...prev.monthlyBills];
      const synced = syncSummaryFromBills(updatedBills, prev);
      const next: AuditWizardData = { ...prev, ...synced, monthlyBills: updatedBills };
      persistData(next);
      return next;
    });
  };

  const removeMonthlyBill = (id: string) => {
    setAuditData((prev) => {
      const updatedBills = prev.monthlyBills.filter((b) => b.id !== id);
      const synced = updatedBills.length > 0 ? syncSummaryFromBills(updatedBills, prev) : {
        kwhJour: 0,
        kwhPointe: 0,
        kwhSoir: 0,
        kwhNuit: 0,
        kvarhTotal: 0,
        cosPhi: 0,
        pSouscriteKva: 0,
        pMaxAppeleeKva: 0,
        reactivePenaltyTnd: 0,
        powerOverrunPenaltyTnd: 0,
        monthlyBillTnd: 0,
      };
      const next: AuditWizardData = { ...prev, ...synced, monthlyBills: updatedBills };
      persistData(next);
      return next;
    });
  };

  const addBomMaterial = (material: Omit<BomMaterialEntry, 'id'>) => {
    setAuditData((prev) => {
      const newEntry: BomMaterialEntry = {
        ...material,
        id: `bom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const next = { ...prev, bomMaterials: [...prev.bomMaterials, newEntry] };
      persistData(next);
      return next;
    });
  };

  const removeBomMaterial = (id: string) => {
    setAuditData((prev) => {
      const next = {
        ...prev,
        bomMaterials: prev.bomMaterials.filter((m) => m.id !== id),
      };
      persistData(next);
      return next;
    });
  };

  const resetAuditData = () => {
    const clean = { ...INITIAL_AUDIT_DATA, contactEmail: user?.email || '' };
    setAuditData(clean);
    persistData(clean);
  };

  const computeAuditResults = (): AuditResults => {
    const kwhTotal = auditData.kwhJour + auditData.kwhPointe + auditData.kwhSoir + auditData.kwhNuit;
    const hasEnergyData = kwhTotal > 0 || auditData.monthlyBillTnd > 0 || auditData.monthlyBills.length > 0;

    // Safe percentages
    const pctJour = kwhTotal > 0 ? Number(((auditData.kwhJour / kwhTotal) * 100).toFixed(1)) : 0;
    const pctPointe = kwhTotal > 0 ? Number(((auditData.kwhPointe / kwhTotal) * 100).toFixed(1)) : 0;
    const pctSoir = kwhTotal > 0 ? Number(((auditData.kwhSoir / kwhTotal) * 100).toFixed(1)) : 0;
    const pctNuit = kwhTotal > 0 ? Number(((auditData.kwhNuit / kwhTotal) * 100).toFixed(1)) : 0;

    // STEG monthly bill calculation (only when energy data exists)
    let estimatedMonthlyStegTnd = 0;
    if (kwhTotal > 0) {
      const tariffCalc = calculateStegMtBill({
        kwhJour: auditData.kwhJour,
        kwhPointe: auditData.kwhPointe,
        kwhSoir: auditData.kwhSoir,
        kwhNuit: auditData.kwhNuit,
        kvarhTotal: auditData.kvarhTotal,
        pSouscriteKva: auditData.pSouscriteKva,
        pMaxAppeleeKva: auditData.pMaxAppeleeKva,
        tariffRegime: auditData.tariffRegime,
      });
      estimatedMonthlyStegTnd = auditData.monthlyBillTnd > 0 ? auditData.monthlyBillTnd : Math.round(tariffCalc.totalTtcTnd);
    } else if (auditData.monthlyBillTnd > 0) {
      estimatedMonthlyStegTnd = auditData.monthlyBillTnd;
    }

    // Scope 1: Direct Fuel Emissions (annualized from monthly consumption)
    const scope1Gas = (auditData.naturalGasM3 * 2.02) / 1000;
    const scope1Fuel = (auditData.heavyFuelTons * 3150) / 1000;
    const scope1Diesel = (auditData.dieselLiters * 2.68) / 1000;
    const scope1Annual = (scope1Gas + scope1Fuel + scope1Diesel) * 12;

    // Scope 2: STEG Grid electricity (ANME/STEG factor: 0.473 kgCO2e/kWh)
    const scope2Annual = (kwhTotal * 12 * 0.473) / 1000;

    // Scope 3: Upstream BOM Materials
    const bomDynamicTco2e = auditData.bomMaterials.reduce(
      (sum, item) => sum + item.quantityTons * item.efTco2ePerTon,
      0
    );
    const legacyScope3 = auditData.steelTons * 1.85 + auditData.aluminumTons * 4.5;
    const scope3Annual = bomDynamicTco2e + legacyScope3;

    const totalTco2e = scope1Annual + scope2Annual + scope3Annual;
    const hasCarbonData = totalTco2e > 0 || auditData.annualProductionTons > 0;

    // Specific Embedded Emissions (strict 0 guard)
    const specificEmbeddedEmissionsTco2ePerTon =
      auditData.annualProductionTons > 0
        ? Number((totalTco2e / auditData.annualProductionTons).toFixed(3))
        : 0;

    // CBAM Tax Exposure (only when production & export volumes exist)
    const euBenchmark = 1.15;
    const netTaxablePerTon =
      specificEmbeddedEmissionsTco2ePerTon > 0
        ? Math.max(0, specificEmbeddedEmissionsTco2ePerTon - euBenchmark)
        : 0;
    const cbamTaxExposureEur =
      auditData.annualExportTons > 0
        ? Math.round(netTaxablePerTon * auditData.annualExportTons * 85)
        : 0;
    const cbamTaxExposureTnd = Math.round(cbamTaxExposureEur * 3.38);

    // Capacitor Bank & STEG Savings (strict 0 guard when no STEG inputs)
    let requiredCapacitorKvar = 0;
    let annualReactivePenaltySavingsTnd = 0;
    let annualPowerOverrunSavingsTnd = 0;
    let totalAnnualStegSavingsTnd = 0;
    let anmeFteSubsidyTnd = 0;

    if (kwhTotal > 0 && auditData.cosPhi > 0 && auditData.cosPhi < 0.95) {
      const activePowerKw = (auditData.kwhJour + auditData.kwhPointe) / 300;
      if (activePowerKw > 0) {
        const cosPhiCompensation = solveCosPhiCompensation({
          activePowerKw,
          currentCosPhi: Math.min(0.99, Math.max(0.5, auditData.cosPhi)),
          targetCosPhi: 0.95,
          annualActiveKwh: kwhTotal * 12,
          annualReactivePenaltyTnd: auditData.reactivePenaltyTnd * 12,
          hasHarmonicLoads: auditData.sector === 'metal_mechanics',
        });
        requiredCapacitorKvar = Math.round(cosPhiCompensation.requiredQcKvar);
        annualReactivePenaltySavingsTnd = Math.round(cosPhiCompensation.annualPenaltySavedTnd);
        anmeFteSubsidyTnd = Math.round(cosPhiCompensation.estimatedCapexTnd * 0.2);
      }
    } else if (auditData.reactivePenaltyTnd > 0) {
      annualReactivePenaltySavingsTnd = Math.round(auditData.reactivePenaltyTnd * 12);
    }

    if (auditData.pMaxAppeleeKva > auditData.pSouscriteKva && auditData.pSouscriteKva > 0) {
      annualPowerOverrunSavingsTnd = Math.round(
        (auditData.pMaxAppeleeKva - auditData.pSouscriteKva) * 25 * 12
      );
    }

    totalAnnualStegSavingsTnd = annualReactivePenaltySavingsTnd + annualPowerOverrunSavingsTnd;

    // BioClaira Waste Valorization (strict 0 guard when no waste entered)
    const hasWasteData = auditData.wasteMonthlyTons > 0;
    let biocharYieldTonsPerYear = 0;
    let co2SequestrationTco2ePerYear = 0;
    let annualCircularValorizationTnd = 0;

    if (hasWasteData) {
      const feedstockMap: Record<WasteStreamType, 'olive_pomace' | 'date_pits' | 'margines' | 'metal_shavings' | 'hdpe_plastic'> = {
        olive_pomace: 'olive_pomace',
        date_pits: 'date_pits',
        olive_mill_wastewater: 'margines',
        metal_scrap: 'metal_shavings',
        plastic_scrap: 'hdpe_plastic',
      };
      const bioResult = simulateBioClairaValorization({
        wasteType: feedstockMap[auditData.wasteType] || 'olive_pomace',
        rawTonnage: auditData.wasteMonthlyTons * 12,
        moisturePct: auditData.moisturePercent || undefined,
      });
      biocharYieldTonsPerYear = Number((bioResult.biocharTons + bioResult.activatedCarbonTons).toFixed(1));
      co2SequestrationTco2ePerYear = Number(bioResult.netAvoidedTco2e.toFixed(1));
      annualCircularValorizationTnd = Math.round(bioResult.netAnnualProfitTnd);
    }

    // Readiness Score (0% when untouched)
    let score = 0;
    if (auditData.companyName.trim().length > 1) score += 20;
    if (auditData.exportCnCode.trim().length >= 4 && auditData.annualProductionTons > 0) score += 25;
    if (kwhTotal > 0 && auditData.cosPhi > 0) score += 30;
    if (auditData.naturalGasM3 > 0 || auditData.heavyFuelTons > 0 || auditData.dieselLiters > 0) score += 15;
    if (auditData.bomMaterials.length > 0 || auditData.steelTons > 0 || auditData.aluminumTons > 0) score += 10;

    return {
      hasEnergyData,
      hasCarbonData,
      hasWasteData,
      hasAnyData: hasEnergyData || hasCarbonData || hasWasteData || auditData.companyName.trim().length > 0,
      kwhTotal,
      pctJour,
      pctPointe,
      pctSoir,
      pctNuit,
      estimatedMonthlyStegTnd,
      scope1Tco2e: Number(scope1Annual.toFixed(2)),
      scope2Tco2e: Number(scope2Annual.toFixed(2)),
      scope3Tco2e: Number(scope3Annual.toFixed(2)),
      totalTco2e: Number(totalTco2e.toFixed(2)),
      specificEmbeddedEmissionsTco2ePerTon,
      cbamTaxExposureEur,
      cbamTaxExposureTnd,
      cosPhiCurrent: auditData.cosPhi,
      requiredCapacitorKvar,
      annualReactivePenaltySavingsTnd,
      annualPowerOverrunSavingsTnd,
      totalAnnualStegSavingsTnd,
      anmeFteSubsidyTnd,
      biocharYieldTonsPerYear,
      co2SequestrationTco2ePerYear,
      annualCircularValorizationTnd,
      readinessScorePercent: Math.min(100, score),
    };
  };

  const results = computeAuditResults();

  const saveAuditToProfile = () => {
    persistData(auditData);
  };

  const openAddDataModal = (tab: 'steg' | 'cbam' | 'profile' = 'steg') => {
    setAddDataInitialTab(tab);
    setIsAddDataOpen(true);
  };

  const closeAddDataModal = () => setIsAddDataOpen(false);

  return (
    <AuditContext.Provider
      value={{
        auditData,
        updateAuditData,
        addMonthlyBill,
        importMonthlyBills,
        removeMonthlyBill,
        addBomMaterial,
        removeBomMaterial,
        resetAuditData,
        results,
        isAddDataOpen,
        addDataInitialTab,
        openAddDataModal,
        closeAddDataModal,
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
