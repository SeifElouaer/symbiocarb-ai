'use client';

// ==============================================================================
// Industrial Responsive Sidebar with Dynamic RTL Layout Alignment
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  LayoutDashboard, 
  Zap, 
  Globe2, 
  Recycle, 
  FileSearch, 
  Bot, 
  MapPin, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function Sidebar({ onOpenCopilot }: { onOpenCopilot?: () => void }) {
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
      name: t.nav.energy,
      href: '/energy',
      icon: Zap,
      active: pathname.startsWith('/energy'),
      badge: 'STEG MT',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      name: t.nav.cbam,
      href: '/cbam',
      icon: Globe2,
      active: pathname.startsWith('/cbam'),
      badge: 'CBAM UE',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      name: t.nav.symbiosis,
      href: '/symbiosis',
      icon: Recycle,
      active: pathname.startsWith('/symbiosis'),
      badge: 'BioClaira',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      name: t.nav.ocr,
      href: '/ocr',
      icon: FileSearch,
      active: pathname.startsWith('/ocr'),
      badge: 'Gemini 2.5',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  ];

  const personaDetails = t.personas[persona];

  return (
    <aside className="w-64 shrink-0 border-e border-card-border bg-[#090D16]/95 flex flex-col justify-between py-6 px-3">
      {/* Navigation Links */}
      <div className="space-y-1.5">
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
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
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    item.active ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-200'
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

        {/* Telegram DarjaBot Action in Sidebar */}
        <div className="pt-4 px-1">
          <button
            onClick={onOpenCopilot}
            className="w-full flex items-center justify-between rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-gray-900/40 p-3 text-start hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Bot className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>DarjaBot</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-gray-400">
                  {locale === 'ar-TN' ? 'مساعد الورشة الميداني' : 'Shop-Floor Copilot'}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Active Persona Facility Card */}
      <div className="rounded-xl border border-white/10 bg-gray-900/60 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {t.nav.activePersona}
          </span>
          <span className="font-mono text-[10px] text-emerald-400 uppercase">ISO 14064</span>
        </div>
        <div className="text-xs font-bold text-white line-clamp-1">
          {personaDetails?.name}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
          <span className="truncate">{personaDetails?.location}</span>
        </div>
      </div>
    </aside>
  );
}

