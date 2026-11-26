'use client';

// ==============================================================================
// Module OCR & Import: Official Document Scanner for STEG Invoices & CSV History
// Zero pre-filled samples, zero purple/violet chrome, saves directly to AuditContext.
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAudit } from '@/lib/audit/audit-context';
import { FIELD_GUIDES } from '@/lib/ux/field-guides';
import { FieldLabel, FieldHint, FieldWarning } from '@/components/ui/FieldLabel';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StegTariffType } from '@/types';
import { Upload, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function OcrPage() {
  const { t } = useTranslation();
  const { addMonthlyBill } = useAudit();

  const [isScanning, setIsScanning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Clean zero-initialized form state
  const [formData, setFormData] = useState({
    districtSteg: '',
    billingMonth: new Date().getMonth() + 1,
    billingYear: new Date().getFullYear(),
    tariffRegime: 'MT_POSTES_HORAIRES' as StegTariffType,
    pSouscriteKva: 0,
    pMaxAppeleeKva: 0,
    kwhJour: 0,
    kwhPointe: 0,
    kwhSoir: 0,
    kwhNuit: 0,
    kvarhTotal: 0,
    cosPhi: 0,
    reactivePenaltyTnd: 0,
    powerOverrunPenaltyTnd: 0,
    totalTtcTnd: 0,
    confidenceScore: 0,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setScanError(null);
    setIsSaved(false);
    setIsScanning(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          resolve(result.includes(',') ? result.split(',')[1] : result);
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
        setScanError(
          data.error ||
            "L'extraction OCR n'a pas pu lire ce fichier. Vous pouvez vérifier ou compléter les champs manuellement à droite."
        );
      } else {
        const ext = data.extracted;
        setFormData({
          districtSteg: ext.districtSteg || '',
          billingMonth: Number(ext.billingMonth) || new Date().getMonth() + 1,
          billingYear: Number(ext.billingYear) || new Date().getFullYear(),
          tariffRegime: (ext.tariffRegime as StegTariffType) || 'MT_POSTES_HORAIRES',
          pSouscriteKva: Number(ext.pSouscriteKva) || 0,
          pMaxAppeleeKva: Number(ext.pMaxAppeleeKva) || 0,
          kwhJour: Number(ext.kwhJour) || 0,
          kwhPointe: Number(ext.kwhPointe) || 0,
          kwhSoir: Number(ext.kwhSoir) || 0,
          kwhNuit: Number(ext.kwhNuit) || 0,
          kvarhTotal: Number(ext.kvarhTotal) || 0,
          cosPhi: Number(ext.cosPhi) || 0,
          reactivePenaltyTnd: Number(ext.reactivePenaltyTnd) || 0,
          powerOverrunPenaltyTnd: Number(ext.powerOverrunPenaltyTnd) || 0,
          totalTtcTnd: Number(ext.totalTtcTnd) || 0,
          confidenceScore: Number(ext.confidenceScore) || 0,
        });
      }
    } catch {
      setScanError('Erreur réseau lors de la lecture du document.');
    } finally {
      input.value = '';
      setIsScanning(false);
    }
  };

  const handleSaveToFactory = () => {
    addMonthlyBill({
      month: formData.billingMonth,
      year: formData.billingYear,
      districtSteg: formData.districtSteg,
      tariffRegime: formData.tariffRegime,
      pSouscriteKva: formData.pSouscriteKva,
      pMaxAppeleeKva: formData.pMaxAppeleeKva,
      kwhJour: formData.kwhJour,
      kwhPointe: formData.kwhPointe,
      kwhSoir: formData.kwhSoir,
      kwhNuit: formData.kwhNuit,
      kvarhTotal: formData.kvarhTotal,
      cosPhi: formData.cosPhi,
      reactivePenaltyTnd: formData.reactivePenaltyTnd,
      powerOverrunPenaltyTnd: formData.powerOverrunPenaltyTnd,
      totalTtcTnd: formData.totalTtcTnd,
      source: fileName ? 'ocr' : 'manual',
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const totalKwh = formData.kwhJour + formData.kwhPointe + formData.kwhSoir + formData.kwhNuit;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Import & Scanner de Documents Officiels (STEG)"
        badge="OCR Vision"
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        objective="Téléversez vos factures STEG officielles (PDF ou photo) pour extraire automatiquement les tranches horaires, la puissance et le cos φ, puis enregistrez-les dans votre usine."
        inputs={[
          'Facture STEG Moyenne ou Haute Tension (PDF, JPG, PNG)',
          'Ou saisie manuelle directe dans le formulaire de vérification',
        ]}
        deliverables={[
          'Extraction des 4 tranches horaires (Jour, Pointe, Soir, Nuit)',
          'Synchronisation directe avec le tableau de bord et le calcul CBAM',
        ]}
        regulation="Spécifications tarifaires STEG MT/HT • Conformité INPDP Tunisie"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Document Upload Dropzone & Extracted Summary */}
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-bold text-white">Document Source</span>
              <span className="font-mono text-[10px] text-slate-400">PDF • JPG • PNG</span>
            </div>

            <label className="cursor-pointer flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.18] bg-black/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-8 text-center transition-all">
              <Upload className="h-6 w-6 text-emerald-400 mb-2" />
              <div className="text-xs font-bold text-white">
                {isScanning
                  ? 'Extraction des données en cours...'
                  : fileName
                    ? `Fichier chargé : ${fileName}`
                    : 'Cliquez pour importer une facture STEG'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Aucun échantillon préchargé — importez uniquement vos propres documents officiels.
              </p>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                disabled={isScanning}
                className="hidden"
              />
            </label>

            {scanError && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Live Summary Card of Current Values */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0B111E] p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2 text-slate-400">
                <span>PÉRIODE : {String(formData.billingMonth).padStart(2, '0')}/{formData.billingYear}</span>
                <span>TOTAL : {totalKwh.toLocaleString('fr-TN')} kWh</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-slate-300">P. Souscrite : {formData.pSouscriteKva} kVA</div>
                <div className="text-slate-300">P. Max : {formData.pMaxAppeleeKva} kVA</div>
                <div className="text-amber-400">Pointe : {formData.kwhPointe.toLocaleString('fr-TN')} kWh</div>
                <div className="text-slate-300">cos φ : {formData.cosPhi > 0 ? formData.cosPhi : '0.00'}</div>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400">NET TTC :</span>
                <span className="font-bold text-emerald-400">
                  {formData.totalTtcTnd.toLocaleString('fr-TN')} TND
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            Conformité Loi n° 2004-63 (INPDP) : vos factures sont analysées sans stockage de données bancaires.
          </p>
        </div>

        {/* Right: Editable Verification Form */}
        <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">{t.ocr.extractedFields}</h2>
              <p className="text-[11px] text-slate-400">
                Vérifiez ou complétez les grandeurs avant d&apos;enregistrer dans votre usine
              </p>
            </div>
            {formData.confidenceScore > 0 && (
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Confiance : {Math.round(formData.confidenceScore * 100)}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <FieldLabel guide={FIELD_GUIDES.districtSteg} />
              <input
                type="text"
                value={formData.districtSteg}
                onChange={(e) => setFormData({ ...formData, districtSteg: e.target.value })}
                placeholder={FIELD_GUIDES.districtSteg.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel guide={FIELD_GUIDES.month} />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.billingMonth}
                  onChange={(e) => setFormData({ ...formData, billingMonth: parseInt(e.target.value, 10) || 1 })}
                  placeholder={FIELD_GUIDES.month.placeholder}
                  className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <FieldLabel guide={FIELD_GUIDES.year} />
                <input
                  type="number"
                  value={formData.billingYear}
                  onChange={(e) => setFormData({ ...formData, billingYear: parseInt(e.target.value, 10) || 2026 })}
                  placeholder={FIELD_GUIDES.year.placeholder}
                  className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.pSouscriteKva} />
              <input
                type="number"
                min="0"
                value={formData.pSouscriteKva || ''}
                onChange={(e) => setFormData({ ...formData, pSouscriteKva: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.pSouscriteKva.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <FieldHint>{FIELD_GUIDES.pSouscriteKva.shortHint}</FieldHint>
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.pMaxAppeleeKva} />
              <input
                type="number"
                min="0"
                value={formData.pMaxAppeleeKva || ''}
                onChange={(e) => setFormData({ ...formData, pMaxAppeleeKva: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.pMaxAppeleeKva.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              {formData.pSouscriteKva > 0 && formData.pMaxAppeleeKva > formData.pSouscriteKva && (
                <FieldWarning>
                  Dépassement de +{(formData.pMaxAppeleeKva - formData.pSouscriteKva).toFixed(0)} kVA
                  détecté (pénalité STEG 25 TND/kVA/mois).
                </FieldWarning>
              )}
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.kwhJour} />
              <input
                type="number"
                min="0"
                value={formData.kwhJour || ''}
                onChange={(e) => setFormData({ ...formData, kwhJour: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.kwhJour.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <FieldHint>{FIELD_GUIDES.kwhJour.shortHint}</FieldHint>
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.kwhPointe} tone="amber" />
              <input
                type="number"
                min="0"
                value={formData.kwhPointe || ''}
                onChange={(e) => setFormData({ ...formData, kwhPointe: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.kwhPointe.placeholder}
                className="w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 text-amber-200 font-mono focus:outline-none focus:border-amber-500"
              />
              <FieldHint>{FIELD_GUIDES.kwhPointe.shortHint}</FieldHint>
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.kwhSoir} />
              <input
                type="number"
                min="0"
                value={formData.kwhSoir || ''}
                onChange={(e) => setFormData({ ...formData, kwhSoir: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.kwhSoir.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <FieldHint>{FIELD_GUIDES.kwhSoir.shortHint}</FieldHint>
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.kwhNuit} />
              <input
                type="number"
                min="0"
                value={formData.kwhNuit || ''}
                onChange={(e) => setFormData({ ...formData, kwhNuit: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.kwhNuit.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <FieldHint>{FIELD_GUIDES.kwhNuit.shortHint}</FieldHint>
            </div>

            <div>
              <FieldLabel guide={FIELD_GUIDES.cosPhi} />
              <input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={formData.cosPhi || ''}
                onChange={(e) => setFormData({ ...formData, cosPhi: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.cosPhi.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <FieldHint>{FIELD_GUIDES.cosPhi.shortHint}</FieldHint>
              {formData.cosPhi > 0 && (formData.cosPhi < 0.5 || formData.cosPhi > 1) && (
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
                value={formData.reactivePenaltyTnd || ''}
                onChange={(e) => setFormData({ ...formData, reactivePenaltyTnd: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.reactivePenaltyTnd.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <FieldLabel guide={FIELD_GUIDES.totalTtcTnd} />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalTtcTnd || ''}
                onChange={(e) => setFormData({ ...formData, totalTtcTnd: parseFloat(e.target.value) || 0 })}
                placeholder={FIELD_GUIDES.totalTtcTnd.placeholder}
                className="w-full rounded-xl border border-white/[0.1] bg-black/40 p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <FieldHint>{FIELD_GUIDES.totalTtcTnd.shortHint}</FieldHint>
            </div>
          </div>

          <button
            onClick={handleSaveToFactory}
            className={`btn-tactile w-full rounded-xl p-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-emerald-400 text-black'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Facture ajoutée à votre usine</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Enregistrer dans mon usine</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
