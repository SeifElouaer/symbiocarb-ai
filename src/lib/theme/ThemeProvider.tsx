'use client';

// ==============================================================================
// SymbioCarb AI - Theme Provider (Dark / Light / System Mode)
// Smooth zero-reload transitions with localStorage persistence
// ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Read stored preference or default to dark
    const stored = localStorage.getItem('symbiocarb-theme') as Theme | null;
    const initialTheme: Theme = stored || 'dark';
    setThemeState(initialTheme);

    const applyTheme = (t: Theme) => {
      const root = document.documentElement;
      let effectiveTheme: 'dark' | 'light' = 'dark';

      if (t === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = systemPrefersDark ? 'dark' : 'light';
      } else {
        effectiveTheme = t;
      }

      setResolvedTheme(effectiveTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      root.setAttribute('data-theme', effectiveTheme);
    };

    applyTheme(initialTheme);
    setMounted(true);

    // Listen to system theme changes if set to system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentStored = localStorage.getItem('symbiocarb-theme') as Theme | null;
      if (currentStored === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('symbiocarb-theme', newTheme);

    const root = document.documentElement;
    let effective: 'dark' | 'light' = 'dark';

    if (newTheme === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effective = newTheme;
    }

    setResolvedTheme(effective);
    root.classList.remove('light', 'dark');
    root.classList.add(effective);
    root.setAttribute('data-theme', effective);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
