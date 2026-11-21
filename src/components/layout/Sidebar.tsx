'use client';

// ==============================================================================
// Industrial Responsive Sidebar (Clean Navigation, Zero Demo Artifacts)
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAudit } from '@/lib/audit/audit-context';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  Zap,
  Globe2,
  Recycle,
  FileSearch,
  Database,
  BookOpen,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { auditData, openAddDataModal } = useAudit();
  const { subscriptionPlan } = useAuth();

  const navigation = [
    {
      name: t.nav.dashboard,
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: locale === 'ar-TN' ? 'طاقة الستاغ' : 'Énergie STEG',
      href: '/energy',
      icon: Zap,
      active: pathname.startsWith('/energy'),
      badge: 'STEG MT',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      name: locale === 'ar-TN' ? 'مطابقة الكربون' : 'Conformité CBAM',
      href: '/cbam',
      icon: Globe2,
      active: pathname.startsWith('/cbam'),
      badge: 'CBAM UE',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      name: locale === 'ar-TN' ? 'مسح واستيراد الفواتير' : 'Import & Scanner',
      href: '/ocr',
      icon: FileSearch,
      active: pathname.startsWith('/ocr'),
      badge: 'OCR / CSV',
      badgeColor: 'bg-white/[0.05] text-slate-300 border-white/[0.1]',
    },
    {
      name: 'BioClaira',
      href: '/symbiosis',
      icon: Recycle,
      active: pathname.startsWith('/symbiosis'),
      badge: 'Pack Gold',
      badgeColor:
        subscriptionPlan === 'gold'
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    },
    {
      name: locale === 'ar-TN' ? 'بيانات المصنع' : 'Données Usine',
      href: '/audit',
      icon: Database,
      active: pathname.startsWith('/audit'),
    },
    {
      name: locale === 'ar-TN' ? 'النصوص التنظيمية' : 'Réglementation',
      href: '/blog',
      icon: BookOpen,
      active: pathname.startsWith('/blog'),
    },
  ];

  const hasCompanyName = auditData.companyName.trim().length > 0;

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-e border-white/[0.08] bg-[#080C14] flex-col justify-between py-5 px-3 transition-colors">
      <div className="space-y-1">
        <div className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>{locale === 'ar-TN' ? 'الوحدات' : 'Navigation'}</span>
          <span className="font-mono text-[9px] text-emerald-500 font-semibold">ISO 50001</span>
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                item.active
                  ? 'bg-white/[0.07] text-white border-s-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    item.active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-tight">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Real Active Facility Card */}
      <div className="space-y-2.5 pt-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0D1322] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="uppercase font-bold tracking-wider">Site Industriel</span>
            <span className="font-mono text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">
              {subscriptionPlan === 'gold' ? 'Gold' : subscriptionPlan === 'pro' ? 'Pro' : 'Starter'}
            </span>
          </div>

          <div className="text-xs font-bold text-white line-clamp-1">
            {hasCompanyName ? auditData.companyName : 'Usine non configurée'}
          </div>

          <div className="text-[11px] text-slate-400 truncate">
            {auditData.governorate || auditData.industrialZone
              ? `${auditData.governorate}${auditData.governorate && auditData.industrialZone ? ' • ' : ''}${auditData.industrialZone}`
              : 'Profil usine en attente'}
          </div>

          {!hasCompanyName && (
            <button
              type="button"
              onClick={() => openAddDataModal('profile')}
              className="w-full text-start text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 pt-1"
            >
              Configurer le profil →
            </button>
          )}
        </div>

        <div className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.05] text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>STEG: 0.473 kg/kWh</span>
          <span>ETS: 85 €/t</span>
        </div>
      </div>
    </aside>
  );
}
