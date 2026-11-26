'use client';

// ==============================================================================
// SymbioCarb AI - First-Time Factory Onboarding Modal
// Appears on first login: collects factory identity, offers official document
// OCR scan / multi-month CSV import, or lets user skip directly to zero-state.
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useAudit, MonthlyBillEntry } from '@/lib/audit/audit-context';
import { FIELD_GUIDES } from '@/lib/ux/field-guides';
import { FieldLabel, FieldHint, FieldWarning } from '@/components/ui/FieldLabel';
import { Sector, StegTariffType } from '@/types';
import { Upload, ArrowRight, ArrowLeft, AlertCircle, Check } from 'lucide-react';

function parseCsvHistory(text: string): Omit<MonthlyBillEntry, 'id'>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  const findIdx = (keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)));
  const iMonth = findIdx(['mois', 'month']);
  const iYear = findIdx(['annee', 'année', 'year']);
  const iJour = findIdx(['jour', 'day']);
  const iPointe = findIdx(['pointe', 'peak']);
  const iSoir = findIdx(['soir', 'evening']);
  const iNuit = findIdx(['nuit', 'night']);
  const iKvarh = findIdx(['kvarh', 'reactiv']);
  const iCos = findIdx(['cos']);
  const iPs = findIdx(['souscrite', 'ps']);
  const iPmax = findIdx(['pmax', 'appelee', 'appelée']);
  const iPenR = findIdx(['penalite_r', 'reactive_pen']);
  const iTotal = findIdx(['ttc', 'total', 'montant']);

  const entries: Omit<MonthlyBillEntry, 'id'>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(',', '.'));
    const num = (idx: number, fallback = 0) => {
      if (idx < 0 || idx >= cols.length) return fallback;
      const val = parseFloat(cols[idx]);
      return Number.isFinite(val) ? val : fallback;
    };

    const kwhJour = num(iJour);
    const kwhPointe = num(iPointe);
    const kwhSoir = num(iSoir);
    const kwhNuit = num(iNuit);
    if (kwhJour + kwhPointe + kwhSoir + kwhNuit <= 0 && num(iTotal) <= 0) continue;

    entries.push({
      month: Math.min(12, Math.max(1, Math.round(num(iMonth, ((i - 1) % 12) + 1)))),
      year: Math.round(num(iYear, new Date().getFullYear())),
      tariffRegime: 'MT_POSTES_HORAIRES',
      pSouscriteKva: num(iPs),
      pMaxAppeleeKva: num(iPmax),
      kwhJour,
      kwhPointe,
      kwhSoir,
      kwhNuit,
      kvarhTotal: num(iKvarh),
      cosPhi: num(iCos, 0.85),
      reactivePenaltyTnd: num(iPenR),
      powerOverrunPenaltyTnd: 0,
      totalTtcTnd: num(iTotal),
      source: 'csv',
    });
  }
  return entries;
}

export function FactoryOnboardingModal() {
  const { isAuthenticated, hasCompletedOnboarding, completeOnboarding, user } = useAuth();
  const { auditData, updateAuditData, addMonthlyBill, importMonthlyBills } = useAudit();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Identity
  const [companyName, setCompanyName] = useState(auditData.companyName);
  const [fiscalId, setFiscalId] = useState(auditData.fiscalId);
  const [governorate, setGovernorate] = useState(auditData.governorate);
  const [industrialZone, setIndustrialZone] = useState(auditData.industrialZone);
  const [sector, setSector] = useState<Sector>(auditData.sector || 'metal_mechanics');
  const [exportCnCode, setExportCnCode] = useState(auditData.exportCnCode);
  const [exportProductName, setExportProductName] = useState(auditData.exportProductName);
  const [annualProductionTons, setAnnualProductionTons] = useState<string>(
    auditData.annualProductionTons > 0 ? String(auditData.annualProductionTons) : ''
  );
  const [annualExportTons, setAnnualExportTons] = useState<string>(
    auditData.annualExportTons > 0 ? String(auditData.annualExportTons) : ''
  );

  // Step 2: Historical data / Document import / Manual
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [tariffRegime, setTariffRegime] = useState<StegTariffType>('MT_POSTES_HORAIRES');
  const [pSouscriteKva, setPSouscriteKva] = useState('');
  const [pMaxAppeleeKva, setPMaxAppeleeKva] = useState('');
  const [kwhJour, setKwhJour] = useState('');
  const [kwhPointe, setKwhPointe] = useState('');
  const [kwhSoir, setKwhSoir] = useState('');
  const [kwhNuit, setKwhNuit] = useState('');
  const [kvarhTotal, setKvarhTotal] = useState('');
  const [cosPhi, setCosPhi] = useState('');
  const [reactivePenaltyTnd, setReactivePenaltyTnd] = useState('');
  const [totalTtcTnd, setTotalTtcTnd] = useState('');
  const [naturalGasM3, setNaturalGasM3] = useState('');
  const [heavyFuelTons, setHeavyFuelTons] = useState('');

  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docStatus, setDocStatus] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [importedCsvCount, setImportedCsvCount] = useState<number>(0);

  if (!isAuthenticated || hasCompletedOnboarding) return null;

  const parseNum = (val: string) => {
    const n = parseFloat(val);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setDocError(null);
    setDocStatus(null);
    setIsProcessingDoc(true);

    try {
      // Branch 1: CSV batch import for multi-month / multi-year historical data
      if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
        const text = await file.text();
        const parsedBills = parseCsvHistory(text);
        if (parsedBills.length === 0) {
          setDocError('Aucune ligne valide détectée dans le CSV. Vérifiez les en-têtes (mois, annee, jour, pointe, soir, nuit, cos_phi, total_ttc).');
        } else {
          importMonthlyBills(parsedBills);
          setImportedCsvCount(parsedBills.length);
          setDocStatus(`${parsedBills.length} période(s) mensuelle(s) importée(s) depuis le fichier CSV.`);
        }
        return;
      }

      // Branch 2: Official document scan (PDF / Image) via Vision OCR
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const cleanBase64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(cleanBase64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || 'application/pdf',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.extracted) {
        setDocError(
          data.error ||
            "L'extraction automatique n'a pas pu lire ce document. Vous pouvez saisir vos chiffres ci-dessous ou passer cette étape."
        );
      } else {
        const ext = data.extracted;
        if (ext.billingMonth) setMonth(Number(ext.billingMonth));
        if (ext.billingYear) setYear(Number(ext.billingYear));
        if (
          ext.tariffRegime === 'MT_POSTES_HORAIRES' ||
          ext.tariffRegime === 'MT_UNIFORME' ||
          ext.tariffRegime === 'HT'
        ) {
          setTariffRegime(ext.tariffRegime);
        }
        if (ext.pSouscriteKva != null) setPSouscriteKva(String(ext.pSouscriteKva));
        if (ext.pMaxAppeleeKva != null) setPMaxAppeleeKva(String(ext.pMaxAppeleeKva));
        if (ext.kwhJour != null) setKwhJour(String(ext.kwhJour));
        if (ext.kwhPointe != null) setKwhPointe(String(ext.kwhPointe));
        if (ext.kwhSoir != null) setKwhSoir(String(ext.kwhSoir));
        if (ext.kwhNuit != null) setKwhNuit(String(ext.kwhNuit));
        if (ext.kvarhTotal != null) setKvarhTotal(String(ext.kvarhTotal));
        if (ext.cosPhi != null) setCosPhi(String(ext.cosPhi));
        if (ext.reactivePenaltyTnd != null) setReactivePenaltyTnd(String(ext.reactivePenaltyTnd));
        if (ext.totalTtcTnd != null) setTotalTtcTnd(String(ext.totalTtcTnd));
        setDocStatus(`Document "${file.name}" analysé. Vérifiez les champs ci-dessous avant de valider.`);
      }
    } catch {
      setDocError("Erreur lors du traitement du fichier. Saisissez les données manuellement ou passez l'étape.");
    } finally {
      input.value = '';
      setIsProcessingDoc(false);
    }
  };

  const handleSaveAndFinish = () => {
    updateAuditData({
      companyName: companyName.trim(),
      fiscalId: fiscalId.trim(),
      governorate: governorate.trim(),
      industrialZone: industrialZone.trim(),
      sector,
      contactEmail: user?.email || auditData.contactEmail,
      exportCnCode: exportCnCode.trim(),
      exportProductName: exportProductName.trim(),
      annualProductionTons: parseNum(annualProductionTons),
      annualExportTons: parseNum(annualExportTons),
      naturalGasM3: parseNum(naturalGasM3),
      heavyFuelTons: parseNum(heavyFuelTons),
    });

    const j = parseNum(kwhJour);
    const p = parseNum(kwhPointe);
    const s = parseNum(kwhSoir);
    const n = parseNum(kwhNuit);
    const ttc = parseNum(totalTtcTnd);

    if (j + p + s + n > 0 || ttc > 0) {
      addMonthlyBill({
        month,
        year,
        tariffRegime,
        pSouscriteKva: parseNum(pSouscriteKva),
        pMaxAppeleeKva: parseNum(pMaxAppeleeKva),
        kwhJour: j,
        kwhPointe: p,
        kwhSoir: s,
        kwhNuit: n,
        kvarhTotal: parseNum(kvarhTotal),
        cosPhi: parseNum(cosPhi),
        reactivePenaltyTnd: parseNum(reactivePenaltyTnd),
        powerOverrunPenaltyTnd: 0,
        totalTtcTnd: ttc,
        source: docStatus && !importedCsvCount ? 'ocr' : 'manual',
      });
    }

    completeOnboarding();
  };

  const handleSkipToZero = () => {
    if (companyName.trim()) {
      updateAuditData({
        companyName: companyName.trim(),
        fiscalId: fiscalId.trim(),
        governorate: governorate.trim(),
        industrialZone: industrialZone.trim(),
        sector,
        contactEmail: user?.email || '',
      });
    }
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0A0F1D] border border-white/[0.12] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-white/[0.08] bg-[#0D1322]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Configuration Initiale • Étape {step} sur 2
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {step === 1 ? 'Identité et périmètre de votre usine' : 'Import de documents ou données historiques'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleSkipToZero}
            className="text-xs font-medium text-slate-400 hover:text-white underline underline-offset-4 self-start sm:self-auto transition-colors"
          >
            Passer et démarrer à zéro
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Renseignez les informations de votre site industriel. Aucun champ n&apos;est pré-rempli : toutes les données saisies restent strictement propres à votre entreprise.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel guide={FIELD_GUIDES.companyName} />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={FIELD_GUIDES.companyName.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.fiscalId} />
                  <input
                    type="text"
                    value={fiscalId}
                    onChange={(e) => setFiscalId(e.target.value)}
                    placeholder={FIELD_GUIDES.fiscalId.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.governorate} />
                  <input
                    type="text"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    placeholder={FIELD_GUIDES.governorate.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.industrialZone} />
                  <input
                    type="text"
                    value={industrialZone}
                    onChange={(e) => setIndustrialZone(e.target.value)}
                    placeholder={FIELD_GUIDES.industrialZone.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.sector} />
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as Sector)}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="metal_mechanics">Métallurgie, Usinage &amp; Mécanique</option>
                    <option value="agro_industry">Agro-industrie &amp; Transformation</option>
                    <option value="olive_oil">Oléiculture &amp; Extraction</option>
                    <option value="date_processing">Conditionnement Agricole</option>
                    <option value="textile">Textile &amp; Confection</option>
                    <option value="chemicals">Chimie &amp; Matériaux</option>
                  </select>
                  <FieldHint>{FIELD_GUIDES.sector.shortHint}</FieldHint>
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.exportCnCode} />
                  <input
                    type="text"
                    value={exportCnCode}
                    onChange={(e) => setExportCnCode(e.target.value)}
                    placeholder={FIELD_GUIDES.exportCnCode.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.exportCnCode.shortHint}</FieldHint>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel guide={FIELD_GUIDES.exportProductName} />
                  <input
                    type="text"
                    value={exportProductName}
                    onChange={(e) => setExportProductName(e.target.value)}
                    placeholder={FIELD_GUIDES.exportProductName.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.annualProductionTons} />
                  <input
                    type="number"
                    min="0"
                    value={annualProductionTons}
                    onChange={(e) => setAnnualProductionTons(e.target.value)}
                    placeholder={FIELD_GUIDES.annualProductionTons.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.annualProductionTons.shortHint}</FieldHint>
                </div>

                <div>
                  <FieldLabel guide={FIELD_GUIDES.annualExportTons} />
                  <input
                    type="number"
                    min="0"
                    value={annualExportTons}
                    onChange={(e) => setAnnualExportTons(e.target.value)}
                    placeholder={FIELD_GUIDES.annualExportTons.placeholder}
                    className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.annualExportTons.shortHint}</FieldHint>
                  {parseNum(annualProductionTons) > 0 &&
                    parseNum(annualExportTons) > parseNum(annualProductionTons) && (
                      <FieldWarning>
                        Le volume exporté vers l&apos;UE dépasse la production annuelle totale.
                      </FieldWarning>
                    )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Document Scanner & Import Block */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      Option rapide : Scanner ou importer un document officiel
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Importez une facture STEG (PDF, JPG, PNG) pour extraction automatique, ou un fichier CSV contenant plusieurs mois/années d&apos;historique.
                    </p>
                  </div>
                  <label className="btn-tactile cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold text-black shrink-0">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isProcessingDoc ? 'Analyse en cours...' : 'Choisir un fichier'}</span>
                    <input
                      type="file"
                      accept=".pdf,.csv,image/*"
                      onChange={handleDocumentUpload}
                      disabled={isProcessingDoc}
                      className="hidden"
                    />
                  </label>
                </div>

                {docStatus && (
                  <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{docStatus}</span>
                  </div>
                )}

                {docError && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{docError}</span>
                  </div>
                )}
              </div>

              {/* Manual Entry Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Ou saisie manuelle (données mensuelles ou annuelles)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Laissez vide si indisponible</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.month} />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value) || 1)}
                      placeholder={FIELD_GUIDES.month.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.year} />
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value) || 2026)}
                      placeholder={FIELD_GUIDES.year.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel guide={FIELD_GUIDES.tariffRegime} />
                    <select
                      value={tariffRegime}
                      onChange={(e) => setTariffRegime(e.target.value as StegTariffType)}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="MT_POSTES_HORAIRES">Moyenne Tension — Postes Horaires</option>
                      <option value="MT_UNIFORME">Moyenne Tension — Tarif Uniforme</option>
                      <option value="HT">Haute Tension (HT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.kwhJour} />
                    <input
                      type="number"
                      min="0"
                      value={kwhJour}
                      onChange={(e) => setKwhJour(e.target.value)}
                      placeholder={FIELD_GUIDES.kwhJour.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.kwhPointe} tone="amber" />
                    <input
                      type="number"
                      min="0"
                      value={kwhPointe}
                      onChange={(e) => setKwhPointe(e.target.value)}
                      placeholder={FIELD_GUIDES.kwhPointe.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-amber-500/25 px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.kwhSoir} />
                    <input
                      type="number"
                      min="0"
                      value={kwhSoir}
                      onChange={(e) => setKwhSoir(e.target.value)}
                      placeholder={FIELD_GUIDES.kwhSoir.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.kwhNuit} />
                    <input
                      type="number"
                      min="0"
                      value={kwhNuit}
                      onChange={(e) => setKwhNuit(e.target.value)}
                      placeholder={FIELD_GUIDES.kwhNuit.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.pSouscriteKva} />
                    <input
                      type="number"
                      min="0"
                      value={pSouscriteKva}
                      onChange={(e) => setPSouscriteKva(e.target.value)}
                      placeholder={FIELD_GUIDES.pSouscriteKva.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.pMaxAppeleeKva} />
                    <input
                      type="number"
                      min="0"
                      value={pMaxAppeleeKva}
                      onChange={(e) => setPMaxAppeleeKva(e.target.value)}
                      placeholder={FIELD_GUIDES.pMaxAppeleeKva.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    {parseNum(pSouscriteKva) > 0 && parseNum(pMaxAppeleeKva) > parseNum(pSouscriteKva) && (
                      <FieldWarning>
                        Dépassement de +{(parseNum(pMaxAppeleeKva) - parseNum(pSouscriteKva)).toFixed(0)} kVA
                        (pénalité 25 TND/kVA/mois).
                      </FieldWarning>
                    )}
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.cosPhi} />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={cosPhi}
                      onChange={(e) => setCosPhi(e.target.value)}
                      placeholder={FIELD_GUIDES.cosPhi.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <FieldHint>{FIELD_GUIDES.cosPhi.shortHint}</FieldHint>
                    {parseNum(cosPhi) > 0 && (parseNum(cosPhi) < 0.5 || parseNum(cosPhi) > 1) && (
                      <FieldWarning>
                        Un cos φ industriel se situe entre 0,50 et 1,00 (ex. 0,78).
                      </FieldWarning>
                    )}
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.totalTtcTnd} />
                    <input
                      type="number"
                      min="0"
                      value={totalTtcTnd}
                      onChange={(e) => setTotalTtcTnd(e.target.value)}
                      placeholder={FIELD_GUIDES.totalTtcTnd.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.reactivePenaltyTnd} />
                    <input
                      type="number"
                      min="0"
                      value={reactivePenaltyTnd}
                      onChange={(e) => setReactivePenaltyTnd(e.target.value)}
                      placeholder={FIELD_GUIDES.reactivePenaltyTnd.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.naturalGasM3} />
                    <input
                      type="number"
                      min="0"
                      value={naturalGasM3}
                      onChange={(e) => setNaturalGasM3(e.target.value)}
                      placeholder={FIELD_GUIDES.naturalGasM3.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.heavyFuelTons} />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={heavyFuelTons}
                      onChange={(e) => setHeavyFuelTons(e.target.value)}
                      placeholder={FIELD_GUIDES.heavyFuelTons.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#0D1322]">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleSkipToZero}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-slate-300 hover:bg-white/[0.05] transition-colors"
              >
                Passer (commencer à zéro)
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black transition-all"
              >
                <span>Continuer vers les données énergie</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-slate-300 hover:bg-white/[0.05] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Retour</span>
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSkipToZero}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-slate-300 hover:bg-white/[0.05] transition-colors"
                >
                  Passer sans données
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndFinish}
                  className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black transition-all"
                >
                  <span>Enregistrer et ouvrir le tableau de bord</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
