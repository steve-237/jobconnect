'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, MapPin, DollarSign, ArrowLeft, Clock, User, Briefcase } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Job {
  id: string;
  title: string;
  price: number;
  location: string;
  scheduledDate: string | null;
  estimatedDuration: number | null;
  employer: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export default function CalendarPage({ isEmbedded, onJobClick }: { isEmbedded?: boolean; onJobClick?: (jobId: string) => void } = {}) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/jobs/candidate/calendar')
      .then(res => {
        setJobs(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Chargement de votre planning...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className={isEmbedded ? "w-full" : "mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"}>
        {!isEmbedded && (
          <div className="mb-8 flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour au Dashboard
            </Link>
          </div>
        )}

        <div className="mb-10 flex items-center gap-4">
          <div className="bg-blue-500/20 text-blue-400 p-4 rounded-2xl">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Mon Planning</h1>
            <p className="text-muted-foreground mt-1">Vos missions acceptées à venir.</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center border border-white/5">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Aucune mission prévue</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Vous n'avez pas encore de missions acceptées. Explorez les annonces pour trouver votre prochaine mission !
            </p>
            <button onClick={() => router.push('/jobs')} className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
              Parcourir les missions
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-colors group">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  {/* Left Side: Date Box */}
                  <div className="shrink-0 bg-black/40 border border-white/10 rounded-xl p-4 text-center min-w-[100px] flex flex-col justify-center items-center h-24 shadow-inner">
                    {job.scheduledDate ? (
                      <>
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
                          {new Date(job.scheduledDate).toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                        <span className="text-3xl font-bold text-white leading-none mb-1">
                          {new Date(job.scheduledDate).getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(job.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">À définir</span>
                      </>
                    )}
                  </div>

                  {/* Middle: Job Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors truncate">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <User className="w-4 h-4 text-emerald-400" />
                        {job.employer.firstName} {job.employer.lastName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        {job.location || 'Remote'}
                      </span>
                      {job.estimatedDuration && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-purple-400" />
                          {job.estimatedDuration / 60}h estimé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Action / Price */}
                  <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="text-2xl font-bold text-emerald-400 flex items-center">
                      <DollarSign className="w-5 h-5" />
                      {job.price}
                    </div>
                    {isEmbedded && onJobClick ? (
                      <button onClick={() => onJobClick(job.id)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5 hover:border-white/20">
                        Voir la mission
                      </button>
                    ) : (
                      <button onClick={() => router.push(`/jobs/${job.id}`)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5 hover:border-white/20">
                        Voir la mission
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
