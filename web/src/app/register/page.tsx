'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import { decodeToken, isTokenExpired, sanitizeRedirectUrl } from '@/lib/auth';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const redirectParam = searchParams.get('redirect');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CANDIDATE',
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      const defaultDest = decoded?.role === 'ADMIN' ? '/admin' : '/dashboard';
      const targetUrl = sanitizeRedirectUrl(redirectParam, defaultDest);
      router.replace(targetUrl);
      return;
    }
    setIsCheckingAuth(false);
  }, [redirectParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token);
      window.dispatchEvent(new Event('jobconnect_auth_changed'));

      const decoded = decodeToken(token);
      const defaultDest = decoded?.role === 'ADMIN' ? '/admin' : '/dashboard';
      const targetUrl = sanitizeRedirectUrl(redirectParam, defaultDest);

      router.push(targetUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

      {/* Floating Top Right Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher variant="dropdown" align="right" />
      </div>

      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="glass p-8 md:p-10 rounded-3xl relative gradient-border shadow-2xl shadow-primary/5">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <Logo size="lg" showTagline={true} />
            </div>

            <h1 className="text-3xl font-bold mb-2 tracking-tight">{t('auth.register_title')}</h1>
            <p className="text-muted-foreground text-sm text-center">
              {t('auth.register_subtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role Selection */}
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'CANDIDATE' })}
                className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  formData.role === 'CANDIDATE'
                    ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">{t('auth.role_candidate')}</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
                className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  formData.role === 'EMPLOYER'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-sm font-medium">{t('auth.role_employer')}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-gray-300">{t('auth.first_name')}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-gray-300">{t('auth.last_name')}</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t('auth.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t('auth.password')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-4 rounded-xl mt-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('auth.register_btn')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth Register */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#111827] px-3 text-xs text-muted-foreground uppercase tracking-wider shrink-0">
                ou
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const googleUser = {
                    email: formData.email.trim() ? formData.email.trim() : 'nouveau.google@jobconnect.app',
                    firstName: formData.firstName.trim() ? formData.firstName.trim() : 'Google',
                    lastName: formData.lastName.trim() ? formData.lastName.trim() : 'Utilisateur',
                    role: formData.role,
                  };
                  const res = await api.post('/auth/google', googleUser);
                  const { access_token } = res.data;
                  if (access_token) {
                    localStorage.setItem('token', access_token);
                    const destination = redirectParam || '/dashboard';
                    window.location.href = destination;
                  }
                } catch (err: any) {
                  setError(err.response?.data?.message || 'Erreur lors de l\'inscription avec Google');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer text-sm shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              S'inscrire avec Google ({formData.role === 'EMPLOYER' ? 'Employeur' : 'Candidat'})
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            {t('auth.already_account')}{' '}
            <Link href={loginHref} className="text-primary hover:underline transition-colors font-medium">
              {t('auth.login_link')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
