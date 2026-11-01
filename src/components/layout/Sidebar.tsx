'use client';

// ==============================================================================
// Industrial Responsive Sidebar with Dynamic RTL Layout Alignment
// Clean enterprise SaaS navigation with Zero Telegram Clutter
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  LayoutDashboard, 
  Sparkles,
  Zap, 
  Globe2, 
  Recycle, 
  FileSearch, 
  BookOpen, 
  MapPin, 
  ShieldCheck
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale, persona } = useTranslation();

  const navigation = [
    {
      name: t.nav.dashboard,
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: locale === 'ar-TN' ? 'التشخيص السريع (5 مراحل)' : 'Audit & Diagnostic Express',
      href: '/audit',
      icon: Sparkles,
      active: pathname.startsWith('/audit'),
      badge: '5 Étapes',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold',
    },
    {
      name: t.nav.energy,
      href: '/energy',
      icon: Zap,
      active: pathname.startsWith('/energy'),
      badge: 'STEG MT',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    {
      name: t.nav.cbam,
      href: '/cbam',
      icon: Globe2,
      active: pathname.startsWith('/cbam'),
      badge: 'CBAM UE',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      name: t.nav.symbiosis,
      href: '/symbiosis',
      icon: Recycle,
      active: pathname.startsWith('/symbiosis'),
      badge: 'BioClaira',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      name: t.nav.ocr,
      href: '/ocr',
      icon: FileSearch,
      active: pathname.startsWith('/ocr'),
      badge: 'Gemini 2.5',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    {
      name: 'Centre Réglementaire',
      href: '/blog',
      icon: BookOpen,
      active: pathname.startsWith('/blog'),
      badge: 'ISO / UE',
      badgeColor: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    },
  ];

  const personaDetails = t.personas[persona];

  return (
    <aside className="w-64 shrink-0 border-e border-card-border bg-background flex flex-col justify-between py-6 px-3 transition-colors">
      {/* Navigation Links */}
      <div className="space-y-1.5">
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {locale === 'ar-TN' ? 'الوحدات الهندسية' : 'Engineering Modules'}
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                item.active
                  ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    item.active ? 'text-emerald-500' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Active Persona Facility Card */}
      <div className={`rounded-xl border p-3.5 space-y-2 ${
        persona === 'custom'
          ? 'border-emerald-500/40 bg-emerald-950/20'
          : 'border-card-border bg-card'
      }`}>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className={`h-3.5 w-3.5 ${persona === 'custom' ? 'text-emerald-400' : 'text-amber-400'}`} />
            {persona === 'custom' ? 'Usine Client Active' : t.nav.activePersona}
          </span>
          <span className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
            persona === 'custom'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {persona === 'custom' ? 'Mode Réel' : 'Exemple Démo'}
          </span>
        </div>
        <div className="text-xs font-bold text-foreground line-clamp-1">
          {personaDetails?.name}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="truncate">{personaDetails?.location}</span>
        </div>
      </div>
    </aside>
  );
}
