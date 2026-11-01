'use client';

// ==============================================================================
// Module B: EU CBAM (MACF) & ISO 14064 Carbon Compliance Hub
// Specific Embedded Emissions (SEE), BOM Vector Matching & Official XML Export
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { FALLBACK_ORGANIZATIONS, FALLBACK_EMISSION_FACTORS } from '@/lib/supabase/fallback-data';
import { calculateCbamSpecificEmbeddedEmissions } from '@/lib/engine/cbam-calculator';
import { 
  Globe2, 
  FileText, 
  Download, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Upload, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export default function CbamPage() {
  const { t, locale, persona } = useTranslation();
  const org = FALLBACK_ORGANIZATIONS[persona] || FALLBACK_ORGANIZATIONS.benarous;

  // Search query for vector RAG
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedResults, setMatchedResults] = useState(FALLBACK_EMISSION_FACTORS);

  // Precursor materials for CBAM calculation
  const precursors = [
    {
      name: 'Cold-rolled flat steel coils (Bobines acier laminé à froid)',
      cnCode8: '7209 16 90',
      quantityTons: 475.0,
      efTco2ePerTon: 2.45,
    },
    {
      name: 'Extruded aluminum profiles (Profilés aluminium usinés)',
      cnCode8: '7604 21 00',
      quantityTons: 25.0,
      efTco2ePerTon: 9.2,
    },
  ];

  const cbamResult = calculateCbamSpecificEmbeddedEmissions({
    productName: 'Composants mécaniques usinés pour l\'industrie automobile européenne',
    cnCode8: '7209 16 90',
    finishedProductTons: 450.0,
    scope1FuelKwh: 240500, // Gaz naturel
    scope2ElectricityKwh: 134000, // STEG MT
    precursors,
    euEtsPriceEur: 85.0,
  });

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="h-6 w-6 text-blue-400" />
            <span>{t.cbam.title}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {t.cbam.subtitle} • {org.name_fr}
          </p>
        </div>

        {/* 1-Click Export Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/api/export/cbam-xml"
            download
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>{t.cbam.exportXml}</span>
          </a>
        </div>
      </div>

      {/* ISO 14065 Verifier Status & Legal Audit Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Certification ISO 14065 &amp; Registre TAXUD 2026
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-bold">
              {cbamResult.verificationStatus}
            </span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Audit Hash: <span className="text-blue-300">{cbamResult.auditIntegrityHash}</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          {cbamResult.regulatoryDisclaimer}
        </p>
      </div>

      {/* Specific Embedded Emissions (SEE) Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SEE Value */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-2">
          <div className="text-xs text-gray-400 font-semibold">{t.cbam.seeTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {cbamResult.specificEmbeddedEmissionsTco2ePerTon} <span className="text-xs text-gray-400 font-sans">tCO₂e / tonne</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Produit fini : <span className="text-gray-200 font-medium">450 tonnes</span>
          </div>
        </div>

        {/* Scope 1 */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-2">
          <div className="text-xs text-gray-400 font-semibold">{t.cbam.scope1}</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {cbamResult.scope1DirectTco2e} <span className="text-xs text-gray-400 font-sans">tCO₂e</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Gaz naturel STEG (0.202 kg/kWh)
          </div>
        </div>

        {/* Scope 2 */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 space-y-2">
          <div className="text-xs text-gray-400 font-semibold">{t.cbam.scope2}</div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {cbamResult.scope2IndirectTco2e} <span className="text-xs text-gray-400 font-sans">tCO₂e</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Électricité réseau TN (0.473 kg/kWh)
          </div>
        </div>

        {/* CBAM Tax Liability */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 space-y-2">
          <div className="text-xs text-red-300 font-semibold">{t.cbam.taxExposureTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {cbamResult.estimatedCbamTaxLiabilityEur.toLocaleString()} <span className="text-xs text-gray-300 font-sans">€</span>
          </div>
          <div className="text-[11px] text-red-200/80">
            ≈ {cbamResult.estimatedCbamTaxLiabilityTnd.toLocaleString()} TND (@ 85€/tCO₂e)
          </div>
        </div>
      </div>

      {/* Multilingual Vector RAG BOM Matcher */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{t.cbam.bomTitle}</span>
            </h2>
            <p className="text-xs text-gray-400">
              {t.cbam.ragStatus}
            </p>
          </div>

          <form onSubmit={handleVectorSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: Bobines acier laminé à froid 12T (ou بالتونسي)..."
              className="bg-gray-800 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 w-full sm:w-80"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-all shrink-0"
            >
              {isSearching ? 'Recherche...' : 'Matcher RAG'}
            </button>
          </form>
        </div>

        {/* Matched Factors Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-start text-xs">
            <thead className="bg-gray-800/80 text-gray-400 font-semibold border-b border-white/5">
              <tr>
                <th className="py-3 px-4 text-start">Désignation (FR / EN / AR)</th>
                <th className="py-3 px-4 text-start font-mono">Code Douanier (CN 8)</th>
                <th className="py-3 px-4 text-start">Scope</th>
                <th className="py-3 px-4 text-start">Facteur d'Émission</th>
                <th className="py-3 px-4 text-start">Source</th>
                <th className="py-3 px-4 text-end">Score RAG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {matchedResults.map((ef) => (
                <tr key={ef.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{ef.name_fr}</div>
                    <div className="text-[11px] text-gray-400 font-arabic">{ef.name_ar}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-400 font-semibold">
                    {ef.cn_code_8 || 'N/A (Énergie)'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded px-2 py-0.5 text-[10px] font-mono font-bold bg-gray-800 border border-white/10">
                      Scope {ef.scope}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {ef.ef_kgco2e_per_unit.toLocaleString()} <span className="text-gray-400 font-normal">kgCO₂e/{ef.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-[11px]">
                    {ef.source_authority}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 font-bold">
                      {Math.round((ef.similarity || 0.94) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

