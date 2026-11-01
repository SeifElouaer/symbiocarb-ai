'use client';

// ==============================================================================
// SymbioCarb AI - Guided Industrial Audit Workspace (/audit)
// Interactive 5-Step Decarbonization & ISO 50001 / CBAM Diagnostic
// ==============================================================================

import React from 'react';
import { useAudit } from '@/lib/audit/audit-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Zap, 
  Flame, 
  Recycle, 
  FileCheck2, 
  Printer, 
  Download, 
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AuditPage() {
  const { auditData, results, openWizard, lastSavedAt } = useAudit();
  const { persona, setPersona } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Guidance Matrix Header */}
      <SectionHeader
        title="Assistant d'Audit Industriel & Décarbonation Express"
        badge="Norme ISO 50001 & CBAM UE"
        badgeColor="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        objective="Collecter en 5 étapes guidées vos consommations STEG MT, intrants de fabrication et co-produits pour générer instantanément les analyses d'un audit de 6 mois."
        inputs={[
          'Facture STEG Moyenne Tension (kWh par tranche horaire & cos φ)',
          'Matricule fiscal, code douanier CN (8 chiffres) du produit exporté',
          'Nomenclature matières premières (acier, aluminium, carburants)',
          'Gisement de sous-produits industriels (grignons, dattes, chutes)'
        ]}
        deliverables={[
          'Bilan carbone complet Scope 1, Scope 2 et Scope 3 amont',
          'Intensité carbone spécifique intrinsèque (SEE en tCO2e/t)',
          'Dimensionnement batterie de condensateurs Qc (kVAR) & économies',
          'Rapport d\'Audit Officiel PDF imprimable & Fichier XML CBAM'
        ]}
        regulation="ISO 14064-1, ISO 50001, Règlement UE 2023/956, Arrêté Tarifaire STEG"
      />

      {/* Hero Action Card */}
      <div className="relative overflow-hidden rounded-2xl glass-panel-elevated p-6 sm:p-8 border border-card-border bg-gradient-to-br from-[#111827] via-[#0D131F] to-[#090D16]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                Moteur d&apos;Audit Déterministe SymbioCarb
              </span>
              <span className="text-xs font-mono text-slate-400">
                • {results.readinessScorePercent}% Complété
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Réalisez l&apos;audit complet de votre usine en 5 minutes
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Renseignez vos paramètres réels (ou appliquez un profil certifié tunisien) pour que nos solveurs calculent immédiatement vos gains STEG MT, votre exposition fiscale CBAM et vos opportunités de valorisation circulaire.
            </p>

            {lastSavedAt && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                <span>Dernière mise à jour : {new Date(lastSavedAt).toLocaleString('fr-TN')}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <button
              onClick={openWizard}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              Lancer / Modifier l&apos;Audit Guidé (5 Étapes)
            </button>

            {persona !== 'custom' && (
              <button
                onClick={() => setPersona('custom')}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
              >
                🏢 Activer le Mode &apos;Mon Usine Réelle&apos;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5 Steps Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            step: 'Étape 1',
            title: 'Profil Usine & CBAM',
            desc: `${auditData.companyName} (${auditData.sector})`,
            sub: `CN: ${auditData.exportCnCode}`,
            icon: Building2,
            color: 'text-emerald-400',
          },
          {
            step: 'Étape 2',
            title: 'Énergie STEG MT',
            desc: `cos φ: ${auditData.cosPhi} | Ps: ${auditData.pSouscriteKva} kVA`,
            sub: `${auditData.kwhJour + auditData.kwhPointe + auditData.kwhSoir + auditData.kwhNuit} kWh/mois`,
            icon: Zap,
            color: 'text-amber-400',
          },
          {
            step: 'Étape 3',
            title: 'Combustibles & Intrants',
            desc: `Gaz: ${auditData.naturalGasM3} m³ | Fuel: ${auditData.heavyFuelTons} t`,
            sub: `Acier: ${auditData.steelTons} t/an`,
            icon: Flame,
            color: 'text-blue-400',
          },
          {
            step: 'Étape 4',
            title: 'Déchets & BioClaira',
            desc: `${auditData.wasteMonthlyTons} t/mois (${auditData.wasteType})`,
            sub: `Valorisation: ${results.biocharYieldTonsPerYear} t biochar`,
            icon: Recycle,
            color: 'text-emerald-400',
          },
          {
            step: 'Étape 5',
            title: 'Diagnostic Express',
            desc: `SEE: ${results.specificEmbeddedEmissionsTco2ePerTon} tCO₂e/t`,
            sub: `Économies: +${(results.totalAnnualStegSavingsTnd + results.annualCircularValorizationTnd).toLocaleString()} TND`,
            icon: FileCheck2,
            color: 'text-purple-400',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              onClick={openWizard}
              className="cursor-pointer group p-4 rounded-xl glass-panel border border-card-border hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-mono text-emerald-500 font-bold">{item.step}</span>
                <Icon className={`h-4 w-4 ${item.color} group-hover:scale-110 transition-transform`} />
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-300 font-mono truncate">{item.desc}</p>
              <p className="text-[10px] text-muted-foreground truncate">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Synthesis Cards & Direct Links to Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Émissions & CBAM Européen</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">ISO 14064-1</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {results.specificEmbeddedEmissionsTco2ePerTon} <span className="text-xs font-normal text-slate-400">tCO₂e / t</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 border-t border-card-border pt-3">
            <div className="flex justify-between">
              <span>Émissions Totales :</span>
              <span className="font-mono text-white">{results.totalTco2e.toLocaleString()} tCO₂e/an</span>
            </div>
            <div className="flex justify-between">
              <span>Exposition Fiscale CBAM :</span>
              <span className="font-mono text-emerald-400">{results.cbamTaxExposureEur.toLocaleString()} €</span>
            </div>
          </div>
          <Link
            href="/cbam"
            className="flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 pt-2 font-semibold"
          >
            <span>Ouvrir le module CBAM & Nomenclatures BOM</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Énergie & Facture STEG MT</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">ISO 50001</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            Qc = {results.requiredCapacitorKvar} <span className="text-xs font-normal text-slate-400">kVAR</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 border-t border-card-border pt-3">
            <div className="flex justify-between">
              <span>Gains Annuels STEG :</span>
              <span className="font-mono text-emerald-400">+{results.totalAnnualStegSavingsTnd.toLocaleString()} TND/an</span>
            </div>
            <div className="flex justify-between">
              <span>Aide Financière ANME FTE :</span>
              <span className="font-mono text-white">+{results.anmeFteSubsidyTnd.toLocaleString()} TND</span>
            </div>
          </div>
          <Link
            href="/energy"
            className="flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 pt-2 font-semibold"
          >
            <span>Ouvrir l&apos;optimiseur tarifaire STEG MT</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl glass-panel-elevated p-6 border border-card-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Valorisation Circulaire BioClaira</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">Modèles Cinétiques</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            +{results.biocharYieldTonsPerYear} <span className="text-xs font-normal text-slate-400">t Biochar / an</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 border-t border-card-border pt-3">
            <div className="flex justify-between">
              <span>Séquestration Carbone :</span>
              <span className="font-mono text-emerald-400">-{results.co2SequestrationTco2ePerYear} tCO₂e/an</span>
            </div>
            <div className="flex justify-between">
              <span>Gain Marchand Circulaire :</span>
              <span className="font-mono text-emerald-400">+{results.annualCircularValorizationTnd.toLocaleString()} TND/an</span>
            </div>
          </div>
          <Link
            href="/symbiosis"
            className="flex items-center justify-between text-xs text-purple-400 hover:text-purple-300 pt-2 font-semibold"
          >
            <span>Ouvrir le simulateur de pyrolyse BioClaira</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

