'use client';

// ==============================================================================
// SymbioCarb AI - Guided Industrial Audit Wizard (5-Step Express Audit)
// Transforms a 6-month consulting audit into a 5-minute deterministic AI workflow
// ==============================================================================

import React, { useState } from 'react';
import { useAudit } from '@/lib/audit/audit-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  Building2, 
  Zap, 
  Flame, 
  Recycle, 
  FileCheck2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  TrendingDown, 
  Scale, 
  Printer, 
  Download, 
  X, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { AuditReportDialog } from '@/components/cbam/AuditReportDialog';
import { CbamCalculationResult, BomEntry } from '@/types';

export function AuditWizardModal() {
  const { 
    auditData, 
    updateAuditData, 
    applyPreset, 
    results, 
    isWizardOpen, 
    closeWizard, 
    saveAuditToProfile 
  } = useAudit();

  const { setPersona } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [appliedPresetName, setAppliedPresetName] = useState<string | null>(null);

  if (!isWizardOpen) return null;

  const handleApplyPreset = (key: 'metal' | 'olive' | 'dates', label: string) => {
    applyPreset(key);
    setAppliedPresetName(label);
    setTimeout(() => setAppliedPresetName(null), 3000);
  };

  const handleFinishAndSave = () => {
    saveAuditToProfile();
    setPersona('custom');
    closeWizard();
  };

  // Convert audit results to CbamCalculationResult format for the official PDF report
  const cbamResultForPdf: CbamCalculationResult = {
    productName: auditData.exportProductName,
    cnCode8: auditData.exportCnCode,
    finishedProductTons: auditData.annualProductionTons,
    scope1DirectTco2e: results.scope1Tco2e,
    scope2IndirectTco2e: results.scope2Tco2e,
    scope3PrecursorsTco2e: results.scope3Tco2e,
    totalEmbeddedTco2e: results.totalTco2e,
    specificEmbeddedEmissionsTco2ePerTon: results.specificEmbeddedEmissionsTco2ePerTon,
    euEtsCarbonPriceEur: 85,
    estimatedCbamTaxLiabilityEur: results.cbamTaxExposureEur,
    estimatedCbamTaxLiabilityTnd: results.cbamTaxExposureTnd,
    freeAllocationBenchmarkGap: 0,
    verificationStatus: 'PRE_AUDIT_DRAFT',
    accreditationBodyId: 'TUNAC-ISO-14065-2026',
    auditIntegrityHash: 'SHA256-SC-AUDIT-2026-89410',
    regulatoryDisclaimer: 'Conforme Règlement UE 2023/956 & ISO 14064-1',
    gridEmissionSource: 'STEG_NATIONAL_GRID_MT',
  };

  const sampleBomEntries: BomEntry[] = [
    {
      id: 'bom-01',
      org_id: 'custom',
      raw_description: auditData.sector === 'metal_mechanics' ? 'Acier Spécial Billettes' : 'Emballages & Matières Premières',
      quantity: auditData.steelTons || 100,
      unit: 't',
      scope: 3,
      total_tco2e: results.scope3Tco2e,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
        <div 
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090D16] border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111827]/70">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Assistant d&apos;Audit Industriel & Décarbonation Express
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    5 Étapes
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Condense un audit énergétique ISO 50001 & conformité CBAM (6 mois de cabinet) en 5 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Readiness Score */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <div className="text-end">
                  <div className="text-[10px] text-slate-400 font-mono">Score d&apos;Audit</div>
                  <div className="text-xs font-bold font-mono text-emerald-400">
                    {results.readinessScorePercent}% Prêt
                  </div>
                </div>
              </div>

              <button 
                onClick={closeWizard}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-5 border-b border-white/10 bg-[#0B101B]">
            {[
              { num: 1, label: 'Profil Usine', icon: Building2 },
              { num: 2, label: 'Énergie STEG', icon: Zap },
              { num: 3, label: 'Combustibles & BOM', icon: Flame },
              { num: 4, label: 'Déchets BioClaira', icon: Recycle },
              { num: 5, label: 'Diagnostic Express', icon: FileCheck2 },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 text-center transition-all border-b-2 ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold'
                      : isPast
                        ? 'border-emerald-500/40 text-slate-300 hover:text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isActive
                      ? 'bg-emerald-500 text-black font-bold'
                      : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/10 text-slate-400'
                  }`}>
                    {isPast ? '✓' : step.num}
                  </div>
                  <span className="text-[11px] truncate">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preset Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-white/[0.02] border-b border-white/5 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-300">⚡ Remplissage rapide par secteur certifié :</span>
              {appliedPresetName && (
                <span className="text-emerald-400 font-mono animate-in fade-in">
                  ✓ Profil {appliedPresetName} appliqué !
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('metal', 'Métallurgie Ben Arous')}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] transition-all border border-white/5"
              >
                ⚙️ Métallurgie (Ben Arous)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('olive', 'Huilerie Sfax')}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] transition-all border border-white/5"
              >
                🫒 Huilerie (Sfax)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('dates', 'Dattes Tozeur')}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] transition-all border border-white/5"
              >
                🌴 Dattes (Tozeur)
              </button>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* STEP 1: PROFIL USINE & EXPORT UE (CBAM) */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-emerald-400">Périmètre Organisationnel (ISO 14064-1 & Règlement UE 2023/956) :</span> Définissez l&apos;identité de votre usine et vos produits exportés vers l&apos;UE pour le calcul de votre empreinte carbone spécifique par tonne.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Raison Sociale de l&apos;Usine / Entreprise
                    </label>
                    <input
                      type="text"
                      value={auditData.companyName}
                      onChange={(e) => updateAuditData({ companyName: e.target.value })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Matricule Fiscal Tunisien (MF)
                    </label>
                    <input
                      type="text"
                      value={auditData.fiscalId}
                      onChange={(e) => updateAuditData({ fiscalId: e.target.value })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gouvernorat & Zone Industrielle
                    </label>
                    <input
                      type="text"
                      value={`${auditData.governorate} - ${auditData.industrialZone}`}
                      onChange={(e) => updateAuditData({ industrialZone: e.target.value })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Secteur d&apos;Activité Principal
                    </label>
                    <select
                      value={auditData.sector}
                      onChange={(e) => updateAuditData({ sector: e.target.value as any })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="metal_mechanics">Métallurgie, Usinage & Mécanique (Assujetti CBAM)</option>
                      <option value="olive_oil">Agro-Alimentaire - Huilerie & Oléiculture</option>
                      <option value="date_processing">Agro-Alimentaire - Dattes & Fruits du Sud</option>
                      <option value="textile">Textile, Confection & Teinture</option>
                      <option value="chemicals">Chimie & Matériaux de Construction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Code Douanier CN (8 chiffres) du Produit Exporté
                    </label>
                    <input
                      type="text"
                      value={auditData.exportCnCode}
                      onChange={(e) => updateAuditData({ exportCnCode: e.target.value })}
                      placeholder="Ex: 7207 11 14 ou 1509 20 00"
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Désignation Commerciale du Produit Exporté
                    </label>
                    <input
                      type="text"
                      value={auditData.exportProductName}
                      onChange={(e) => updateAuditData({ exportProductName: e.target.value })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Volume Annuel Exporté vers l&apos;Union Européenne (Tonnes/an)
                    </label>
                    <input
                      type="number"
                      value={auditData.annualExportTons}
                      onChange={(e) => updateAuditData({ annualExportTons: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Production Totale de l&apos;Usine (Tonnes/an)
                    </label>
                    <input
                      type="number"
                      value={auditData.annualProductionTons}
                      onChange={(e) => updateAuditData({ annualProductionTons: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FACTURE & ENERGIE STEG MT */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 leading-relaxed flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-400">Profil Énergétique STEG MT (Moyenne Tension) :</span> Saisissez les données mensuelles de votre facture d&apos;électricité pour modéliser le cos φ, les pénalités réactives et les 4 tranches horaires.
                  </div>
                  <div className="hidden sm:block text-end">
                    <span className="text-[10px] font-mono text-amber-400/80">Arrêté Tarifaire STEG</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <label className="block text-[11px] text-slate-400 mb-1">Jour (نهار) kWh</label>
                    <input
                      type="number"
                      value={auditData.kwhJour}
                      onChange={(e) => updateAuditData({ kwhJour: Number(e.target.value) })}
                      className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">0.248 TND/kWh</div>
                  </div>

                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <label className="block text-[11px] text-red-300 font-bold mb-1">Pointe (ذروة) kWh</label>
                    <input
                      type="number"
                      value={auditData.kwhPointe}
                      onChange={(e) => updateAuditData({ kwhPointe: Number(e.target.value) })}
                      className="w-full bg-transparent text-sm font-mono font-bold text-red-400 focus:outline-none"
                    />
                    <div className="text-[10px] text-red-400/70 mt-1">0.412 TND/kWh (Pic)</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <label className="block text-[11px] text-slate-400 mb-1">Soir (مساء) kWh</label>
                    <input
                      type="number"
                      value={auditData.kwhSoir}
                      onChange={(e) => updateAuditData({ kwhSoir: Number(e.target.value) })}
                      className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">0.235 TND/kWh</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <label className="block text-[11px] text-slate-400 mb-1">Nuit (ليل) kWh</label>
                    <input
                      type="number"
                      value={auditData.kwhNuit}
                      onChange={(e) => updateAuditData({ kwhNuit: Number(e.target.value) })}
                      className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">0.188 TND/kWh (Creux)</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Puissance Souscrite (Ps en kVA / kW)
                    </label>
                    <input
                      type="number"
                      value={auditData.pSouscriteKva}
                      onChange={(e) => updateAuditData({ pSouscriteKva: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Puissance Max Atteinte (Pmax en kVA)
                    </label>
                    <input
                      type="number"
                      value={auditData.pMaxAppeleeKva}
                      onChange={(e) => updateAuditData({ pMaxAppeleeKva: Number(e.target.value) })}
                      className={`w-full rounded-lg bg-black/40 border px-3 py-2 text-sm font-mono focus:outline-none ${
                        auditData.pMaxAppeleeKva > auditData.pSouscriteKva 
                          ? 'border-red-500/50 text-red-400' 
                          : 'border-white/10 text-white'
                      }`}
                    />
                    {auditData.pMaxAppeleeKva > auditData.pSouscriteKva && (
                      <span className="text-[10px] text-red-400 mt-1 block">
                        ⚠️ Dépassement détecté ({auditData.pMaxAppeleeKva - auditData.pSouscriteKva} kVA)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Facteur de Puissance (cos φ mesuré)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="1.0"
                      value={auditData.cosPhi}
                      onChange={(e) => updateAuditData({ cosPhi: Number(e.target.value) })}
                      className={`w-full rounded-lg bg-black/40 border px-3 py-2 text-sm font-mono font-bold focus:outline-none ${
                        auditData.cosPhi < 0.8
                          ? 'border-red-500 text-red-400'
                          : auditData.cosPhi < 0.95
                            ? 'border-amber-500 text-amber-400'
                            : 'border-emerald-500 text-emerald-400'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Seuil légal STEG : cos φ ≥ 0.80 (Cible optimale : 0.95)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pénalité Énergie Réactive Mensuelle (TND)
                    </label>
                    <input
                      type="number"
                      value={auditData.reactivePenaltyTnd}
                      onChange={(e) => updateAuditData({ reactivePenaltyTnd: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pénalité Dépassement de Puissance (TND)
                    </label>
                    <input
                      type="number"
                      value={auditData.powerOverrunPenaltyTnd}
                      onChange={(e) => updateAuditData({ powerOverrunPenaltyTnd: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: COMBUSTIBLES & INTRANTS (SCOPE 1 & 3) */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-blue-400">Émissions Directes (Scope 1) & Précurseurs CBAM (Scope 3) :</span> Déclarez vos combustibles brûlés sur site et vos achats de matières premières clés selon les facteurs d&apos;émissions de référence.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gaz Naturel STEG ($Nm^3$/mois)
                    </label>
                    <input
                      type="number"
                      value={auditData.naturalGasM3}
                      onChange={(e) => updateAuditData({ naturalGasM3: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Facteur : 2.02 kgCO₂e/Nm³</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fuel Lourd N°2 (Tonnes/mois)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={auditData.heavyFuelTons}
                      onChange={(e) => updateAuditData({ heavyFuelTons: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Facteur : 3 150 kgCO₂e/t</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gasoil Chariots / Groupes (Litres/mois)
                    </label>
                    <input
                      type="number"
                      value={auditData.dieselLiters}
                      onChange={(e) => updateAuditData({ dieselLiters: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Facteur : 2.68 kgCO₂e/L</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold text-slate-200 mb-3">Matières Premières Entrantes & Nomenclature (BOM CBAM)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Acier / Billettes (Tonnes/an)
                      </label>
                      <input
                        type="number"
                        value={auditData.steelTons}
                        onChange={(e) => updateAuditData({ steelTons: Number(e.target.value) })}
                        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Facteur CBAM : 1.85 tCO₂e/t</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Aluminium Primaire / Profilés (Tonnes/an)
                      </label>
                      <input
                        type="number"
                        value={auditData.aluminumTons}
                        onChange={(e) => updateAuditData({ aluminumTons: Number(e.target.value) })}
                        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Facteur CBAM : 4.50 tCO₂e/t</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Chutes Récupérées & Recyclées (Tonnes/an)
                      </label>
                      <input
                        type="number"
                        value={auditData.scrapTons}
                        onChange={(e) => updateAuditData({ scrapTons: Number(e.target.value) })}
                        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-emerald-400 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-emerald-400/80 mt-1 block">Crédit Recyclage Circulaire</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DECHETS & VALORISATION BIOCLAIRA */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-emerald-400">Économie Circulaire & Modèles Cinétiques BioClaira :</span> Vos co-produits et déchets solides ne sont pas des pertes : nous calculons leur potentiel de pyrolyse, séquestration carbone et valorisation marchande.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Type de Co-produit / Biomasse Générée
                    </label>
                    <select
                      value={auditData.wasteType}
                      onChange={(e) => updateAuditData({ wasteType: e.target.value as any })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="metal_scrap">Chutes métalliques & copeaux d&apos;acier/alu</option>
                      <option value="olive_pomace">Grignons d&apos;olive (Huilerie)</option>
                      <option value="date_pits">Noyaux de dattes (Conditionnement)</option>
                      <option value="olive_mill_wastewater">Margines d&apos;olive (Phase liquide)</option>
                      <option value="plastic_scrap">Chutes de plastiques & emballages</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gisement Disponible (Tonnes/mois)
                    </label>
                    <input
                      type="number"
                      value={auditData.wasteMonthlyTons}
                      onChange={(e) => updateAuditData({ wasteMonthlyTons: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Taux d&apos;Humidité Résiduel (%)
                    </label>
                    <input
                      type="number"
                      value={auditData.moisturePercent}
                      onChange={(e) => updateAuditData({ moisturePercent: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Coût Actuel d&apos;Élimination / Décharge (TND/tonne)
                    </label>
                    <input
                      type="number"
                      value={auditData.disposalCostTndPerTon}
                      onChange={(e) => updateAuditData({ disposalCostTndPerTon: Number(e.target.value) })}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SYNTHESE & DIAGNOSTIC EXPRESS */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        Diagnostic Validé • Moteurs Mathématiques SymbioCarb
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Conforme ISO 14064 & CBAM
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Synthèse de l&apos;Audit Énergétique & Décarbonation pour {auditData.companyName}
                    </h3>
                  </div>

                  <div className="text-end">
                    <div className="text-xs text-slate-400 font-mono">Gains Annuels Estimés</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      +{(results.totalAnnualStegSavingsTnd + results.annualCircularValorizationTnd).toLocaleString()} TND/an
                    </div>
                  </div>
                </div>

                {/* 3 Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: CBAM & Carbone */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Bilan Carbone & CBAM UE</span>
                      <Scale className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {results.specificEmbeddedEmissionsTco2ePerTon} <span className="text-xs font-normal text-slate-400">tCO₂e / t</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 space-y-1">
                      <div>Scope 1 Direct : <span className="font-mono text-slate-200">{results.scope1Tco2e} tCO₂e</span></div>
                      <div>Scope 2 STEG : <span className="font-mono text-slate-200">{results.scope2Tco2e} tCO₂e</span></div>
                      <div>Scope 3 BOM : <span className="font-mono text-slate-200">{results.scope3Tco2e} tCO₂e</span></div>
                      <div className="pt-1 text-emerald-400 font-semibold">
                        Exposition Taxe CBAM : {results.cbamTaxExposureEur.toLocaleString()} € (~{results.cbamTaxExposureTnd.toLocaleString()} TND)
                      </div>
                    </div>
                  </div>

                  {/* Card 2: STEG & Énergie */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Optimisation STEG MT</span>
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-400">
                      Qc = {results.requiredCapacitorKvar} <span className="text-xs font-normal text-slate-400">kVAR</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 space-y-1">
                      <div>cos φ actuel : <span className="font-mono text-red-400">{results.cosPhiCurrent}</span> → Cible : <span className="font-mono text-emerald-400">0.95</span></div>
                      <div>Économie Réactive : <span className="font-mono text-emerald-400">+{results.annualReactivePenaltySavingsTnd.toLocaleString()} TND/an</span></div>
                      <div>Suppression Dépassement : <span className="font-mono text-emerald-400">+{results.annualPowerOverrunSavingsTnd.toLocaleString()} TND/an</span></div>
                      <div className="pt-1 text-emerald-400 font-semibold">
                        Subvention ANME FTE : +{results.anmeFteSubsidyTnd.toLocaleString()} TND (70% audit)
                      </div>
                    </div>
                  </div>

                  {/* Card 3: BioClaira Circulaire */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Valorisation BioClaira</span>
                      <Recycle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">
                      +{results.biocharYieldTonsPerYear} <span className="text-xs font-normal text-slate-400">t Biochar/an</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 space-y-1">
                      <div>Séquestration CO₂ : <span className="font-mono text-emerald-400">-{results.co2SequestrationTco2ePerYear} tCO₂/an</span></div>
                      <div>Économie Décharge : <span className="font-mono text-slate-200">{(auditData.wasteMonthlyTons * 12 * auditData.disposalCostTndPerTon).toLocaleString()} TND</span></div>
                      <div className="pt-1 text-emerald-400 font-semibold">
                        Gain Marchand Total : +{results.annualCircularValorizationTnd.toLocaleString()} TND/an
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Action Deliverables */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    📄 Livrables d&apos;Audit Immédiats (Prêts pour Export & Autorités)
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPdfModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
                    >
                      <Printer className="h-4 w-4 text-emerald-600" />
                      Générer le Rapport d&apos;Audit Officiel (Format PDF Imprimable)
                    </button>

                    <a
                      href={`/api/export/cbam-xml?persona=custom`}
                      download="declaration_cbam_tunisie.xml"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-xs transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger la Déclaration XML Officielle CBAM
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#111827]/70">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Étape Précédente
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Suivant : Étape {currentStep + 1}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishAndSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Valider & Sauvegarder dans &apos;Mon Usine Réelle&apos;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Printable PDF Audit Modal */}
      {isPdfModalOpen && (
        <AuditReportDialog
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          result={cbamResultForPdf}
          entries={sampleBomEntries}
          companyName={auditData.companyName}
          quarter="T4 - Clôture Annuelle 2026"
          reportingYear={2026}
        />
      )}
    </>
  );
}
