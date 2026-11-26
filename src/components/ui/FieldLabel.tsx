'use client';

// ==============================================================================
// SymbioCarb AI - Accessible Field Label, Inline Expandable Guide & Validators
// Uses an inline expandable panel (never clipped by modal overflow-y-auto) and
// supports RTL/LTR plus optional translated label overrides.
// ==============================================================================

import React, { useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { FieldGuide } from '@/lib/ux/field-guides';

interface FieldLabelProps {
  guide: FieldGuide;
  labelOverride?: string;
  tone?: 'default' | 'amber';
  showShortHint?: boolean;
  className?: string;
}

export function FieldLabel({
  guide,
  labelOverride,
  tone = 'default',
  showShortHint = false,
  className = '',
}: FieldLabelProps) {
  const [open, setOpen] = useState(false);
  const displayLabel = labelOverride ?? guide.label;

  const labelToneClass =
    tone === 'amber' ? 'text-amber-300 font-medium' : 'text-slate-300 font-medium';

  return (
    <div className={`mb-1 ${className}`}>
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center flex-wrap gap-1.5 min-w-0">
          <span className={`text-[11px] leading-tight ${labelToneClass}`}>{displayLabel}</span>
          {guide.unit && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08] shrink-0">
              {guide.unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={`Explication : ${displayLabel}`}
          title="Afficher l'explication du paramètre"
          className={`inline-flex items-center justify-center rounded-full p-0.5 transition-colors shrink-0 ${
            open
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="mt-1.5 mb-1.5 rounded-lg bg-[#0D1322] border border-emerald-500/30 p-2.5 text-[11px] text-slate-200 leading-relaxed space-y-1">
          <p>{guide.tooltip}</p>
          {guide.whereToFind && (
            <p className="text-[10px] text-emerald-300/90">
              <strong className="font-semibold">Où trouver cette valeur :</strong> {guide.whereToFind}
            </p>
          )}
        </div>
      )}

      {!open && showShortHint && guide.shortHint && (
        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{guide.shortHint}</p>
      )}
    </div>
  );
}

export function FieldHint({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-[10px] text-slate-400 leading-snug mt-1 ${className}`}>{children}</p>;
}

export function FieldWarning({
  children,
  tone = 'amber',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'amber' | 'blue';
  className?: string;
}) {
  const isBlue = tone === 'blue';
  return (
    <div
      className={`mt-1 flex items-start gap-1.5 text-[10px] leading-snug ${
        isBlue ? 'text-blue-300' : 'text-amber-300'
      } ${className}`}
    >
      {isBlue ? (
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
      )}
      <span>{children}</span>
    </div>
  );
}
