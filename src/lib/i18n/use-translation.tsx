'use client';

// ==============================================================================
// SymbioCarb AI - Trilingual (FR / EN / AR-TN) & Persona Context Hook
// Handles instant zero-reload language switching and dynamic RTL layout management
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/types';
import { fr } from './dictionaries/fr';
import { en } from './dictionaries/en';
import { arTN } from './dictionaries/ar-TN';

export type PersonaSlug = 'sfax' | 'tozeur' | 'benarous' | 'custom';

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  dir: 'ltr' | 'rtl';
  t: typeof fr;
  persona: PersonaSlug;
  setPersona: (p: PersonaSlug) => void;
}

const dictionaries = {
  fr,
  en,
  'ar-TN': arTN,
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [persona, setPersonaState] = useState<PersonaSlug>('benarous'); // Default to CBAM/cos phi heavy

  // Initialize from localStorage if present
  useEffect(() => {
    const savedLocale = localStorage.getItem('symbiocarb_locale') as Locale | null;
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en' || savedLocale === 'ar-TN')) {
      setLocaleState(savedLocale);
    }
    const savedPersona = localStorage.getItem('symbiocarb_persona') as PersonaSlug | null;
    if (savedPersona && (savedPersona === 'sfax' || savedPersona === 'tozeur' || savedPersona === 'benarous' || savedPersona === 'custom')) {
      setPersonaState(savedPersona);
    }
  }, []);

  const dir = locale === 'ar-TN' ? 'rtl' : 'ltr';

  // Synchronize document direction & language tags
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

  const setPersona = (newPersona: PersonaSlug) => {
    setPersonaState(newPersona);
    localStorage.setItem('symbiocarb_persona', newPersona);
  };

  const t = dictionaries[locale] || dictionaries.fr;

  return (
    <I18nContext.Provider value={{ locale, setLocale, dir, t, persona, setPersona }}>
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

