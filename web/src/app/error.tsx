'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, LayoutDashboard } from 'lucide-react';
import Logo from '@/components/Logo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled route error caught by App Router boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-red-900/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center mb-2">
          <Logo size="md" showTagline={false} />
        </div>

        <div className="glass p-8 sm:p-10 rounded-3xl border border-red-500/20 shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Erreur d&apos;affichage
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-4 mb-3">
            Une erreur inattendue est survenue
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
            Nous n&apos;avons pas pu charger cette page correctement. Vous pouvez essayer de rafraîchir l&apos;état ou retourner vers une page sécurisée.
          </p>

          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-left text-[11px] font-mono text-red-300 max-h-32 overflow-y-auto">
              {error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-lg shadow-primary/25 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 px-6 rounded-xl text-xs transition-all border border-white/10 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-semibold py-3.5 px-4 rounded-xl text-xs transition-all border border-white/5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
