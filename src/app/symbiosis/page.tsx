'use client';

// ==============================================================================
// BioClaira Module (Pack Gold Feature) - Separate Industrial Waste Audit
// Evaluates industrial & agro-industrial waste streams independently from
// core STEG/CBAM calculations, proposing circular valorization & recycling paths.
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useAudit, WasteStreamType } from '@/lib/audit/audit-context';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { simulateBioClairaValorization } from '@/lib/engine/bioclaira-simulator';
import { ArrowRight, Check } from 'lucide-react';

const WASTE_STREAM_OPTIONS: {
  value: WasteStreamType;
  label: string;
  simType: 'olive_pomace' | 'date_pits' | 'margines' | 'metal_shavings' | 'hdpe_plastic';
  proposals: { title: string; detail: string; marketRole: string }[];
}[] = [
  {
    value: 'olive_pomace',
    label: "Grignons d'olive & résidus oléicoles",
    simType: 'olive_pomace',
    proposals: [
      {
        title: 'Biocombustible industriel (Pellets / Briquettes)',
        detail: 'Substitution directe du fuel lourd ou du gaz naturel dans les chaudières industrielles (baisse Scope 1 CBAM).',
        marketRole: 'Énergie thermique décarbonée',
      },
      {
        title: 'Biochar & amendement agronomique',
        detail: 'Séquestration stable du carbone organique et commercialisation vers la filière agricole.',
        marketRole: 'Revenus circulaires & crédits carbone',
      },
    ],
  },
  {
    value: 'date_pits',
    label: 'Noyaux de dattes & sous-produits phoenicicoles',
    simType: 'date_pits',
    proposals: [
      {
        title: 'Charbon actif & biocarbone industriel',
        detail: 'Valorisation thermochimique produisant un biocarbone à haute valeur marchande substituant les intrants fossiles importés.',
        marketRole: 'Substitut d’importation en devises',
      },
      {
        title: 'Syngas énergétique interne',
        detail: 'Récupération de gaz de synthèse pour auto-consommation thermique du site.',
        marketRole: 'Réduction facture énergétique',
      },
    ],
  },
  {
    value: 'olive_mill_wastewater',
    label: 'Margines & effluents agro-industriels liquides',
    simType: 'margines',
    proposals: [
      {
        title: 'Récupération polyphénols & méthanisation',
        detail: 'Extraction de molécules à haute valeur ajoutée et production de biogaz réduisant les rejets en bassins.',
        marketRole: 'Élimination du méthane fugitif',
      },
    ],
  },
  {
    value: 'metal_scrap',
    label: "Copeaux métalliques, chutes d'acier ou aluminium",
    simType: 'metal_shavings',
    proposals: [
      {
        title: 'Refonte en boucle fermée (Fonderies locales)',
        detail: 'Tri par alliage et réinjection vers les aciéries électriques nationales : baisse drastique du facteur Scope 3 CBAM.',
        marketRole: 'Intrant recyclé bas-carbone',
      },
    ],
  },
  {
    value: 'plastic_scrap',
    label: 'Chutes polymères, emballages & plastiques industriels',
    simType: 'hdpe_plastic',
    proposals: [
      {
        title: 'Granulation mécanique & régénération matière',
        detail: 'Broyage, lavage et extrusion en granulés recyclés pour réintégration dans les emballages techniques.',
        marketRole: 'Économie matière & revente B2B',
      },
    ],
  },
];

export default function BioClairaPage() {
  const { subscriptionPlan, setSubscriptionPlan } = useAuth();
  const { auditData, updateAuditData } = useAudit();

  const [pyrolysisTemp, setPyrolysisTemp] = useState(650);
  const [activationMethod, setActivationMethod] = useState<'steam' | 'h3po4'>('h3po4');

  const isGold = subscriptionPlan === 'gold';
  const monthlyTons = auditData.wasteMonthlyTons;
  const annualTons = monthlyTons * 12;
  const selectedMeta =
    WASTE_STREAM_OPTIONS.find((w) => w.value === auditData.wasteType) || WASTE_STREAM_OPTIONS[0];

  const hasWaste = annualTons > 0;

  const bioResult = hasWaste
    ? simulateBioClairaValorization({
        wasteType: selectedMeta.simType,
        rawTonnage: annualTons,
        moisturePct: auditData.moisturePercent > 0 ? auditData.moisturePercent : undefined,
        pyrolysisTempC: pyrolysisTemp,
        activationMethod,
      })
    : null;

  const annualDisposalSavingsTnd = Math.round(annualTons * auditData.disposalCostTndPerTon);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="BioClaira — Audit Séparé des Déchets & Revenus Circulaires"
        badge="Option Pack Gold"
        badgeColor="bg-amber-500/10 text-amber-300 border-amber-500/30"
        objective="Auditer séparément vos flux de rejets industriels ou agro-industriels afin d'identifier des filières de recyclage, de valorisation matière/énergie et de génération de revenus circulaires."
        inputs={[
          'Nature du gisement résiduel généré par votre usine',
          'Volume mensuel ou annuel disponible (tonnes)',
          'Taux d’humidité et coût actuel de mise en décharge (TND/t)',
        ]}
        deliverables={[
          'Propositions de recyclage et de valorisation adaptées au flux',
          'Estimation des revenus circulaires nets et économies de décharge',
          'Impact optionnel sur votre bilan carbone global (Scope 1 & Scope 3)',
        ]}
        regulation="Économie Circulaire, Cadre ANPE Déchets, GHG Protocol Scope 1/3 & Certification Biochar EBC"
      />

      {/* Gold Feature Plan Notice / Upgrade Gate */}
      {!isGold ? (
        <div className="rounded-2xl border border-amber-500/35 bg-[#0D1322] p-6 sm:p-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Fonctionnalité Additionnelle • Pack Gold
              </div>
              <h2 className="text-xl font-bold text-white">
                Module optionnel BioClaira : transformez vos rejets en revenus circulaires
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                L&apos;audit des déchets est volontairement séparé de votre suivi électrique STEG et de votre déclaration CBAM de base. Activez l&apos;option Pack Gold pour analyser vos sous-produits (agro-biomasse, chutes métalliques, polymères) et calculer leur potentiel de valorisation marchande ou de substitution énergétique.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Audit séparé sans alourdir la saisie STEG</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Scénarios de recyclage &amp; valorisation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Lien optionnel vers le bilan Scope 1/3</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setSubscriptionPlan('gold')}
                className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-5 py-3 transition-all"
              >
                <span>Activer l&apos;option Pack Gold (BioClaira)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-xs">
          <div className="text-slate-200">
            <strong className="text-emerald-400">Pack Gold actif :</strong> l&apos;audit séparé des déchets BioClaira est activé pour votre usine.
          </div>
          <span className="font-mono text-[11px] text-emerald-400">Statut : Actif</span>
        </div>
      )}

      {/* Main Waste Audit Workspace (Visible once Gold activated, or previewable cleanly at 0) */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${!isGold ? 'opacity-60 pointer-events-none select-none' : ''}`}>
        {/* Left: Waste Stream Inputs (Starts at 0) */}
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white">Déclaration du flux de déchet</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Renseignez les quantités réelles générées par votre site (0 par défaut).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-slate-300 font-medium">Nature du rejet industriel</label>
            <select
              value={auditData.wasteType}
              onChange={(e) => updateAuditData({ wasteType: e.target.value as WasteStreamType })}
              className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {WASTE_STREAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Volume mensuel (tonnes/mois)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={auditData.wasteMonthlyTons || ''}
                onChange={(e) =>
                  updateAuditData({ wasteMonthlyTons: Math.max(0, Number(e.target.value) || 0) })
                }
                placeholder="0"
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Humidité (%)</label>
              <input
                type="number"
                min="0"
                max="95"
                value={auditData.moisturePercent || ''}
                onChange={(e) =>
                  updateAuditData({ moisturePercent: Math.min(95, Math.max(0, Number(e.target.value) || 0)) })
                }
                placeholder="0"
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Coût actuel d&apos;évacuation / décharge (TND / tonne)
            </label>
            <input
              type="number"
              min="0"
              value={auditData.disposalCostTndPerTon || ''}
              onChange={(e) =>
                updateAuditData({ disposalCostTndPerTon: Math.max(0, Number(e.target.value) || 0) })
              }
              placeholder="0"
              className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {(auditData.wasteType === 'date_pits' ||
            auditData.wasteType === 'olive_pomace' ||
            auditData.wasteType === 'olive_mill_wastewater') && (
            <div className="space-y-3 pt-2 border-t border-white/[0.08]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Température de conversion</span>
                <span className="font-mono text-emerald-400 font-bold">{pyrolysisTemp} °C</span>
              </div>
              <input
                type="range"
                min="450"
                max="850"
                step="25"
                value={pyrolysisTemp}
                onChange={(e) => setPyrolysisTemp(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 bg-black/40 rounded-lg cursor-pointer h-2"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivationMethod('h3po4')}
                  className={`rounded-lg border p-2 text-[11px] font-semibold transition-all ${
                    activationMethod === 'h3po4'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/[0.08] bg-black/30 text-slate-400'
                  }`}
                >
                  Voie Chimique
                </button>
                <button
                  type="button"
                  onClick={() => setActivationMethod('steam')}
                  className={`rounded-lg border p-2 text-[11px] font-semibold transition-all ${
                    activationMethod === 'steam'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/[0.08] bg-black/30 text-slate-400'
                  }`}
                >
                  Voie Vapeur
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results & Recycling Proposals */}
        <div className="lg:col-span-2 rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Résultats de l&apos;audit circulaire</h2>
              <p className="text-[11px] text-slate-400">
                Base annuelle : <span className="font-mono text-white">{annualTons.toLocaleString('fr-TN')} tonnes/an</span>
              </p>
            </div>
            <span className="font-mono text-xs text-emerald-400">
              Rendement : {bioResult ? `${bioResult.activatedCarbonYieldPct}%` : '0%'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5">
              <div className="text-[11px] text-slate-400">Matière valorisée</div>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {bioResult ? (bioResult.activatedCarbonTons + bioResult.biocharTons).toFixed(1) : '0'}{' '}
                <span className="text-xs font-normal text-slate-400">t/an</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5">
              <div className="text-[11px] text-slate-400">Revenu circulaire net</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {bioResult ? bioResult.netAnnualProfitTnd.toLocaleString('fr-TN') : '0'}{' '}
                <span className="text-xs font-normal text-slate-400">TND/an</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5">
              <div className="text-[11px] text-slate-400">Économie décharge</div>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {annualDisposalSavingsTnd.toLocaleString('fr-TN')}{' '}
                <span className="text-xs font-normal text-slate-400">TND/an</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5">
              <div className="text-[11px] text-slate-400">CO₂e évité (optionnel)</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {bioResult ? bioResult.netAvoidedTco2e.toLocaleString('fr-TN') : '0'}{' '}
                <span className="text-xs font-normal text-slate-400">tCO₂e/an</span>
              </div>
            </div>
          </div>

          {/* Proposals for Recycling & Circular Valorization */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Propositions de recyclage et valorisation adaptées à votre flux
            </h3>

            {!hasWaste ? (
              <div className="rounded-xl border border-dashed border-white/[0.1] bg-black/20 p-5 text-center text-xs text-slate-400">
                Saisissez un volume mensuel supérieur à 0 tonne pour générer les scénarios chiffrés de valorisation.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedMeta.proposals.map((prop) => (
                  <div
                    key={prop.title}
                    className="rounded-xl border border-white/[0.08] bg-black/30 p-4 space-y-1.5"
                  >
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                      {prop.marketRole}
                    </div>
                    <div className="text-xs font-bold text-white">{prop.title}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{prop.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integration Note with Global Formula */}
          <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Rôle dans le bilan global :</strong> les tonnages valorisés ci-dessus sont calculés séparément afin de ne pas fausser vos obligations réglementaires STEG et CBAM. En cas de réutilisation thermique interne (substitution de combustibles Scope 1), les émissions évitées peuvent être intégrées comme crédit de réduction dans votre bilan RSE/ISO 14064-1.
          </div>
        </div>
      </div>
    </div>
  );
}
