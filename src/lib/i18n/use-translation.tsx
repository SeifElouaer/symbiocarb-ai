'use client';

// ==============================================================================
// SymbioCarb AI - Trilingual (FR / EN / AR-TN) Context Hook
// Handles instant zero-reload language switching and dynamic RTL layout management
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/types';
import { fr } from './dictionaries/fr';
import { en } from './dictionaries/en';
import { arTN } from './dictionaries/ar-TN';

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  dir: 'ltr' | 'rtl';
  t: typeof fr;
}

const dictionaries = {
  fr,
  en,
  'ar-TN': arTN,
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const savedLocale = localStorage.getItem('symbiocarb_locale') as Locale | null;
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en' || savedLocale === 'ar-TN')) {
      setLocaleState(savedLocale);
    }
    // Clean up legacy demo persona key
    localStorage.removeItem('symbiocarb_persona');
  }, []);

  const dir = locale === 'ar-TN' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
      if (locale === 'ar-TN') {
        document.documentElement.classList.add('rtl-layout');
      } else {
        document.documentElement.classList.remove('rtl-layout');
      }
    }
  }, [locale, dir]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('symbiocarb_locale', newLocale);
  };

  const t = dictionaries[locale] || dictionaries.fr;

  return (
    <I18nContext.Provider value={{ locale, setLocale, dir, t }}>
      <div dir={dir} className={locale === 'ar-TN' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
