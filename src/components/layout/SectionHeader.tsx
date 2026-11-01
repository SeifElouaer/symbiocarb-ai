'use client';

// ==============================================================================
// SymbioCarb AI - Section Intelligence & Executive Guidance Header
// Provides clear industrial context, required inputs, and regulatory deliverables
// ==============================================================================

import React, { useState } from 'react';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  FileInput, 
  FileOutput, 
  BookOpen, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

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
  defaultExpanded = true,
}: SectionHeaderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-2xl glass-panel-elevated p-4 sm:p-5 border border-card-border transition-all">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1 px-2.5 rounded-lg border border-white/5 hover:bg-white/5 transition-all"
        >
          <Info className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden sm:inline">{expanded ? 'Masquer le guide' : 'Guide du module'}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expandable Guidance Matrix */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-card-border grid grid-cols-1 md:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
          {/* Objective */}
          <div className="space-y-1 md:col-span-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Objectif Industriel</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {objective}
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <FileInput className="h-3.5 w-3.5 text-blue-400" />
              <span>Données d'Entrée</span>
            </div>
            <ul className="text-muted-foreground text-[11px] space-y-0.5">
              {inputs.map((inp, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-blue-400">•</span>
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deliverables */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <FileOutput className="h-3.5 w-3.5 text-emerald-400" />
              <span>Livrables Déterministes</span>
            </div>
            <ul className="text-muted-foreground text-[11px] space-y-0.5">
              {deliverables.map((del, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-emerald-400">✓</span>
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Regulation */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>Norme & Réglementation</span>
            </div>
            <p className="text-muted-foreground text-[11px] font-mono leading-relaxed">
              {regulation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
