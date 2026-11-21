'use client';

// ==============================================================================
// Module CBAM: EU Carbon Border Adjustment Mechanism & ISO 14064-1
// Zero hardcoded auto-parts or mock Ben Arous factories; reads real factory state.
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAudit } from '@/lib/audit/audit-context';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { AuditReportDialog } from '@/components/cbam/AuditReportDialog';
import { FALLBACK_EMISSION_FACTORS } from '@/lib/supabase/fallback-data';
import { calculateCbamSpecificEmbeddedEmissions } from '@/lib/engine/cbam-calculator';
import { BomEntry, CbamCalculationResult } from '@/types';
import { Download, Printer, Plus, Trash2 } from 'lucide-react';

export default function CbamPage() {
  const { t } = useTranslation();
  const { auditData, results, addBomMaterial, removeBomMaterial, openAddDataModal } = useAudit();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedResults, setMatchedResults] = useState(FALLBACK_EMISSION_FACTORS);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  // Inline BOM entry form
  const [bomName, setBomName] = useState('');
  const [bomCn, setBomCn] = useState('');
  const [bomQty, setBomQty] = useState('');
  const [bomEf, setBomEf] = useState('');

  const hasProduction = auditData.annualProductionTons > 0;
  const fuelKwh =
    (auditData.naturalGasM3 * 10 + auditData.heavyFuelTons * 11600 + auditData.dieselLiters * 10) * 12;
  const elecKwh = results.kwhTotal * 12;

  const precursors = auditData.bomMaterials.map((m) => ({
    name: m.name,
    cnCode8: m.cnCode8 || '00000000',
    quantityTons: m.quantityTons,
    efTco2ePerTon: m.efTco2ePerTon,
  }));

  const cbamResult: CbamCalculationResult = hasProduction
    ? calculateCbamSpecificEmbeddedEmissions({
        productName: auditData.exportProductName || 'Produit industriel non spécifié',
        cnCode8: auditData.exportCnCode || '0000 00 00',
        finishedProductTons: auditData.annualProductionTons,
        scope1FuelKwh: fuelKwh,
        scope2ElectricityKwh: elecKwh,
        precursors,
        euEtsPriceEur: 85.0,
      })
    : {
        productName: auditData.exportProductName || 'Aucun produit déclaré',
        cnCode8: auditData.exportCnCode || '—',
        finishedProductTons: 0,
        scope1DirectTco2e: results.scope1Tco2e,
        scope2IndirectTco2e: results.scope2Tco2e,
        scope3PrecursorsTco2e: results.scope3Tco2e,
        totalEmbeddedTco2e: results.totalTco2e,
        specificEmbeddedEmissionsTco2ePerTon: 0,
        euEtsCarbonPriceEur: 85.0,
        estimatedCbamTaxLiabilityEur: 0,
        estimatedCbamTaxLiabilityTnd: 0,
        freeAllocationBenchmarkGap: 0,
        verificationStatus: 'PRE_AUDIT_DRAFT',
        accreditationBodyId: 'ACCREDITATION-PENDING-ISO14065',
        auditIntegrityHash: 'PENDING-DATA',
        regulatoryDisclaimer:
          'Renseignez votre production annuelle, vos combustibles et vos nomenclatures BOM pour calculer votre SEE spécifique.',
        gridEmissionSource: 'STEG Réseau National Moyenne Tension (0.473 kgCO₂e/kWh)',
      };

  const handleVectorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatchedResults(data.matches);
      }
    } catch {
      // keep existing list
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddBom = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(bomQty);
    const ef = parseFloat(bomEf);
    if (!bomName.trim() || !Number.isFinite(qty) || qty <= 0) return;
    addBomMaterial({
      name: bomName.trim(),
      cnCode8: bomCn.trim(),
      quantityTons: qty,
      efTco2ePerTon: Number.isFinite(ef) ? ef : 0,
    });
    setBomName('');
    setBomCn('');
    setBomQty('');
    setBomEf('');
  };

  const xmlQueryParams = new URLSearchParams({
    company: auditData.companyName || 'Entreprise',
    governorate: auditData.governorate || 'Tunisie',
    zone: auditData.industrialZone || '',
    cnCode: auditData.exportCnCode || '00000000',
    product: auditData.exportProductName || 'Produit',
    productionTons: String(auditData.annualProductionTons || 0),
    scope1: String(results.scope1Tco2e),
    scope2: String(results.scope2Tco2e),
    scope3: String(results.scope3Tco2e),
    see: String(results.specificEmbeddedEmissionsTco2ePerTon),
  }).toString();

  const pdfBomEntries: BomEntry[] = auditData.bomMaterials.map((m) => ({
    id: m.id,
    org_id: 'factory',
    raw_description: m.name,
    quantity: m.quantityTons * 1000,
    unit: 'kg',
    scope: 3,
    total_tco2e: Number((m.quantityTons * m.efTco2ePerTon).toFixed(2)),
    matched_ef: {
      id: m.id,
      code: m.cnCode8 || 'BOM',
      name_fr: m.name,
      name_en: m.name,
      name_ar: m.name,
      category: 'raw_materials',
      cn_code_8: m.cnCode8,
      unit: 't',
      ef_kgco2e_per_unit: m.efTco2ePerTon * 1000,
      scope: 3,
      source_authority: 'Nomenclature Entreprise',
    },
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.cbam.title}
        badge="Règlement (UE) 2023/956"
        badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
        objective="Calculer les Émissions Spécifiques Incorporées (SEE) réelles de vos produits exportés, rapprocher vos nomenclatures BOM avec la base de facteurs d'émissions et générer votre XML CBAM."
        inputs={[
          'Production annuelle et volume exporté UE (tonnes)',
          'Combustibles directs Scope 1 (gaz naturel, fuel, gasoil)',
          'Électricité STEG Scope 2 et matières premières entrantes Scope 3',
        ]}
        deliverables={[
          'SEE spécifique en tCO₂e / tonne de produit fini',
          'Exposition financière CBAM estimée (cours ETS 85 €/t)',
          'Fichier XML conforme DG TAXUD & attestation PDF',
        ]}
        regulation="Règlement (UE) 2023/956, Règlement d'exécution (UE) 2023/1773 & ISO 14064-1"
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            Déclaration CBAM — {auditData.companyName || 'Entreprise non configurée'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Code douanier CN : {auditData.exportCnCode || 'Non défini'} • Production :{' '}
            {auditData.annualProductionTons.toLocaleString('fr-TN')} t/an
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openAddDataModal('cbam')}
            className="btn-tactile flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.08]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Modifier production / combustibles</span>
          </button>

          <button
            onClick={() => setIsPdfDialogOpen(true)}
            className="btn-tactile flex items-center gap-2 rounded-xl bg-white/[0.08] text-white px-3.5 py-2 text-xs font-bold hover:bg-white/[0.14]"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            <span>Rapport PDF</span>
          </button>

          <a
            href={`/api/export/cbam-xml?${xmlQueryParams}`}
            download
            className="btn-tactile flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exporter XML UE</span>
          </a>
        </div>
      </div>

      {/* 4 Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.seeTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {cbamResult.specificEmbeddedEmissionsTco2ePerTon}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">tCO₂e/t</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Produit : {auditData.annualProductionTons.toLocaleString('fr-TN')} t/an
          </div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.scope1}</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {results.scope1Tco2e.toLocaleString('fr-TN')}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">tCO₂e</span>
          </div>
          <div className="text-[11px] text-slate-400">Combustibles directs</div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.scope2}</div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 tabular-nums">
            {results.scope2Tco2e.toLocaleString('fr-TN')}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">tCO₂e</span>
          </div>
          <div className="text-[11px] text-slate-400">Réseau STEG (0.473 kg/kWh)</div>
        </div>

        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-5 space-y-1.5">
          <div className="text-xs text-slate-400 font-medium">{t.cbam.taxExposureTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {results.cbamTaxExposureEur.toLocaleString('fr-TN')}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">€</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ≈ {results.cbamTaxExposureTnd.toLocaleString('fr-TN')} TND (@ 85€/t)
          </div>
        </div>
      </div>

      {/* Factory BOM Precursors Manager */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">
              Nomenclature des Matières Premières (Scope 3 BOM)
            </h2>
            <p className="text-xs text-slate-400">
              Ajoutez les matières premières entrantes de votre usine pour intégrer leurs émissions incorporées.
            </p>
          </div>
          <div className="text-xs font-mono text-emerald-400">
            Scope 3 Total : {results.scope3Tco2e.toLocaleString('fr-TN')} tCO₂e
          </div>
        </div>

        <form onSubmit={handleAddBom} className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
          <input
            type="text"
            value={bomName}
            onChange={(e) => setBomName(e.target.value)}
            placeholder="Désignation matière première"
            className="sm:col-span-2 rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="text"
            value={bomCn}
            onChange={(e) => setBomCn(e.target.value)}
            placeholder="Code CN (8 chiffres)"
            className="rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            min="0"
            step="0.1"
            value={bomQty}
            onChange={(e) => setBomQty(e.target.value)}
            placeholder="Quantité (t/an)"
            className="rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={bomEf}
            onChange={(e) => setBomEf(e.target.value)}
            placeholder="Facteur (tCO2e/t)"
            className="rounded-xl bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="btn-tactile rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 py-2"
          >
            + Ajouter intrant
          </button>
        </form>

        {auditData.bomMaterials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-black/20 px-4 py-5 text-center text-xs text-slate-500">
            Aucun intrant matière première déclaré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-start text-xs">
              <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4 text-start">Matière</th>
                  <th className="py-2.5 px-4 text-start">Code CN</th>
                  <th className="py-2.5 px-4 text-start">Quantité</th>
                  <th className="py-2.5 px-4 text-start">Facteur</th>
                  <th className="py-2.5 px-4 text-start">Total Scope 3</th>
                  <th className="py-2.5 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] font-mono">
                {auditData.bomMaterials.map((m) => (
                  <tr key={m.id} className="text-slate-200">
                    <td className="py-2.5 px-4 font-sans font-medium text-white">{m.name}</td>
                    <td className="py-2.5 px-4 text-blue-400">{m.cnCode8 || '—'}</td>
                    <td className="py-2.5 px-4">{m.quantityTons} t</td>
                    <td className="py-2.5 px-4">{m.efTco2ePerTon} tCO₂e/t</td>
                    <td className="py-2.5 px-4 text-emerald-400">
                      {(m.quantityTons * m.efTco2ePerTon).toFixed(2)} tCO₂e
                    </td>
                    <td className="py-2.5 px-4 text-end">
                      <button
                        onClick={() => removeBomMaterial(m.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reference Emission Factors Lookup Table (ADEME / JRC) */}
      <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Référentiel des Facteurs d&apos;Émission Officiels</h2>
            <p className="text-xs text-slate-400">
              Recherche sémantique dans les facteurs officiels ANME, STEG et EU JRC
            </p>
          </div>

          <form onSubmit={handleVectorSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un matériau ou combustible..."
              className="bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-xl bg-white/[0.08] hover:bg-white/[0.14] px-3.5 py-2 text-xs font-bold text-white shrink-0"
            >
              {isSearching ? '...' : 'Rechercher'}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-start text-xs">
            <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] text-[10px] font-mono uppercase">
              <tr>
                <th className="py-2.5 px-4 text-start">Désignation</th>
                <th className="py-2.5 px-4 text-start">Code CN</th>
                <th className="py-2.5 px-4 text-start">Scope</th>
                <th className="py-2.5 px-4 text-start">Facteur</th>
                <th className="py-2.5 px-4 text-start">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-200">
              {matchedResults.map((ef) => (
                <tr key={ef.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-medium text-white">{ef.name_fr}</td>
                  <td className="py-2.5 px-4 font-mono text-blue-400">{ef.cn_code_8 || 'Énergie'}</td>
                  <td className="py-2.5 px-4 font-mono">Scope {ef.scope}</td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {ef.ef_kgco2e_per_unit.toLocaleString('fr-TN')} kgCO₂e/{ef.unit}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">{ef.source_authority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AuditReportDialog
        isOpen={isPdfDialogOpen}
        onClose={() => setIsPdfDialogOpen(false)}
        result={cbamResult}
        entries={pdfBomEntries}
        companyName={auditData.companyName || 'Entreprise'}
        quarter="T1 (Q1)"
        reportingYear={new Date().getFullYear()}
      />
    </div>
  );
}
