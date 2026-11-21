'use client';

// ==============================================================================
// SymbioCarb AI - Factory Data & Historical Registry (/audit)
// Clean view of factory profile, progressive data entry, and reset controls.
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { useAudit } from '@/lib/audit/audit-context';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Plus, ArrowRight, RotateCcw } from 'lucide-react';

export default function FactoryDataPage() {
  const { auditData, results, openAddDataModal, resetAuditData, lastSavedAt } = useAudit();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Données & Historique de l'Usine"
        badge="ISO 50001 & CBAM UE"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        objective="Centraliser les paramètres d'identité, les relevés mensuels STEG, les intrants matières premières et accéder aux synthèses réglementaires."
        inputs={[
          'Profil administratif et matricule fiscal de l’usine',
          'Relevés mensuels ou annuels STEG MT/HT',
          'Combustibles Scope 1 et nomenclatures matières Scope 3',
        ]}
        deliverables={[
          'État consolidé de votre usine à jour en temps réel',
          'Base unifiée pour les modules Énergie STEG et CBAM UE',
        ]}
        regulation="ISO 14064-1, ISO 50001, Règlement UE 2023/956"
      />

      {/* Action Header Card */}
      <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-emerald-400">
              Complétude : {results.readinessScorePercent}%
            </span>
            {lastSavedAt && (
              <span className="text-[11px] font-mono text-slate-500">
                • Dernière sauvegarde : {new Date(lastSavedAt).toLocaleString('fr-TN')}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">
            {auditData.companyName.trim() || 'Usine non encore configurée'}
          </h2>
          <p className="text-xs text-slate-400">
            Ajoutez ou corrigez vos données usine à tout moment. Toutes les pages se recalculent immédiatement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => openAddDataModal('steg')}
            className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ajouter une facture / donnée</span>
          </button>

          <button
            onClick={resetAuditData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réinitialiser à zéro</span>
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Émissions &amp; CBAM</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
              ISO 14064-1
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {results.specificEmbeddedEmissionsTco2ePerTon}{' '}
            <span className="text-xs font-normal text-slate-400">tCO₂e/t</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 border-t border-white/[0.08] pt-3 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Total :</span>
              <span>{results.totalTco2e.toLocaleString('fr-TN')} tCO₂e/an</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Exposition :</span>
              <span className="text-emerald-400">{results.cbamTaxExposureEur.toLocaleString('fr-TN')} €</span>
            </div>
          </div>
          <Link
            href="/cbam"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 pt-1 font-semibold"
          >
            <span>Ouvrir le module CBAM</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Énergie STEG MT</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
              ISO 50001
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
            {results.requiredCapacitorKvar} <span className="text-xs font-normal text-slate-400">kVAR</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 border-t border-white/[0.08] pt-3 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Gains STEG :</span>
              <span className="text-emerald-400">{results.totalAnnualStegSavingsTnd.toLocaleString('fr-TN')} TND/an</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Factures :</span>
              <span>{auditData.monthlyBills.length} période(s)</span>
            </div>
          </div>
          <Link
            href="/energy"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 pt-1 font-semibold"
          >
            <span>Ouvrir l&apos;optimiseur STEG</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl glass-panel-elevated p-6 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">BioClaira (Option Séparée)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
              Pack Gold
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {results.annualCircularValorizationTnd.toLocaleString('fr-TN')}{' '}
            <span className="text-xs font-normal text-slate-400">TND/an</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 border-t border-white/[0.08] pt-3 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Déchets déclarés :</span>
              <span>{auditData.wasteMonthlyTons} t/mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CO₂e évité :</span>
              <span className="text-emerald-400">{results.co2SequestrationTco2ePerYear} tCO₂e/an</span>
            </div>
          </div>
          <Link
            href="/symbiosis"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 pt-1 font-semibold"
          >
            <span>Ouvrir l&apos;audit déchets BioClaira</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
