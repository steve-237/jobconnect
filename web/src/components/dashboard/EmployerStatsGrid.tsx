'use client';

import React from 'react';
import { Briefcase, Users, CheckCircle } from 'lucide-react';
import { Job } from '@/types';

interface EmployerStatsGridProps {
  jobs: Job[];
  statJobsPostedLabel: string;
}

export default function EmployerStatsGrid({
  jobs,
  statJobsPostedLabel,
}: EmployerStatsGridProps) {
  const totalApplications = jobs.reduce(
    (acc, job) => acc + (job._count?.applications || 0),
    0,
  );
  const completedJobsCount = jobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="bg-amber-500/20 text-amber-500 p-3 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-4xl font-bold mt-4 mb-1">{jobs.length}</h3>
        <p className="text-muted-foreground font-medium">{statJobsPostedLabel}</p>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-4xl font-bold mt-4 mb-1">{totalApplications}</h3>
        <p className="text-muted-foreground font-medium">Total Candidatures</p>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-4xl font-bold mt-4 mb-1">{completedJobsCount}</h3>
        <p className="text-muted-foreground font-medium">Missions Terminées</p>
      </div>
    </div>
  );
}
