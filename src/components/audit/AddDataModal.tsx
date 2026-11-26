'use client';

// ==============================================================================
// SymbioCarb AI - Progressive Factory Data Entry Modal
// Allows companies to add STEG bills (via OCR/CSV/manual), CBAM fuels/BOM,
// and factory profile updates incrementally over time. Zero test presets.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useAudit } from '@/lib/audit/audit-context';
import { FIELD_GUIDES } from '@/lib/ux/field-guides';
import { FieldLabel, FieldHint, FieldWarning } from '@/components/ui/FieldLabel';
import { Sector, StegTariffType } from '@/types';
import { X, Upload, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';

export function AddDataModal() {
  const {
    auditData,
    updateAuditData,
    addMonthlyBill,
    addBomMaterial,
    removeBomMaterial,
    isAddDataOpen,
    addDataInitialTab,
    closeAddDataModal,
  } = useAudit();

  const [tab, setTab] = useState<'steg' | 'cbam' | 'profile'>(addDataInitialTab);

  // STEG Bill form state (starts empty / 0 for each new entry)
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [districtSteg, setDistrictSteg] = useState<string>(auditData.districtSteg || '');
  const [tariffRegime, setTariffRegime] = useState<StegTariffType>(auditData.tariffRegime);
  const [pSouscriteKva, setPSouscriteKva] = useState<string>(
    auditData.pSouscriteKva > 0 ? String(auditData.pSouscriteKva) : ''
  );
  const [pMaxAppeleeKva, setPMaxAppeleeKva] = useState<string>('');
  const [kwhJour, setKwhJour] = useState<string>('');
  const [kwhPointe, setKwhPointe] = useState<string>('');
  const [kwhSoir, setKwhSoir] = useState<string>('');
  const [kwhNuit, setKwhNuit] = useState<string>('');
  const [kvarhTotal, setKvarhTotal] = useState<string>('');
  const [cosPhi, setCosPhi] = useState<string>('');
  const [reactivePenaltyTnd, setReactivePenaltyTnd] = useState<string>('');
  const [powerOverrunPenaltyTnd, setPowerOverrunPenaltyTnd] = useState<string>('');
  const [totalTtcTnd, setTotalTtcTnd] = useState<string>('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [scanErr, setScanErr] = useState<string | null>(null);

  // New BOM Material state
  const [bomName, setBomName] = useState('');
  const [bomCn, setBomCn] = useState('');
  const [bomQty, setBomQty] = useState('');
  const [bomEf, setBomEf] = useState('');

  useEffect(() => {
    if (isAddDataOpen) {
      setTab(addDataInitialTab);
      setScanMsg(null);
      setScanErr(null);
    }
  }, [isAddDataOpen, addDataInitialTab]);

  if (!isAddDataOpen) return null;

  const num = (val: string) => {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const handleOcrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setScanMsg(null);
    setScanErr(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const r = String(reader.result || '');
          resolve(r.includes(',') ? r.split(',')[1] : r);
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
        setScanErr(data.error || "Impossible d'extraire automatiquement ce fichier.");
      } else {
        const ext = data.extracted;
        if (ext.districtSteg) setDistrictSteg(String(ext.districtSteg));
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
        if (ext.powerOverrunPenaltyTnd != null) setPowerOverrunPenaltyTnd(String(ext.powerOverrunPenaltyTnd));
        if (ext.totalTtcTnd != null) setTotalTtcTnd(String(ext.totalTtcTnd));
        setScanMsg(`Facture "${file.name}" extraite. Vérifiez les valeurs et enregistrez.`);
      }
    } catch {
      setScanErr('Erreur lors de la lecture du fichier.');
    } finally {
      input.value = '';
      setIsScanning(false);
    }
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    addMonthlyBill({
      month,
      year,
      districtSteg: districtSteg.trim(),
      tariffRegime,
      pSouscriteKva: num(pSouscriteKva),
      pMaxAppeleeKva: num(pMaxAppeleeKva),
      kwhJour: num(kwhJour),
      kwhPointe: num(kwhPointe),
      kwhSoir: num(kwhSoir),
      kwhNuit: num(kwhNuit),
      kvarhTotal: num(kvarhTotal),
      cosPhi: num(cosPhi),
      reactivePenaltyTnd: num(reactivePenaltyTnd),
      powerOverrunPenaltyTnd: num(powerOverrunPenaltyTnd),
      totalTtcTnd: num(totalTtcTnd),
      source: scanMsg ? 'ocr' : 'manual',
    });
    closeAddDataModal();
  };

  const handleAddBom = () => {
    if (!bomName.trim() || num(bomQty) <= 0) return;
    addBomMaterial({
      name: bomName.trim(),
      cnCode8: bomCn.trim(),
      quantityTons: num(bomQty),
      efTco2ePerTon: num(bomEf),
    });
    setBomName('');
    setBomCn('');
    setBomQty('');
    setBomEf('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
      onClick={closeAddDataModal}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0A0F1D] border border-white/[0.12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0D1322]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Saisie et import de données usine
            </h2>
            <p className="text-xs text-slate-400">
              Ajoutez vos factures STEG, consommations de combustibles et matières premières au fur et à mesure.
            </p>
          </div>
          <button
            onClick={closeAddDataModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-white/[0.08] bg-[#0B101B] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('steg')}
            className={`py-3 border-b-2 transition-colors ${
              tab === 'steg'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ajouter une Facture STEG
          </button>
          <button
            type="button"
            onClick={() => setTab('cbam')}
            className={`py-3 border-b-2 transition-colors ${
              tab === 'cbam'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Production &amp; Intrants CBAM
          </button>
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`py-3 border-b-2 transition-colors ${
              tab === 'profile'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Profil de l&apos;Usine
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'steg' && (
            <form id="steg-bill-form" onSubmit={handleSaveBill} className="space-y-4">
              {/* Document Scanner Banner */}
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Scanner une facture STEG (PDF ou photo)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Extraction automatique des tranches horaires, puissances et cos φ.
                  </div>
                </div>
                <label className="btn-tactile cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black px-3.5 py-2 text-xs font-bold text-emerald-300 transition-colors shrink-0">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isScanning ? 'Analyse...' : 'Importer un document'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleOcrFileUpload}
                    disabled={isScanning}
                    className="hidden"
                  />
                </label>
              </div>

              {scanMsg && (
                <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{scanMsg}</span>
                </div>
              )}

              {scanErr && (
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{scanErr}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <FieldLabel guide={FIELD_GUIDES.month} />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
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
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value) || 2026)}
                    placeholder={FIELD_GUIDES.year.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.districtSteg} />
                  <input
                    type="text"
                    value={districtSteg}
                    onChange={(e) => setDistrictSteg(e.target.value)}
                    placeholder={FIELD_GUIDES.districtSteg.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.tariffRegime} />
                  <select
                    value={tariffRegime}
                    onChange={(e) => setTariffRegime(e.target.value as StegTariffType)}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="MT_POSTES_HORAIRES">MT Postes Horaires</option>
                    <option value="MT_UNIFORME">MT Uniforme</option>
                    <option value="HT">Haute Tension</option>
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
                  <FieldHint>{FIELD_GUIDES.kwhJour.shortHint}</FieldHint>
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
                  <FieldHint>{FIELD_GUIDES.kwhPointe.shortHint}</FieldHint>
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
                  <FieldHint>{FIELD_GUIDES.kwhSoir.shortHint}</FieldHint>
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
                  <FieldHint>{FIELD_GUIDES.kwhNuit.shortHint}</FieldHint>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  {num(pSouscriteKva) > 0 && num(pMaxAppeleeKva) > num(pSouscriteKva) && (
                    <FieldWarning>
                      Dépassement de +{(num(pMaxAppeleeKva) - num(pSouscriteKva)).toFixed(0)} kVA
                      détecté (pénalité STEG 25 TND/kVA/mois).
                    </FieldWarning>
                  )}
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.kvarhTotal} />
                  <input
                    type="number"
                    min="0"
                    value={kvarhTotal}
                    onChange={(e) => setKvarhTotal(e.target.value)}
                    placeholder={FIELD_GUIDES.kvarhTotal.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.kvarhTotal.shortHint}</FieldHint>
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.cosPhi} />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={cosPhi}
                    onChange={(e) => setCosPhi(e.target.value)}
                    placeholder={FIELD_GUIDES.cosPhi.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.cosPhi.shortHint}</FieldHint>
                  {num(cosPhi) > 0 && (num(cosPhi) < 0.5 || num(cosPhi) > 1) && (
                    <FieldWarning>
                      Un cos φ industriel se situe entre 0,50 et 1,00 (ex. 0,78).
                    </FieldWarning>
                  )}
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.reactivePenaltyTnd} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reactivePenaltyTnd}
                    onChange={(e) => setReactivePenaltyTnd(e.target.value)}
                    placeholder={FIELD_GUIDES.reactivePenaltyTnd.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.totalTtcTnd} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalTtcTnd}
                    onChange={(e) => setTotalTtcTnd(e.target.value)}
                    placeholder={FIELD_GUIDES.totalTtcTnd.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </form>
          )}

          {tab === 'cbam' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel guide={FIELD_GUIDES.exportCnCode} />
                  <input
                    type="text"
                    value={auditData.exportCnCode}
                    onChange={(e) => updateAuditData({ exportCnCode: e.target.value })}
                    placeholder={FIELD_GUIDES.exportCnCode.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.exportCnCode.shortHint}</FieldHint>
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.exportProductName} />
                  <input
                    type="text"
                    value={auditData.exportProductName}
                    onChange={(e) => updateAuditData({ exportProductName: e.target.value })}
                    placeholder={FIELD_GUIDES.exportProductName.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.exportProductName.shortHint}</FieldHint>
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.annualProductionTons} />
                  <input
                    type="number"
                    min="0"
                    value={auditData.annualProductionTons || ''}
                    onChange={(e) => updateAuditData({ annualProductionTons: Math.max(0, Number(e.target.value) || 0) })}
                    placeholder={FIELD_GUIDES.annualProductionTons.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.annualProductionTons.shortHint}</FieldHint>
                </div>
                <div>
                  <FieldLabel guide={FIELD_GUIDES.annualExportTons} />
                  <input
                    type="number"
                    min="0"
                    value={auditData.annualExportTons || ''}
                    onChange={(e) => updateAuditData({ annualExportTons: Math.max(0, Number(e.target.value) || 0) })}
                    placeholder={FIELD_GUIDES.annualExportTons.placeholder}
                    className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <FieldHint>{FIELD_GUIDES.annualExportTons.shortHint}</FieldHint>
                  {auditData.annualProductionTons > 0 &&
                    auditData.annualExportTons > auditData.annualProductionTons && (
                      <FieldWarning>
                        Le volume exporté vers l&apos;UE dépasse la production annuelle totale.
                      </FieldWarning>
                    )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08]">
                <h3 className="text-xs font-bold text-slate-200 mb-3">
                  Combustibles directs sur site (Scope 1 — consommation mensuelle moyenne)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.naturalGasM3} />
                    <input
                      type="number"
                      min="0"
                      value={auditData.naturalGasM3 || ''}
                      onChange={(e) => updateAuditData({ naturalGasM3: Math.max(0, Number(e.target.value) || 0) })}
                      placeholder={FIELD_GUIDES.naturalGasM3.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <FieldHint>{FIELD_GUIDES.naturalGasM3.shortHint}</FieldHint>
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.heavyFuelTons} />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={auditData.heavyFuelTons || ''}
                      onChange={(e) => updateAuditData({ heavyFuelTons: Math.max(0, Number(e.target.value) || 0) })}
                      placeholder={FIELD_GUIDES.heavyFuelTons.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <FieldHint>{FIELD_GUIDES.heavyFuelTons.shortHint}</FieldHint>
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.dieselLiters} />
                    <input
                      type="number"
                      min="0"
                      value={auditData.dieselLiters || ''}
                      onChange={(e) => updateAuditData({ dieselLiters: Math.max(0, Number(e.target.value) || 0) })}
                      placeholder={FIELD_GUIDES.dieselLiters.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <FieldHint>{FIELD_GUIDES.dieselLiters.shortHint}</FieldHint>
                  </div>
                </div>
              </div>

              {/* Dynamic BOM Precursor Table */}
              <div className="pt-3 border-t border-white/[0.08] space-y-3">
                <h3 className="text-xs font-bold text-slate-200">
                  Matières premières entrantes (Scope 3 BOM)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.bomName} />
                    <input
                      type="text"
                      value={bomName}
                      onChange={(e) => setBomName(e.target.value)}
                      placeholder={FIELD_GUIDES.bomName.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.bomCn} />
                    <input
                      type="text"
                      value={bomCn}
                      onChange={(e) => setBomCn(e.target.value)}
                      placeholder={FIELD_GUIDES.bomCn.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.bomQty} />
                    <input
                      type="number"
                      min="0"
                      value={bomQty}
                      onChange={(e) => setBomQty(e.target.value)}
                      placeholder={FIELD_GUIDES.bomQty.placeholder}
                      className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel guide={FIELD_GUIDES.bomEf} />
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bomEf}
                        onChange={(e) => setBomEf(e.target.value)}
                        placeholder={FIELD_GUIDES.bomEf.placeholder}
                        className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-2.5 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddBom}
                        className="px-3 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 shrink-0 inline-flex items-center gap-1 text-xs"
                        title="Ajouter cet intrant"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                    <FieldHint>{FIELD_GUIDES.bomEf.shortHint}</FieldHint>
                  </div>
                </div>

                {auditData.bomMaterials.length > 0 && (
                  <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-black/20">
                    {auditData.bomMaterials.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-3 py-2 text-xs">
                        <div>
                          <span className="font-medium text-white">{m.name}</span>
                          {m.cnCode8 && <span className="ms-2 font-mono text-[10px] text-slate-400">CN {m.cnCode8}</span>}
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-300">{m.quantityTons} t</span>
                          <span className="text-emerald-400">{(m.quantityTons * m.efTco2ePerTon).toFixed(1)} tCO₂e</span>
                          <button
                            type="button"
                            onClick={() => removeBomMaterial(m.id)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel guide={FIELD_GUIDES.companyName} />
                <input
                  type="text"
                  value={auditData.companyName}
                  onChange={(e) => updateAuditData({ companyName: e.target.value })}
                  placeholder={FIELD_GUIDES.companyName.placeholder}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <FieldLabel guide={FIELD_GUIDES.fiscalId} />
                <input
                  type="text"
                  value={auditData.fiscalId}
                  onChange={(e) => updateAuditData({ fiscalId: e.target.value })}
                  placeholder={FIELD_GUIDES.fiscalId.placeholder}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <FieldLabel guide={FIELD_GUIDES.governorate} />
                <input
                  type="text"
                  value={auditData.governorate}
                  onChange={(e) => updateAuditData({ governorate: e.target.value })}
                  placeholder={FIELD_GUIDES.governorate.placeholder}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <FieldLabel guide={FIELD_GUIDES.industrialZone} />
                <input
                  type="text"
                  value={auditData.industrialZone}
                  onChange={(e) => updateAuditData({ industrialZone: e.target.value })}
                  placeholder={FIELD_GUIDES.industrialZone.placeholder}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <FieldLabel guide={FIELD_GUIDES.sector} />
                <select
                  value={auditData.sector}
                  onChange={(e) => updateAuditData({ sector: e.target.value as Sector })}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
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
                <FieldLabel guide={FIELD_GUIDES.contactEmail} />
                <input
                  type="email"
                  value={auditData.contactEmail}
                  onChange={(e) => updateAuditData({ contactEmail: e.target.value })}
                  placeholder={FIELD_GUIDES.contactEmail.placeholder}
                  className="w-full rounded-lg bg-black/40 border border-white/[0.1] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#0D1322]">
          <button
            type="button"
            onClick={closeAddDataModal}
            className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-slate-300 hover:bg-white/[0.05]"
          >
            Fermer
          </button>
          {tab === 'steg' ? (
            <button
              type="submit"
              form="steg-bill-form"
              className="btn-tactile px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black"
            >
              Enregistrer cette facture
            </button>
          ) : (
            <button
              type="button"
              onClick={closeAddDataModal}
              className="btn-tactile px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black"
            >
              Enregistrer et recalculer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
