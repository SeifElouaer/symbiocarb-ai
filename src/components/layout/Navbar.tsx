'use client';

// ==============================================================================
// Global Industrial Navbar: Trilingual Switcher (FR/EN/AR-TN), Persona Switcher,
// and Direct Telegram Push Trigger
// ==============================================================================

import React, { useState } from 'react';
import { useTranslation, PersonaSlug } from '@/lib/i18n/use-translation';
import { Locale } from '@/types';
import { 
  Building2, 
  Send, 
  Sparkles, 
  Languages, 
  CheckCircle2, 
  Radio, 
  Flame, 
  Bot 
} from 'lucide-react';

export function Navbar({ onOpenCopilot }: { onOpenCopilot?: () => void }) {
  const { locale, setLocale, persona, setPersona, t } = useTranslation();
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramSuccess, setTelegramSuccess] = useState(false);

  const handleSendTelegramTest = async () => {
    setIsSendingTelegram(true);
    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType: 'pointe_warning',
          locale,
          persona,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTelegramSuccess(true);
        setTimeout(() => setTelegramSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-[#090D16]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md glow-emerald">
            <Flame className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                SymbioCarb <span className="text-emerald-400">AI</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                PROD v1.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              {locale === 'ar-TN' ? 'منظومة الذكاء الكربوني للقطاع الصناعي التونسي' : 'Tunisian Industrial Decarbonization Hub'}
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Persona Switcher */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-gray-900/80 p-1">
            <Building2 className="h-4 w-4 ms-2 text-emerald-400" />
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as PersonaSlug)}
              className="bg-transparent text-xs font-medium text-gray-200 outline-none cursor-pointer pe-2 py-1"
            >
              <option value="benarous" className="bg-gray-900 text-white">
                🏭 Ben Arous (Mécanique & CBAM)
              </option>
              <option value="tozeur" className="bg-gray-900 text-white">
                🌴 Tozeur (Dattes & BioClaira)
              </option>
              <option value="sfax" className="bg-gray-900 text-white">
                🫒 Sfax (Huilerie & Pointe STEG)
              </option>
            </select>
          </div>

          {/* Trilingual Language Selector */}
          <div className="flex items-center rounded-lg border border-white/10 bg-gray-900/80 p-1">
            <Languages className="h-3.5 w-3.5 ms-1.5 me-1 text-gray-400" />
            <button
              onClick={() => setLocale('fr')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                locale === 'fr'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                locale === 'en'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ar-TN')}
              className={`rounded px-2 py-1 text-xs font-semibold font-arabic transition-all ${
                locale === 'ar-TN'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              تونسية
            </button>
          </div>

          {/* Outbound Telegram Phone Push Button */}
          <button
            onClick={handleSendTelegramTest}
            disabled={isSendingTelegram}
            title="Envoyer une vraie notification Telegram sur votre téléphone"
            className={`hidden md:flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              telegramSuccess
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
            }`}
          >
            {telegramSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Envoyé sur Telegram !</span>
              </>
            ) : isSendingTelegram ? (
              <>
                <Radio className="h-4 w-4 animate-spin text-blue-400" />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 text-blue-400" />
                <span>Test Alert Telegram</span>
              </>
            )}
          </button>

          {/* DarjaBot Drawer Trigger */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
          >
            <Bot className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">DarjaBot</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

