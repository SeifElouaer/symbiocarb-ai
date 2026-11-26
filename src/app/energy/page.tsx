'use client';

// ==============================================================================
// Module Energy: STEG MT/HT Tariffs, Reactive Power (cos φ) & ANME Grants
// Strictly reads real authenticated factory data from AuditContext (0 if empty).
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAudit } from '@/lib/audit/audit-context';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';
import { solveLoadShifting } from '@/lib/engine/load-shifting-lp';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { formatSignedAmount } from '@/lib/format/signed-amount';
import { Plus } from 'lucide-react';

export default function EnergyPage() {
  const { t, locale } = useTranslation();
  const { auditData, results, openAddDataModal } = useAudit();

  const [targetCosPhi, setTargetCosPhi] = useState(0.95);
  const [flexibleLoadPct, setFlexibleLoadPct] = useState(25);

  const hasEnergy = results.hasEnergyData && results.kwhTotal > 0;

  const cosPhiResult =
    hasEnergy && auditData.cosPhi > 0
      ? solveCosPhiCompensation({
          activePowerKw: Math.max(1, (auditData.kwhJour + auditData.kwhPointe) / 300),
          currentCosPhi: Math.min(0.99, Math.max(0.5, auditData.cosPhi)),
          targetCosPhi,
          annualActiveKwh: results.kwhTotal * 12,
          annualReactivePenaltyTnd: auditData.reactivePenaltyTnd * 12,
          hasHarmonicLoads: auditData.sector === 'metal_mechanics',
        })
      : null;

  const loadShiftResult =
    hasEnergy && auditData.kwhPointe > 0
      ? solveLoadShifting({
          currentPointeKwh: auditData.kwhPointe,
          flexibleCapacityPct: flexibleLoadPct,
          targetSlot: 'nuit',
        })
      : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.energy.title}
        badge="Tarif STEG MT & Cos φ"
        badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
        objective="Analyser votre facture STEG Moyenne Tension, dimensionner le banc de condensateurs pour supprimer les pénalités d'énergie réactive et simuler l'effacement de pointe."
        inputs={[
          'Puissance souscrite et puissance maximale appelée (kVA)',
          'Consommations actives en kWh (Jour, Pointe, Soir, Nuit)',
          'Énergie réactive totale en kVARh et facteur cos φ mesuré',
        ]}
        deliverables={[
          'Puissance nominale de compensation Qc (kVAR)',
          'Vérification harmonique réseau (IEEE 519)',
          'Économies annuelles directes sur la facture STEG (TND)',
          'Simulation de déplacement de charge Pointe → Nuit',
        ]}
        regulation="Arrêté Tarifaire STEG MT, Norme CEI 60831, Loi n° 2004-72 & Subventions ANME FTE"
      />

      {!hasEnergy && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">Aucune consommation STEG enregistrée</h2>
            <p className="text-xs text-slate-300 mt-1">
              Les indicateurs ci-dessous sont à zéro. Ajoutez ou scannez votre première facture STEG pour lancer les calculs d&apos;optimisation.
            </p>
          </div>
          <button
            onClick={() => openAddDataModal('steg')}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-xs font-bold shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ajouter une facture STEG</span>
          </button>
        </div>
      )}

      {/* Consumption Percentage Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl glass-panel-elevated border border-white/[0.08] p-4">
          <div className="text-[11px] text-slate-400">Jour (0.248 TND/kWh)</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {auditData.kwhJour.toLocaleString('fr-TN')} <span className="text-xs text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">{results.pctJour}% du total</div>
        </div>

        <div className="rounded-xl glass-panel-elevated border border-white/[0.08] p-4">
          <div className="text-[11px] text-amber-300 font-medium">Pointe (0.412 TND/kWh)</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {auditData.kwhPointe.toLocaleString('fr-TN')} <span className="text-xs text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] font-mono text-amber-300 mt-1">{results.pctPointe}% du total</div>
        </div>

        <div className="rounded-xl glass-panel-elevated border border-white/[0.08] p-4">
          <div className="text-[11px] text-slate-400">Soir (0.235 TND/kWh)</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {auditData.kwhSoir.toLocaleString('fr-TN')} <span className="text-xs text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">{results.pctSoir}% du total</div>
        </div>

        <div className="rounded-xl glass-panel-elevated border border-white/[0.08] p-4">
          <div className="text-[11px] text-slate-400">Nuit (0.188 TND/kWh)</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {auditData.kwhNuit.toLocaleString('fr-TN')} <span className="text-xs text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] font-mono text-blue-400 mt-1">{results.pctNuit}% du total</div>
        </div>
      </div>

      {/* cos phi Compensation & Load Shifting Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                {locale === 'ar-TN'
                  ? 'محاكي تعويض الطاقة الارتكاسية (cos φ)'
                  : 'Simulateur de Compensation Réactive (cos φ)'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Dimensionnement Qc (kVAR) et suppression des pénalités STEG
              </p>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              cos φ actuel : {auditData.cosPhi > 0 ? auditData.cosPhi : '0.00'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {t.energy.cosPhiTarget} :{' '}
                <span className="font-mono text-emerald-400 font-bold">{targetCosPhi}</span>
              </span>
              <span className="text-slate-400 font-mono">Qc = P × (tan φ₁ - tan φ₂)</span>
            </div>
            <input
              type="range"
              min="0.86"
              max="0.99"
              step="0.01"
              value={targetCosPhi}
              onChange={(e) => setTargetCosPhi(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-black/40 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.86 (Seuil STEG)</span>
              <span>0.92 (Bonus STEG)</span>
              <span>0.95 (Optimal)</span>
              <span>0.99 (Max)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">{t.energy.qcRequired}</div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {cosPhiResult ? cosPhiResult.nominalQcWithDeratingKvar : 0}{' '}
                <span className="text-xs text-slate-300">kVAR</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Base calculée : {cosPhiResult ? cosPhiResult.requiredQcKvar : 0} kVAR
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">{t.energy.annualSavings}</div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {cosPhiResult ? cosPhiResult.totalAnnualGainTnd.toLocaleString('fr-TN') : '0'}{' '}
                <span className="text-xs text-slate-400">TND</span>
              </div>
              <div className="text-[10px] text-emerald-400">
                Dont {cosPhiResult ? cosPhiResult.jouleSavingsTnd.toFixed(0) : '0'} TND pertes Joule
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">{t.energy.paybackMonths}</div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {cosPhiResult ? cosPhiResult.paybackPeriodMonths : '0'}{' '}
                <span className="text-xs text-slate-300">{locale === 'ar-TN' ? 'أشهر' : 'mois'}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                CAPEX estimé : {cosPhiResult ? cosPhiResult.estimatedCapexTnd.toLocaleString('fr-TN') : '0'} TND
              </div>
            </div>
          </div>

          {cosPhiResult && (
            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-300">
                  Audit Harmonique Réseau (IEEE 519 / IEC 61000)
                </span>
                <span className="font-mono text-[11px] text-amber-400">
                  THD-U: {cosPhiResult.thdUPercent}% • THD-I: {cosPhiResult.thdIPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {cosPhiResult.harmonicOrderRisk}.{' '}
                {cosPhiResult.antiHarmonicReactorRecommended
                  ? 'Selfs anti-harmoniques désaccordées 189 Hz recommandées.'
                  : 'Réseau linéaire sans risque de résonance.'}
              </p>
            </div>
          )}
        </div>

        {/* Load Shifting Simulator */}
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">{t.energy.loadShiftTitle}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">{t.energy.loadShiftDesc}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{t.energy.shiftPercent}</span>
              <span className="font-mono text-emerald-400 font-bold">{flexibleLoadPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={flexibleLoadPct}
              onChange={(e) => setFlexibleLoadPct(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 bg-black/40 rounded-lg cursor-pointer h-2"
            />
          </div>

          {(() => {
            const grossFormatted = formatSignedAmount(
              loadShiftResult?.monthlyBillSavingsTnd,
              'TND',
              locale
            );
            const laborFormatted = formatSignedAmount(
              loadShiftResult ? -Math.abs(loadShiftResult.additionalLaborNightCostTnd) : undefined,
              'TND',
              locale
            );
            const transportFormatted = formatSignedAmount(
              loadShiftResult ? -Math.abs(loadShiftResult.nightTransportCostTnd) : undefined,
              'TND',
              locale
            );
            const netUnit = locale === 'ar-TN' ? 'د/شهر' : locale === 'en' ? 'TND/mo' : 'TND/mois';
            const netFormatted = formatSignedAmount(
              loadShiftResult?.netTrueMonthlyGainTnd,
              netUnit,
              locale
            );
            return (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                <div className="text-xs text-emerald-300 font-semibold flex items-center justify-between">
                  <span>Économie STEG Brute :</span>
                  <span dir="ltr" className={`font-mono font-bold text-sm tabular-nums whitespace-nowrap inline-block ${grossFormatted.colorClass}`}>
                    {grossFormatted.text}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-white/[0.06] pt-1.5 space-y-1">
                  <div className="flex justify-between">
                    <span>Surprime salariale nuit (+50%) :</span>
                    <span dir="ltr" className={`font-mono tabular-nums whitespace-nowrap inline-block ${laborFormatted.colorClass}`}>
                      {laborFormatted.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Navettes ouvriers (nuit) :</span>
                    <span dir="ltr" className={`font-mono tabular-nums whitespace-nowrap inline-block ${transportFormatted.colorClass}`}>
                      {transportFormatted.text}
                    </span>
                  </div>
                </div>
                <div className="text-xs border-t border-emerald-500/20 pt-1.5 font-bold flex items-center justify-between text-slate-200">
                  <span>Gain Réel Net Entreprise :</span>
                  <span dir="ltr" className={`font-mono text-sm tabular-nums whitespace-nowrap inline-block ${netFormatted.colorClass}`}>
                    {netFormatted.text}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ANME FTE & FODEP Subsidies */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <h2 className="text-base font-bold text-white">{t.energy.anmeSubsidiesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">ANME FTE — Audit 70%</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.energy.eligible}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prise en charge de 70% des frais d&apos;audit énergétique obligatoire (loi 2004-72), plafonnée à 30 000 TND.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">FTE Matériel — 20%</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.energy.eligible}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prime d&apos;investissement à fonds perdu de 20% sur les batteries de condensateurs et variateurs de vitesse.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">FODEP Dépollution — 20%</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.energy.eligible}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Subvention ANPE pour les équipements de valorisation et de réduction des rejets industriels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
