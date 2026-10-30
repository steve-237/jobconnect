'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical root layout error caught by global-error:', error);
  }, [error]);

  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-[#0a0a0c] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#141416] border border-red-500/20 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Erreur Critique</h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Une erreur inattendue a interrompu l&apos;application. Veuillez rafraîchir l&apos;application.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-blue-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recharger l&apos;application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
