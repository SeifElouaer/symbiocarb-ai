'use client';

// ==============================================================================
// Module C: STEG MT/HT Energy, Reactive Power (cos φ) & ANME Grants Optimization
// Features live deterministic sliders for capacitor bank sizing & load shifting
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FALLBACK_BILLS, FALLBACK_ORGANIZATIONS } from '@/lib/supabase/fallback-data';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';
import { solveLoadShifting } from '@/lib/engine/load-shifting-lp';
import { 
  Zap, 
  Sliders, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Layers 
} from 'lucide-react';

export default function EnergyPage() {
  const { t, locale, persona } = useTranslation();
  const bill = FALLBACK_BILLS[persona] || FALLBACK_BILLS.benarous;
  const org = FALLBACK_ORGANIZATIONS[persona] || FALLBACK_ORGANIZATIONS.benarous;

  // State for interactive sliders
  const [targetCosPhi, setTargetCosPhi] = useState(0.95);
  const [flexibleLoadPct, setFlexibleLoadPct] = useState(30);

  // Solvers calculation
  const baseTariff = calculateStegMtBill({
    kwhJour: bill.kwh_jour,
    kwhPointe: bill.kwh_pointe,
    kwhSoir: bill.kwh_soir,
    kwhNuit: bill.kwh_nuit,
    kvarhTotal: bill.kvarh_total,
    pSouscriteKva: bill.p_souscrite_kva,
    pMaxAppeleeKva: bill.p_max_appelee_kva,
  });

  const cosPhiResult = solveCosPhiCompensation({
    activePowerKw: (bill.kwh_jour + bill.kwh_pointe) / 300,
    currentCosPhi: bill.cos_phi,
    targetCosPhi,
    annualActiveKwh: bill.kwh_total * 12,
    annualReactivePenaltyTnd: bill.reactive_penalty_tnd * 12,
    hasHarmonicLoads: persona === 'benarous',
  });

  const loadShiftResult = solveLoadShifting({
    currentPointeKwh: bill.kwh_pointe,
    flexibleCapacityPct: flexibleLoadPct,
    targetSlot: 'nuit',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Zap className="h-6 w-6 text-amber-400" />
          <span>{t.energy.title}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {t.energy.subtitle} • {org.name_fr} ({bill.district_steg})
        </p>
      </div>

      {/* Grid 1: cos phi Compensation Optimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {locale === 'ar-TN' ? 'محاكي تعويض الطاقة الارتكاسية (cos φ)' : 'Simulateur Compensation cos φ'}
                </h2>
                <p className="text-[11px] text-gray-400">
                  {locale === 'ar-TN' ? 'حساب دقيق لسعة المكثفات وإلغاء خطايا الستاغ' : 'Calcul déterministe Qc (kVAR) & élimination des pénalités'}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              cos φ actuel: {bill.cos_phi}
            </span>
          </div>

          {/* Slider for Target cos phi */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-medium">
                {t.energy.cosPhiTarget} : <span className="font-mono text-emerald-400 font-bold">{targetCosPhi}</span>
              </span>
              <span className="text-gray-400 font-mono">Qc = P × (tan φ₁ - tan φ₂)</span>
            </div>
            <input
              type="range"
              min="0.86"
              max="0.99"
              step="0.01"
              value={targetCosPhi}
              onChange={(e) => setTargetCosPhi(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>0.86 (Seuil STEG)</span>
              <span>0.92 (Bonus STEG)</span>
              <span>0.95 (Optimal)</span>
              <span>0.99 (Max)</span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-4 space-y-1">
              <div className="text-[11px] text-gray-400 font-medium">{t.energy.qcRequired}</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {cosPhiResult.requiredQcKvar} <span className="text-xs text-gray-300">kVAR</span>
              </div>
              <div className="text-[10px] text-gray-400">
                {cosPhiResult.antiHarmonicReactorRecommended ? 'Avec selfs 189 Hz' : 'Gradins standards'}
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-4 space-y-1">
              <div className="text-[11px] text-gray-400 font-medium">{t.energy.annualSavings}</div>
              <div className="text-xl font-bold font-mono text-white">
                {cosPhiResult.totalAnnualGainTnd.toLocaleString('fr-TN')} <span className="text-xs text-gray-400">TND</span>
              </div>
              <div className="text-[10px] text-emerald-400">
                Dont {cosPhiResult.jouleSavingsTnd.toFixed(0)} TND pertes Joule
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-4 space-y-1">
              <div className="text-[11px] text-gray-400 font-medium">{t.energy.paybackMonths}</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {cosPhiResult.paybackPeriodMonths} <span className="text-xs text-gray-300">{locale === 'ar-TN' ? 'أشهر' : 'mois'}</span>
              </div>
              <div className="text-[10px] text-gray-400">
                CAPEX estimé: {cosPhiResult.estimatedCapexTnd.toLocaleString()} TND
              </div>
            </div>
          </div>
        </div>

        {/* Load Shifting Simulator */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Coins className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">{t.energy.loadShiftTitle}</h3>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {t.energy.loadShiftDesc}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">{t.energy.shiftPercent}</span>
              <span className="font-mono text-emerald-400 font-bold">{flexibleLoadPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={flexibleLoadPct}
              onChange={(e) => setFlexibleLoadPct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-2">
            <div className="text-xs text-emerald-300 font-semibold flex items-center justify-between">
              <span>{locale === 'ar-TN' ? 'الاقتصاد الشهري المحقق :' : 'Économie Mensuelle :'}</span>
              <span className="font-mono font-bold text-base text-white">
                +{loadShiftResult.monthlyBillSavingsTnd.toLocaleString('fr-TN')} TND
              </span>
            </div>
            <div className="text-[11px] text-emerald-200/80 flex items-center justify-between">
              <span>{locale === 'ar-TN' ? 'كربون الشبكة المتجنب :' : 'CO₂ Réseau Évité :'}</span>
              <span className="font-mono font-medium">
                {(loadShiftResult.avoidedGridCarbonKg / 1000).toFixed(1)} tCO₂e/an
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ANME FTE & FODEP Subsidies Eligibility */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Award className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">{t.energy.anmeSubsidiesTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-gray-800/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">ANME FTE - Audit 70%</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.energy.eligible}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Prise en charge de 70% des frais d'audit énergétique obligatoire (loi 2004-72), plafonnée à 30 000 TND.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-gray-800/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">FTE Matériel - 20%</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.energy.eligible}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Prime d'investissement à fonds perdu de 20% sur les batteries de condensateurs et variateurs de vitesse.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-gray-800/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">FODEP Dépollution - 20%</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.energy.eligible}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Subvention de l'ANPE pour les équipements de valorisation de margines, grignons et recyclage de copeaux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

