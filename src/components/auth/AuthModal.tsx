'use client';

// ==============================================================================
// SymbioCarb AI - Auth Modal Component
// Authentic Google OAuth & Email/Password factory registration and sign-in
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { X, AlertCircle, ArrowRight } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalInitialTab,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const { locale } = useTranslation();

  const [tab, setTab] = useState<'signin' | 'signup'>(authModalInitialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalInitialTab);
      setErrorMsg(null);
    }
  }, [isAuthModalOpen, authModalInitialTab]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message || 'Impossible de se connecter avec Google.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (tab === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(error.message || 'Identifiants invalides ou compte introuvable.');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Veuillez renseigner votre nom complet.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) {
        setErrorMsg(error.message || 'Erreur lors de la création du compte.');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-6 sm:p-8 shadow-2xl border border-white/[0.12] bg-[#0A0F1D]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="btn-tactile absolute top-4 end-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1.5">
            SymbioCarb AI • Espace Entreprise
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            {tab === 'signin' ? 'Connexion à votre espace usine' : 'Créer un compte entreprise'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {locale === 'ar-TN'
              ? 'سجل الدخول لإدارة فواتير الستاغ ومطابقة الكربون الأوروبي لمصنعك'
              : 'Accédez à votre cockpit énergétique STEG et vos déclarations CBAM.'}
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="btn-tactile w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 px-4 text-sm font-semibold text-white hover:bg-white/[0.08] transition-all"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <span className="relative bg-[#0A0F1D] px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            ou par e-mail professionnel
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Tabs */}
        <div className="flex rounded-xl bg-black/40 border border-white/[0.06] p-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
            }}
            className={`btn-tactile flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-emerald-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
            }}
            className={`btn-tactile flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-emerald-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Créer un Compte
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Nom complet &amp; fonction
              </label>
              <input
                type="text"
                required
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              E-mail professionnel
            </label>
            <input
              type="email"
              required
              placeholder="prenom.nom@entreprise.tn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-tactile w-full mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-black transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <span>
              {loading
                ? 'Traitement...'
                : tab === 'signin'
                  ? 'Accéder à mon espace'
                  : 'Créer mon compte usine'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
