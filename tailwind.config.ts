import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        foreground: '#F9FAFB',
        card: {
          DEFAULT: '#111827',
          elevated: '#161F30',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        primary: {
          DEFAULT: '#10B981', // Emerald for carbon savings & circular gains
          foreground: '#000000',
          dark: '#059669',
          light: '#34D399',
        },
        accent: {
          amber: '#F59E0B', // STEG Pointe warning
          crimson: '#EF4444', // cos phi penalty / CBAM exposure
          blue: '#3B82F6', // Technical / Grid
          purple: '#8B5CF6', // BioClaira valorization
        },
        muted: {
          DEFAULT: '#1F2937',
          foreground: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'IBM Plex Sans Arabic', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        scan: 'scan 2.5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

