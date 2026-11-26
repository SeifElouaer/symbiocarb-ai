'use client';

// ==============================================================================
// SymbioCarb AI - Audit Report & Supplier Emissions Communication PDF Dialog
// Displays Result A (ISO 14064-1) and Result B (CBAM 2026+) side by side with
// explicit regulatory rules applied.
// ==============================================================================

import React from 'react';
import { X, Printer, ShieldCheck, Lock } from 'lucide-react';
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
              <div className="text-emerald-700 font-bold">Année : {reportingYear} ({quarter})</div>
            </div>
          </div>

          {/* Plant & Regulatory Rules Applied */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Installation Productrice</div>
              <div className="font-bold text-sm text-slate-900">{companyName}</div>
              <div className="text-slate-600">Site Industriel, Tunisie</div>
              <div className="text-slate-500 font-mono text-[11px]">Code NC / CN : {result.cnCode8 || '—'}</div>
              <div className="text-slate-500 font-mono text-[11px]">
                Production : {result.finishedProductTons} t · Export UE : {cbam.exportTonnes} t
              </div>
            </div>

            <div className="space-y-1 border-s border-slate-200 ps-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Règles CBAM Appliquées (Période Définitive)</div>
              <div className="font-mono text-[11px] text-slate-800">
                Secteur : <strong>{cbam.sector}</strong> · Indirectes comptées :{' '}
                <strong>{cbam.indirectEmissionsIncluded ? 'Oui' : 'Non'}</strong>
              </div>
              <div className="font-mono text-[11px] text-slate-800">
                Précurseurs comptés : <strong>{cbam.cbamRelevantPrecursorsTco2e} tCO₂e</strong>
              </div>
              <div className="font-mono text-[11px] text-slate-800">
                Année : <strong>{cbam.reportingYear}</strong> · Facteur allocation gratuite :{' '}
                <strong>{(cbam.freeAllocationFactor * 100).toFixed(1)}%</strong>
              </div>
              <div className="font-mono text-[11px] text-emerald-700 font-bold">
                Benchmark : {cbam.benchmarkTco2ePerTon} tCO₂e/t · Prix indicatif : {cbam.cbamCertificatePriceEur} €/t
              </div>
            </div>
          </div>

          {/* Side-by-Side Result A & Result B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                A. Empreinte Corporate Complète (ISO 14064-1)
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {result.hasData ? `${corp.totalTco2e.toLocaleString('fr-FR')} tCO₂e/an` : '—'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                <div>Scope 1 (combustibles) : {corp.scope1DirectTco2e} tCO₂e</div>
                <div>Scope 2 (électricité STEG {STEG_GRID_EF_KG_CO2E_PER_KWH}) : {corp.scope2IndirectTco2e} tCO₂e</div>
                <div>Scope 3 (tous intrants BOM) : {corp.scope3AllBomTco2e} tCO₂e</div>
                <div>Intensité corporate : {result.hasProduction ? `${corp.intensityTco2ePerTon} tCO₂e/t` : '—'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400 bg-emerald-50/70 p-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                B. Émissions Incorporées CBAM (Règl. UE 2023/956)
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono tabular-nums">
                {result.hasProduction && cbam.isInCbamScope
                  ? `${cbam.cbamSeeTco2ePerTon} tCO₂e/t`
                  : '—'}
              </div>
              <div className="text-[11px] text-slate-700 font-mono space-y-0.5">
                <div>Total CBAM B : {cbam.totalCbamEmbeddedTco2e} tCO₂e</div>
                <div>Directes : {cbam.directEmissionsTco2e} · Précurseurs CBAM : {cbam.cbamRelevantPrecursorsTco2e} t</div>
                <div>
                  Indirectes : {cbam.indirectEmissionsCountedTco2e} t comptées (info : {cbam.indirectEmissionsForInfoTco2e} t)
                </div>
                <div className="font-bold text-emerald-800">
                  Exposition importateur :{' '}
                  {result.hasProduction && cbam.isInCbamScope
                    ? `${cbam.estimatedLiabilityEur.toLocaleString('fr-FR')} € (${cbam.certificatesRequired} cert.)`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* BOM Items Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Nomenclatures d&apos;Achats &amp; Statut Précurseur CBAM
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-1.5 text-start">Composant</th>
                  <th className="border border-slate-300 p-1.5 text-start">Code NC / SH</th>
                  <th className="border border-slate-300 p-1.5 text-start">Périmètre</th>
                  <th className="border border-slate-300 p-1.5 text-end">Masse</th>
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
                      <td className="border border-slate-300 p-1.5 font-mono text-[10px]">
                        {entry.matched_ef?.source_authority || 'BOM'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-end font-mono">{entry.quantity.toLocaleString()} {entry.unit}</td>
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
