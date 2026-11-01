'use client';

// ==============================================================================
// SymbioCarb AI - Executive Industrial Cockpit & Decarbonization Dashboard
// Dynamic trilingual metrics and KPI telemetry responding to the active persona
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  FALLBACK_BILLS, 
  FALLBACK_ORGANIZATIONS, 
  FALLBACK_SYMBIO_MATCHES 
} from '@/lib/supabase/fallback-data';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';
import { 
  Flame, 
  Zap, 
  Recycle, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  FileSpreadsheet, 
  Sparkles,
  Bot
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

export default function DashboardPage() {
  const { t, locale, persona } = useTranslation();
  const bill = FALLBACK_BILLS[persona] || FALLBACK_BILLS.benarous;
  const org = FALLBACK_ORGANIZATIONS[persona] || FALLBACK_ORGANIZATIONS.benarous;

  // Real-time calculations
  const tariffCalc = calculateStegMtBill({
    kwhJour: bill.kwh_jour,
    kwhPointe: bill.kwh_pointe,
    kwhSoir: bill.kwh_soir,
    kwhNuit: bill.kwh_nuit,
    kvarhTotal: bill.kvarh_total,
    pSouscriteKva: bill.p_souscrite_kva,
    pMaxAppeleeKva: bill.p_max_appelee_kva,
  });

  const cosPhiCalc = solveCosPhiCompensation({
    activePowerKw: (bill.kwh_jour + bill.kwh_pointe) / 300,
    currentCosPhi: bill.cos_phi,
    targetCosPhi: 0.95,
    annualActiveKwh: bill.kwh_total * 12,
    annualReactivePenaltyTnd: bill.reactive_penalty_tnd * 12,
    hasHarmonicLoads: persona === 'benarous',
  });

  // Chart data for 4-period STEG load
  const loadData = [
    { name: t.energy.jour, kWh: bill.kwh_jour, rate: '0.248 TND' },
    { name: t.energy.pointe, kWh: bill.kwh_pointe, rate: '0.412 TND' },
    { name: t.energy.soir, kWh: bill.kwh_soir, rate: '0.235 TND' },
    { name: t.energy.nuit, kWh: bill.kwh_nuit, rate: '0.188 TND' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.cockpit.title}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {org.sector.toUpperCase()}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {t.cockpit.subtitle} • <span className="text-gray-300 font-semibold">{org.name_fr}</span> ({org.industrial_zone})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900/60 px-3.5 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300">STEG MT Grid:</span>
            <span className="font-mono font-bold text-emerald-400">0.473 kgCO₂e/kWh</span>
          </div>
        </div>
      </div>

      {/* 4 Core Industrial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Carbon Footprint */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>{t.cockpit.kpiCarbonFootprint}</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {(tariffCalc.co2Tons * 12).toLocaleString('fr-TN')}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <span>{t.cockpit.unitTco2e}</span>
              <span className="text-emerald-400 font-medium ms-1 flex items-center">
                <TrendingDown className="h-3.5 w-3.5" /> -14.2%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }} />
          </div>
        </div>

        {/* KPI 2: STEG Bill */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>{t.cockpit.kpiStegBill}</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {tariffCalc.totalTtcTnd.toLocaleString('fr-TN')} <span className="text-sm font-sans text-gray-400">{t.cockpit.unitTnd}</span>
            </div>
            <div className="text-xs text-amber-400/90 font-medium mt-1">
              {tariffCalc.reactivePenaltyTnd > 0 ? `Dont ${tariffCalc.reactivePenaltyTnd} TND pénalités` : 'cos φ optimal (0.895)'}
            </div>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        {/* KPI 3: Symbiosis Circular Gains */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>{t.cockpit.kpiSymbiosisRevenue}</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Recycle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {persona === 'tozeur' ? '1,430,000' : persona === 'sfax' ? '510,000' : '144,000'} <span className="text-sm font-sans text-gray-400">{t.cockpit.unitTnd}</span>
            </div>
            <div className="text-xs text-purple-400 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>BioClaira Valorization</span>
            </div>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* KPI 4: CBAM EU Tax Exposure */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-3 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>{t.cockpit.kpiCbamLiability}</span>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {persona === 'benarous' ? '54,200' : '0'} <span className="text-sm font-sans text-gray-400">{t.cockpit.unitEur}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {persona === 'benarous' ? 'CN 7209 (Tôles d\'acier)' : 'Exempté (Marché local)'}
            </div>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: persona === 'benarous' ? '74%' : '0%' }} />
          </div>
        </div>
      </div>

      {/* Critical Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STEG Pointe Alert */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-300">
              {t.cockpit.alertPointeTitle}
            </div>
            <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
              {t.cockpit.alertPointeMsg}
            </p>
          </div>
        </div>

        {/* cos phi or Symbiosis Alert */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
            <Recycle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-emerald-300">
              {t.cockpit.alertSymbiosisTitle}
            </div>
            <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
              {t.cockpit.alertSymbiosisMsg}
            </p>
          </div>
        </div>
      </div>

      {/* STEG Medium Voltage Consumption Breakdown Chart */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">
              {t.cockpit.chartLoadTitle}
            </h2>
            <p className="text-xs text-gray-400">
              Total facturé : <span className="font-mono text-emerald-400 font-bold">{bill.kwh_total.toLocaleString('fr-TN')} kWh</span> • District STEG : <span className="text-gray-300 font-medium">{bill.district_steg}</span>
            </p>
          </div>
          <div className="text-xs font-mono text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-white/5">
            P_souscrite: {bill.p_souscrite_kva} kVA | P_max: {bill.p_max_appelee_kva} kVA
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(value: any) => [`${value.toLocaleString()} kWh`, 'Consommation']}
              />
              <Bar dataKey="kWh" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

