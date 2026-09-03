'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Coins, Briefcase, Award, CheckCircle, Users } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface AnalyticsDashboardProps {
  role?: 'CANDIDATE' | 'EMPLOYER';
  totalEarningsOrSpent?: number;
  completedJobsCount?: number;
}

const MOCK_MONTHLY_DATA = [
  { month: 'Jan', gains: 150, missions: 2, dépenses: 200 },
  { month: 'Fév', gains: 320, missions: 4, dépenses: 450 },
  { month: 'Mar', gains: 280, missions: 3, dépenses: 300 },
  { month: 'Avr', gains: 510, missions: 6, dépenses: 620 },
  { month: 'Mai', gains: 450, missions: 5, dépenses: 500 },
  { month: 'Juin', gains: 680, missions: 8, dépenses: 780 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard({
  role = 'CANDIDATE',
  totalEarningsOrSpent = 1240,
  completedJobsCount = 12,
}: AnalyticsDashboardProps) {
  const isEmployer = role === 'EMPLOYER';

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isEmployer ? 'Total Dépensé' : 'Cumul des Gains'}
            </span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 tracking-tight">
            {formatPrice(totalEarningsOrSpent)}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +18.5% ce mois-ci
          </span>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Missions Réalisées
            </span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-400 mt-2 tracking-tight">
            {completedJobsCount}
          </p>
          <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 mt-2">
            <CheckCircle className="w-3 h-3" /> Taux de complétion 98%
          </span>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Taux de Réponse IA
            </span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2 tracking-tight">
            96 %
          </p>
          <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-2">
            ⭐ Évaluation moyenne 4.9/5
          </span>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-white">
              {isEmployer ? 'Évolution du Budget Dépensé (€)' : 'Évolution des Gains Mensuels (€)'}
            </h4>
            <p className="text-xs text-muted-foreground">Historique et tendances sur les 6 derniers mois</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGains" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isEmployer ? '#f59e0b' : '#10b981'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={isEmployer ? '#f59e0b' : '#10b981'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [`${value} €`, isEmployer ? 'Dépenses' : 'Gains']}
              />
              <Area
                type="monotone"
                dataKey={isEmployer ? 'dépenses' : 'gains'}
                stroke={isEmployer ? '#f59e0b' : '#10b981'}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGains)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
