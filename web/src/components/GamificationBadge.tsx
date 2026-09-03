'use client';

import { Award, Zap, ShieldCheck, Crown, Sparkles } from 'lucide-react';

interface GamificationBadgeProps {
  completedJobsCount?: number;
  rating?: number;
  variant?: 'compact' | 'card';
}

export function getGamificationLevel(completedCount = 0, rating = 5.0) {
  if (completedCount >= 30 && rating >= 4.7) {
    return {
      levelName: 'Diamant 💎',
      badge: 'Top Elite 🏆',
      discountPercent: 10,
      nextThreshold: 50,
      currentProgress: 100,
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10',
      icon: Crown,
    };
  }

  if (completedCount >= 15 && rating >= 4.5) {
    return {
      levelName: 'Or 🥇',
      badge: 'Super Prestataire ⚡',
      discountPercent: 5,
      nextThreshold: 30,
      currentProgress: Math.round((completedCount / 30) * 100),
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10',
      icon: Zap,
    };
  }

  if (completedCount >= 5) {
    return {
      levelName: 'Argent 🥈',
      badge: 'Confirmé 🌟',
      discountPercent: 2,
      nextThreshold: 15,
      currentProgress: Math.round((completedCount / 15) * 100),
      badgeBg: 'bg-slate-400/20 text-slate-200 border-slate-400/40 shadow-slate-400/10',
      icon: Award,
    };
  }

  return {
    levelName: 'Bronze 🥉',
    badge: 'Membre Actif 🌱',
    discountPercent: 0,
    nextThreshold: 5,
    currentProgress: Math.round((completedCount / 5) * 100),
    badgeBg: 'bg-amber-700/20 text-amber-400 border-amber-700/40 shadow-amber-700/10',
    icon: ShieldCheck,
  };
}

export default function GamificationBadge({
  completedJobsCount = 0,
  rating = 5.0,
  variant = 'compact',
}: GamificationBadgeProps) {
  const level = getGamificationLevel(completedJobsCount, rating);
  const Icon = level.icon;

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${level.badgeBg}`}
        title={`Niveau ${level.levelName} - Réduction frais ${level.discountPercent}%`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{level.levelName}</span>
      </span>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${level.badgeBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Niveau {level.levelName}
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-xs text-muted-foreground">{level.badge}</p>
          </div>
        </div>
        {level.discountPercent > 0 && (
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            -{level.discountPercent}% Frais
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground">
          <span>Progression Niveau ({completedJobsCount}/{level.nextThreshold} missions)</span>
          <span>{level.currentProgress}%</span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary via-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${level.currentProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
