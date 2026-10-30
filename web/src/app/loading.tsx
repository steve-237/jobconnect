import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-white tracking-wide">Chargement...</p>
          <p className="text-xs text-muted-foreground">Préparation de votre espace JobConnect</p>
        </div>
      </div>
    </div>
  );
}
