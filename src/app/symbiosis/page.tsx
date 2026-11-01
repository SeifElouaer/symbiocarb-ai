'use client';

// ==============================================================================
// Module D: BioClaira Pyrolysis Valorization & Industrial Symbiosis Hub
// Physico-chemical simulator for Date Pits/Grignons & Geospatial Synergies Map
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FALLBACK_ORGANIZATIONS, FALLBACK_WASTE_LISTINGS, FALLBACK_SYMBIO_MATCHES } from '@/lib/supabase/fallback-data';
import { simulateBioClairaValorization } from '@/lib/engine/bioclaira-simulator';
import { 
  Recycle, 
  Flame, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Compass, 
  ShieldCheck 
} from 'lucide-react';

export default function SymbiosisPage() {
  const { t, locale, persona } = useTranslation();
  const org = FALLBACK_ORGANIZATIONS[persona] || FALLBACK_ORGANIZATIONS.tozeur;

  // Simulator state
  const [wasteType, setWasteType] = useState<'date_pits' | 'olive_pomace' | 'metal_shavings'>(
    persona === 'tozeur' ? 'date_pits' : persona === 'sfax' ? 'olive_pomace' : 'metal_shavings'
  );
  const [tonnage, setTonnage] = useState(persona === 'tozeur' ? 650 : persona === 'sfax' ? 3400 : 180);
  const [pyrolysisTemp, setPyrolysisTemp] = useState(650);
  const [activationMethod, setActivationMethod] = useState<'steam' | 'h3po4' | 'koh'>('h3po4');

  // BioClaira Simulation Result
  const bioResult = simulateBioClairaValorization({
    wasteType,
    rawTonnage: tonnage,
    pyrolysisTempC: pyrolysisTemp,
    activationMethod,
  });

  // Tunisian Industrial Zones for the Interactive 3D Geospatial Map
  const industrialZones = [
    { name: 'Tozeur (Oasis)', lat: 33.9197, lng: 8.1335, waste: '650t Noyaux Dattes', valorization: 'Charbon Actif' },
    { name: 'Sfax (Thyna)', lat: 34.6852, lng: 10.6984, waste: '3400t Grignons & Margines', valorization: 'Biocombustible' },
    { name: 'Ben Arous (El Mghira)', lat: 36.7214, lng: 10.2285, waste: '180t Copeaux Acier CNC', valorization: 'Recyclage Métal' },
    { name: 'Bizerte (Zone Franche)', lat: 37.2746, lng: 9.8739, waste: 'Plastiques & Électronique', valorization: 'Pyrolyse Plastique' },
    { name: 'Gabès (Zone Chimique)', lat: 33.8815, lng: 10.0982, waste: 'Vapeur & Phosphogypses', valorization: 'Matériaux' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Recycle className="h-6 w-6 text-emerald-400" />
          <span>{t.symbiosis.title}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {t.symbiosis.subtitle} • {org.name_fr}
        </p>
      </div>

      {/* BioClaira Thermochemical Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              {t.symbiosis.bioclairaModelTitle}
            </h2>
          </div>

          {/* Substrate Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-medium">Type de Gisement Résiduel</label>
            <select
              value={wasteType}
              onChange={(e) => {
                const val = e.target.value as any;
                setWasteType(val);
                setTonnage(val === 'date_pits' ? 650 : val === 'olive_pomace' ? 3400 : 180);
              }}
              className="w-full rounded-xl border border-white/10 bg-gray-800 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="date_pits">🌴 Noyaux de Dattes Deglet Nour (Tozeur / Kébili)</option>
              <option value="olive_pomace">🫒 Grignons d'Olive Humides (Sfax / Sahel)</option>
              <option value="metal_shavings">⚙️ Copeaux d'Acier d'Usinage CNC (Ben Arous)</option>
            </select>
          </div>

          {/* Tonnage Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">{t.symbiosis.rawBiomass}</span>
              <span className="font-mono text-emerald-400 font-bold">{tonnage} tonnes/an</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={tonnage}
              onChange={(e) => setTonnage(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">{t.symbiosis.pyrolysisTemp}</span>
              <span className="font-mono text-emerald-400 font-bold">{pyrolysisTemp} °C</span>
            </div>
            <input
              type="range"
              min="450"
              max="850"
              step="25"
              value={pyrolysisTemp}
              onChange={(e) => setPyrolysisTemp(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>450°C (Biochar)</span>
              <span>650°C (Optimal CA)</span>
              <span>850°C (Gazéification)</span>
            </div>
          </div>

          {/* Activation Agent */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-medium">{t.symbiosis.activationType}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActivationMethod('h3po4')}
                className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                  activationMethod === 'h3po4'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/10 bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                H₃PO₄ (Chimique)
              </button>
              <button
                type="button"
                onClick={() => setActivationMethod('steam')}
                className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                  activationMethod === 'steam'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/10 bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Vapeur (Physique)
              </button>
            </div>
          </div>
        </div>

        {/* Physico-Chemical Yields & Outputs */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{t.symbiosis.outputsTitle}</span>
            </h2>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Rendement Massique: {bioResult.activatedCarbonYieldPct}%
            </span>
          </div>

          {/* 4 Yield Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-3.5 space-y-1">
              <div className="text-[11px] text-gray-400">{t.symbiosis.activatedCarbon}</div>
              <div className="text-xl font-bold font-mono text-white">
                {bioResult.activatedCarbonTons} <span className="text-xs text-gray-400">tonnes</span>
              </div>
              <div className="text-[10px] text-emerald-400">Substitut fossile</div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-3.5 space-y-1">
              <div className="text-[11px] text-gray-400">{t.symbiosis.betSurface}</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {bioResult.estimatedBetSurfaceAreaM2g} <span className="text-xs text-gray-400">m²/g</span>
              </div>
              <div className="text-[10px] text-gray-400">Microporosité élevée</div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-3.5 space-y-1">
              <div className="text-[11px] text-gray-400">{t.symbiosis.annualProfit}</div>
              <div className="text-xl font-bold font-mono text-white">
                {bioResult.netAnnualProfitTnd.toLocaleString('fr-TN')} <span className="text-xs text-gray-400">TND</span>
              </div>
              <div className="text-[10px] text-emerald-400">@ 7,500 TND/t CA</div>
            </div>

            <div className="rounded-xl border border-white/5 bg-gray-800/60 p-3.5 space-y-1">
              <div className="text-[11px] text-gray-400">{t.symbiosis.avoidedCo2}</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {bioResult.netAvoidedTco2e.toLocaleString('fr-TN')} <span className="text-xs text-gray-400">tCO₂e</span>
              </div>
              <div className="text-[10px] text-emerald-300">Méthane + Fossile évité</div>
            </div>
          </div>

          {/* Circular Mass Balance Flow (Sankey Concept) */}
          <div className="rounded-xl border border-white/5 bg-gray-800/40 p-4 space-y-3">
            <div className="text-xs font-bold text-gray-300">Bilan de Matière & Flux Énergétique :</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-gray-900/80 p-3 border border-white/5">
                <div className="text-[10px] text-gray-400">INTRANT BRUT</div>
                <div className="font-mono font-bold text-sm text-white mt-1">{tonnage} t Déchets</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Matière sèche: {bioResult.dryTonnage} t</div>
              </div>
              <div className="flex items-center justify-center text-emerald-400">
                <ArrowRight className="h-6 w-6 hidden sm:block" />
              </div>
              <div className="rounded-lg bg-emerald-950/40 p-3 border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 font-bold">PRODUITS VALORISÉS</div>
                <div className="font-mono font-bold text-sm text-emerald-300 mt-1">
                  {bioResult.activatedCarbonTons} t Charbon Actif
                </div>
                <div className="text-[10px] text-emerald-200/80 mt-0.5">
                  + {bioResult.syngasBioOilMwh.toFixed(0)} MWh Énergie Recyclée
                </div>
              </div>
            </div>
          </div>

          {/* CAPEX, VAN 7 ans, TRI & Subvention ANME FTE */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Viabilité Financière &amp; CAPEX Unité Industrielle BioClaira
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Subvention ANME FTE Matériel 20% Déduite
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-900/80 p-2.5 border border-white/5">
                <div className="text-[10px] text-gray-400">CAPEX Subventionné</div>
                <div className="font-mono font-bold text-sm text-white mt-0.5">
                  {bioResult.anmeSubsidizedCapexTnd.toLocaleString('fr-TN')} TND
                </div>
                <div className="text-[9px] text-gray-500">Brut: {bioResult.totalCapexTnd.toLocaleString()} TND</div>
              </div>

              <div className="rounded-lg bg-gray-900/80 p-2.5 border border-white/5">
                <div className="text-[10px] text-gray-400">VAN sur 7 ans (8.5%)</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                  +{bioResult.npv7YearsTnd.toLocaleString('fr-TN')} TND
                </div>
                <div className="text-[9px] text-emerald-300/80">Valeur Actuelle Nette</div>
              </div>

              <div className="rounded-lg bg-gray-900/80 p-2.5 border border-white/5">
                <div className="text-[10px] text-gray-400">TRI (Taux Rentabilité)</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                  {bioResult.irrPercent}%
                </div>
                <div className="text-[9px] text-gray-500">Rentabilité Interne</div>
              </div>

              <div className="rounded-lg bg-gray-900/80 p-2.5 border border-white/5">
                <div className="text-[10px] text-gray-400">Délai Payback</div>
                <div className="font-mono font-bold text-sm text-white mt-0.5">
                  {bioResult.paybackYears} ans
                </div>
                <div className="text-[9px] text-gray-500">Amortissement net</div>
              </div>
            </div>

            {/* Process & Environmental Guardrails */}
            <div className="text-[11px] text-gray-400 border-t border-white/5 pt-2 flex flex-wrap gap-4">
              {bioResult.requiresPreDrying && (
                <span className="text-amber-400">
                  ⚠️ Séchage thermique amont requis : {bioResult.dryingThermalMwh} MWh pour ramener l'humidité à 12%.
                </span>
              )}
              {bioResult.acidEffluentVolumeM3 > 0 && (
                <span className="text-blue-300">
                  💧 Eaux de lavage acide : {bioResult.acidEffluentVolumeM3} m³ (traitement chaux : {bioResult.effluentTreatmentCostTnd.toLocaleString()} TND/an).
                </span>
              )}
              <span className="text-gray-300">
                🚚 Émissions transport (120 km) : {bioResult.transportEmissionsTco2e} tCO₂e • Agréments ANPE requis.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial 3D Industrial Symbiosis Map */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>{t.symbiosis.mapTitle}</span>
            </h2>
            <p className="text-xs text-gray-400">
              Interconnexion logistique des zones industrielles tunisiennes et routes de symbiose active
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            5 Pôles Industriels Connectés
          </span>
        </div>

        {/* Interactive Map Canvas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {industrialZones.map((zone) => (
            <div
              key={zone.name}
              className="rounded-xl border border-white/5 bg-gray-800/60 p-4 space-y-2 hover:border-emerald-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {zone.name}
                </span>
                <span className="font-mono text-[10px] text-gray-400">
                  {zone.lat.toFixed(2)}°N, {zone.lng.toFixed(2)}°E
                </span>
              </div>
              <div className="text-[11px] text-gray-300">
                Gisement : <span className="font-medium text-amber-300">{zone.waste}</span>
              </div>
              <div className="text-[11px] text-gray-400">
                Filière : <span className="font-medium text-emerald-400">{zone.valorization}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

