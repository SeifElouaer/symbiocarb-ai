'use client';

// ==============================================================================
// SymbioCarb AI - Audit Report & Supplier Emissions Communication PDF Dialog
// Displays unified numbers from cbam-calculator.ts (identical to cockpit & XML).
// ==============================================================================

import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { CbamCalculationResult, BomEntry } from '@/types';
import { STEG_GRID_EF_KG_CO2E_PER_KWH } from '@/lib/engine/cbam-config';

interface AuditReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: CbamCalculationResult;
  entries: BomEntry[];
  companyName: string;
  quarter: string;
  reportingYear: number;
}

export function AuditReportDialog({
  isOpen,
  onClose,
  result,
  entries,
  companyName,
  quarter,
  reportingYear,
}: AuditReportDialogProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const corp = result.corporateFootprint;
  const cbam = result.cbamScope;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl p-6 sm:p-10 border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>COMMUNICATION DES ÉMISSIONS AU CLIENT IMPORTATEUR UE &amp; BILAN ISO 14064-1</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer / Enregistrer en PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="space-y-6 text-slate-800">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  SymbioCarb <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  Communication Fournisseur UE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-serif">
                Communication des émissions au client importateur UE &amp; Inventaire ISO 14064-1
              </p>
            </div>

            <div className="text-end text-xs space-y-0.5 font-mono">
              <div className="font-bold text-slate-900">DOSSIER N° SC-CBAM-{reportingYear}</div>
              <div className="text-slate-500">Date d&apos;édition : {new Date().toLocaleDateString('fr-FR')}</div>
              <div className="text-emerald-700 font-bold">Période : {quarter} {reportingYear}</div>
            </div>
          </div>

          {/* Plant & Verifier Details */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Installation Productrice</div>
              <div className="font-bold text-sm text-slate-900">{companyName}</div>
              <div className="text-slate-600">Site Industriel, Tunisie</div>
              <div className="text-slate-500 font-mono text-[11px]">Code NC / CN : {result.cnCode8 || '—'}</div>
            </div>

            <div className="space-y-1 border-s border-slate-200 ps-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cadre Réglementaire &amp; Normatif</div>
              <div className="font-bold text-slate-900">Règlement (UE) 2023/956 (Période Définitive)</div>
              <div className="text-slate-600">Norme ISO 14064-1:2018 (Scope 1, 2, 3)</div>
              <div className="text-emerald-700 font-bold font-mono">
                Facteur Réseau STEG : {STEG_GRID_EF_KG_CO2E_PER_KWH} kgCO₂e/kWh
              </div>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-3 text-center bg-slate-50">
              <div className="text-[10px] font-bold uppercase text-slate-500">SEE CBAM (Scope B)</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">
                {result.hasProduction && cbam.isInCbamScope ? cbam.cbamSeeTco2ePerTon : '—'}
              </div>
              <div className="text-[10px] text-slate-500">tCO₂e par tonne de produit</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 text-center bg-slate-50">
              <div className="text-[10px] font-bold uppercase text-slate-500">Bilan Corporate (Scope A)</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1 tabular-nums">
                {result.hasData ? corp.totalTco2e : '—'}
              </div>
              <div className="text-[10px] text-slate-500">tCO₂e/an (ISO 14064-1)</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 text-center bg-slate-50">
              <div className="text-[10px] font-bold uppercase text-slate-500">Exposition Importateur UE</div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1 tabular-nums">
                {result.hasProduction && cbam.isInCbamScope
                  ? `${cbam.estimatedLiabilityEur.toLocaleString('fr-FR')} €`
                  : '—'}
              </div>
              <div className="text-[10px] text-slate-500">
                ~{cbam.estimatedLiabilityTnd.toLocaleString('fr-FR')} TND (Prix indicatif : {cbam.cbamCertificatePriceEur} €/t)
              </div>
            </div>
          </div>

          {/* Emissions Breakdown Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Décomposition des Émissions (Scope 1, 2 &amp; Précurseurs)
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-2 text-start">Poste d&apos;Émission</th>
                  <th className="border border-slate-300 p-2 text-start">Source de Données</th>
                  <th className="border border-slate-300 p-2 text-end">Volume (tCO₂e)</th>
                  <th className="border border-slate-300 p-2 text-end">Quote-part A (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">Scope 1 : Émissions Directes de Fabrication</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Combustibles site (gaz, fuel, gasoil)</td>
                  <td className="border border-slate-300 p-2 text-end font-mono font-bold tabular-nums">{corp.scope1DirectTco2e}</td>
                  <td className="border border-slate-300 p-2 text-end font-mono tabular-nums">
                    {((corp.scope1DirectTco2e / (corp.totalTco2e || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">Scope 2 : Électricité Moyenne Tension STEG</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Factures STEG MT ({STEG_GRID_EF_KG_CO2E_PER_KWH} kg/kWh)</td>
                  <td className="border border-slate-300 p-2 text-end font-mono font-bold tabular-nums">{corp.scope2IndirectTco2e}</td>
                  <td className="border border-slate-300 p-2 text-end font-mono tabular-nums">
                    {((corp.scope2IndirectTco2e / (corp.totalTco2e || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-medium">Scope 3 : Matières Premières &amp; Précurseurs</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Nomenclatures BOM (dont {cbam.cbamRelevantPrecursorsTco2e} tCO₂e précurseurs CBAM)</td>
                  <td className="border border-slate-300 p-2 text-end font-mono font-bold tabular-nums">{corp.scope3AllBomTco2e}</td>
                  <td className="border border-slate-300 p-2 text-end font-mono tabular-nums">
                    {((corp.scope3AllBomTco2e / (corp.totalTco2e || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="border border-slate-300 p-2" colSpan={2}>TOTAL EMPREINTE CORPORATE A (ISO 14064-1)</td>
                  <td className="border border-slate-300 p-2 text-end font-mono text-slate-900 tabular-nums">{corp.totalTco2e}</td>
                  <td className="border border-slate-300 p-2 text-end font-mono">100.0%</td>
                </tr>
                <tr className="bg-emerald-50 font-bold">
                  <td className="border border-slate-300 p-2" colSpan={2}>TOTAL ÉMISSIONS INCORPORÉES CBAM B (Secteur : {cbam.sector})</td>
                  <td className="border border-slate-300 p-2 text-end font-mono text-emerald-800 tabular-nums">{cbam.totalCbamEmbeddedTco2e}</td>
                  <td className="border border-slate-300 p-2 text-end font-mono text-emerald-800">
                    Indirectes : {cbam.indirectEmissionsIncluded ? 'Incluses' : 'Exclues'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* BOM Items Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Nomenclatures d&apos;Achats &amp; Facteurs d&apos;Émission Associés
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-1.5 text-start">Composant</th>
                  <th className="border border-slate-300 p-1.5 text-start">Code NC / SH</th>
                  <th className="border border-slate-300 p-1.5 text-end">Masse</th>
                  <th className="border border-slate-300 p-1.5 text-end">Facteur d&apos;Émission</th>
                  <th className="border border-slate-300 p-1.5 text-end">Émissions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-slate-300 p-3 text-center text-slate-500">
                      Aucun intrant BOM déclaré.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="border border-slate-300 p-1.5 font-medium">{entry.raw_description}</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-[11px]">{entry.matched_ef?.cn_code_8 || '—'}</td>
                      <td className="border border-slate-300 p-1.5 text-end font-mono">{entry.quantity.toLocaleString()} {entry.unit}</td>
                      <td className="border border-slate-300 p-1.5 text-end font-mono text-slate-600">{entry.matched_ef?.ef_kgco2e_per_unit ?? 0} kgCO₂e/t</td>
                      <td className="border border-slate-300 p-1.5 text-end font-mono font-bold text-slate-900">{entry.total_tco2e} tCO₂e</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures & Certification Block */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-slate-900">Responsable QHSE &amp; Énergie Usine</div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Je certifie l&apos;exactitude des relevés de consommation STEG MT, combustibles et nomenclatures d&apos;achats communiqués à notre importateur UE.
              </p>
              <div className="pt-6 font-mono text-[11px] text-slate-600 italic">
                Édité le {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="space-y-2 border-s border-slate-200 ps-6">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Empreinte d&apos;Intégrité &amp; Avis Réglementaire</span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 break-all bg-slate-100 p-2 rounded border border-slate-200">
                {result.auditIntegrityHash}
              </p>
              <div className="text-[10px] text-slate-500">
                La déclaration CBAM officielle est déposée par le déclarant CBAM autorisé dans l&apos;UE (l&apos;importateur). Ces données fournisseur doivent être vérifiées par un vérificateur accrédité (ISO 14065).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
