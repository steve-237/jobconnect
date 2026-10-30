'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Home, LayoutDashboard, Search, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[20%] left-[15%] w-[45%] h-[45%] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-[40%] h-[40%] rounded-full bg-purple-900/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center mb-2">
          <Logo size="md" showTagline={false} />
        </div>

        <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative gradient-border">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary shadow-lg shadow-primary/10">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Erreur 404 — Page Introuvable
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4 mb-3">
            Oups ! Destination inconnue
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            La page que vous recherchez n&apos;existe pas, a été déplacée ou l&apos;adresse saisie est incorrecte.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Link>

            <Link
              href="/jobs"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all border border-white/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Voir les missions</span>
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all border border-white/5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Page précédente</span>
            </button>

            <Link
              href="/"
              className="sm:col-span-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all border border-white/5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Page d&apos;accueil</span>
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">
          JobConnect &bull; Plateforme de Recrutement & Missions Ponctuelles
        </p>
      </div>
    </div>
  );
}
