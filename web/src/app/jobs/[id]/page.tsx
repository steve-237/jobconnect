'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, DollarSign, Clock, User, Briefcase, Loader2,
  CheckCircle2, Calendar, ShieldCheck, Sparkles, Send
} from 'lucide-react';
import api from '@/lib/api';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';

interface Job {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  createdAt: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  employer: {
    id: string;
    firstName: string;
    lastName: string;
    isVerified?: boolean;
  };
  category: {
    name: string;
  };
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const toastId = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, message: msg, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3500);
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      }
    } catch (e) {}

    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        console.error('Failed to fetch job', err);
        setError('Mission introuvable ou erreur de chargement.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    setIsApplying(true);
    try {
      await api.post('/applications', {
        jobId: job.id,
        message,
      });
      setApplied(true);
      addToast('Votre candidature a été transmise à l\'employeur !', 'success', 'Candidature envoyée');
    } catch (err: any) {
      console.error('Apply error', err);
      if (err.response?.status === 409) {
        setApplied(true);
        addToast('Vous avez déjà postulé à cette mission.', 'info');
      } else {
        addToast(err.response?.data?.message || 'Échec lors de l\'envoi de la candidature', 'error');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Chargement des détails de la mission...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 bg-white/5 rounded-full mb-4">
          <Briefcase className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Mission Introuvable</h2>
        <p className="text-muted-foreground mb-8 text-sm">{error || 'Cette offre n\'existe plus ou a été retirée.'}</p>
        <Link href="/jobs" className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/25">
          Parcourir les missions
        </Link>
      </div>
    );
  }

  const postedDate = new Date(job.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const employerInitials = `${job.employer.firstName[0]}${job.employer.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 relative">
      <NotificationToast toasts={toasts} onDismiss={(toastId) => setToasts((prev) => prev.filter((t) => t.id !== toastId))} />

      <div className="mx-auto max-w-4xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux missions
        </Link>

        {/* Main Job Card Container */}
        <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />

          {/* Header Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-8 mb-8 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3.5 py-1 text-xs font-bold text-primary mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {job.category?.name || 'Général'}
              </span>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-snug">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <User className="w-4 h-4 text-primary" />
                  {job.employer.firstName} {job.employer.lastName}
                  {job.employer.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                  )}
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Publié le {postedDate}
                </span>
              </div>
            </div>

            {/* Price Badge */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 flex flex-col items-start sm:items-end">
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Rémunération Proposée</span>
                <div className="text-4xl font-black text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-7 h-7" />
                  {job.price.toFixed(2)} €
                </div>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Paiement Sécurisé Stripe
              </span>
            </div>
          </div>

          {/* Quick Info Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Localisation</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{job.location || 'Sur place'}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Employeur</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{job.employer.firstName} {job.employer.lastName}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Date de réalisation</p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {job.scheduledDate
                    ? new Date(job.scheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    : 'À convenir'}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Description de la mission
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5 font-normal">
              {job.description}
            </div>
          </div>

          {/* Action Section */}
          <div className="border-t border-white/10 pt-8">
            {userRole === 'CANDIDATE' ? (
              <div className="flex flex-col gap-4 max-w-xl">
                {applied ? (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-5 rounded-2xl font-bold text-sm">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <div>
                      <p className="text-base">Candidature enregistrée !</p>
                      <p className="text-xs text-emerald-400/80 font-normal">L'employeur a été notifié et examinera votre profil.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">
                        Message à l'employeur (Optionnel)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Présentez vos motivations ou votre expérience pour cette mission..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
                      />
                    </div>
                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary/25 disabled:opacity-50 cursor-pointer"
                    >
                      {isApplying ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Envoi de votre candidature...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Postuler pour cette mission ({job.price.toFixed(2)} €)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : userRole ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-muted-foreground text-xs font-medium">
                Vous devez être connecté avec un compte Candidat pour postuler à cette mission.
              </div>
            ) : (
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-sm text-muted-foreground mb-4">Connectez-vous pour pouvoir postuler à cette offre.</p>
                <Link href="/login" className="inline-block bg-primary hover:bg-primary/80 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-primary/25">
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
