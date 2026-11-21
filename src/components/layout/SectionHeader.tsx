'use client';

// ==============================================================================
// SymbioCarb AI - Restrained Module Header (Collapsed by default so data leads)
// ==============================================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  badge: string;
  badgeColor?: string;
  objective: string;
  inputs: string[];
  deliverables: string[];
  regulation: string;
  defaultExpanded?: boolean;
}

export function SectionHeader({
  title,
  badge,
  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  objective,
  inputs,
  deliverables,
  regulation,
  defaultExpanded = false,
}: SectionHeaderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-2xl glass-panel-elevated p-4 sm:p-5 border border-white/[0.08]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {title}
          </h1>
          <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-tactile flex items-center gap-1.5 text-xs text-slate-400 hover:text-white py-1 px-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.06] transition-all shrink-0"
        >
          <span className="font-medium">{expanded ? 'Masquer le guide' : 'Méthodologie'}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200">Objectif</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">{objective}</p>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200">Données d&apos;entrée</div>
            <ul className="text-slate-400 text-[11px] space-y-1">
              {inputs.map((inp, idx) => (
                <li key={idx}>• {inp}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200">Livrables calculés</div>
            <ul className="text-slate-400 text-[11px] space-y-1">
              {deliverables.map((deliv, idx) => (
                <li key={idx}>✓ {deliv}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200">Base réglementaire</div>
            <p className="text-slate-400 text-[11px] leading-relaxed font-mono">{regulation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
