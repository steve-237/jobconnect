'use client';

import { useState, useEffect } from 'react';
import {
  Users, Search, Star, ShieldCheck, ArrowLeft, Send,
  X, Briefcase, CheckCircle2, Target, MapPin
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { calculateMatchingScore } from '@/lib/matching';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';
import { useLanguage } from '@/contexts/LanguageContext';

interface CandidateUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  skills?: string[];
  portfolio?: { id: string; title: string; imageUrl: string }[];
  reputation?: {
    averageRating: number;
    totalReviews: number;
    badges: { code: string; label: string; color: string }[];
  };
}

interface EmployerJob {
  id: string;
  title: string;
  price: number;
  status: string;
}

export default function CandidatesPage() {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [myJobs, setMyJobs] = useState<EmployerJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Invite Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateUser | null>(null);
  const [portfolioCandidate, setPortfolioCandidate] = useState<CandidateUser | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/users');
        const allUsers = Array.isArray(res.data) ? res.data : [];
        const candidateList = allUsers.filter((u: any) => u.role === 'CANDIDATE');

        // Fetch reputation for each candidate
        const candidatesWithRep = await Promise.all(
          candidateList.map(async (c: any) => {
            try {
              const repRes = await api.get(`/reviews/user/${c.id}/reputation`);
              return { ...c, reputation: repRes.data };
            } catch (e) {
              return { ...c, reputation: { averageRating: 5.0, totalReviews: 0, badges: [] } };
            }
          })
        );

        setCandidates(candidatesWithRep);

        // Try to fetch employer's jobs for invitation dropdown
        try {
          const jobsRes = await api.get('/jobs/employer/my-jobs');
          if (Array.isArray(jobsRes.data)) {
            const active = jobsRes.data.filter((j: any) => j.status === 'PUBLISHED' || j.status === 'PENDING');
            setMyJobs(active);
            if (active.length > 0) setSelectedJobId(active[0].id);
          }
        } catch (e) {
          // Non-employer or logged out user
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const bio = (c.bio || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || bio.includes(query);

    const rating = c.reputation?.averageRating || 5.0;
    const matchesRating = rating >= minRating;
    const matchesVerified = !onlyVerified || Boolean(c.isVerified);

    return matchesSearch && matchesRating && matchesVerified;
  });

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !selectedJobId) {
      addToast('Veuillez sélectionner une mission active', 'error');
      return;
    }

    setIsSending(true);
    try {
      await api.post('/applications/invite', {
        candidateId: selectedCandidate.id,
        jobId: selectedJobId,
        message: inviteMessage,
      });

      addToast(
        `Invitation envoyée avec succès à ${selectedCandidate.firstName} !`,
        'success',
        'Invitation Transmise 📩'
      );
      setSelectedCandidate(null);
      setInviteMessage('');
    } catch (err: any) {
      addToast(err.response?.data?.message || "Échec de l'envoi de l'invitation", 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 relative">
      <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Back Button */}
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Retour aux offres
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                <Users className="w-8 h-8 text-amber-400" />
                {t('candidates.title')}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('candidates.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Search & Control Panel ─── */}
        <div className="glass rounded-2xl p-4 border border-amber-500/20 shadow-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              <input
                type="text"
                placeholder={t('candidates.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>

            {/* Min Rating Selector */}
            <div className="md:col-span-3">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-xs font-medium text-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-[#121212] text-white">Toutes les notes</option>
                <option value={4} className="bg-[#121212] text-white">⭐ 4.0 étoiles et +</option>
                <option value={4.5} className="bg-[#121212] text-white">🌟 4.5 étoiles et + (Top)</option>
              </select>
            </div>

            {/* Verified Filter Checkbox */}
            <div className="md:col-span-3 flex items-center justify-end">
              <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 w-4 h-4 cursor-pointer"
                />
                <ShieldCheck className="w-4 h-4 text-blue-400" /> {t('candidates.verified_only')}
              </label>
            </div>
          </div>
        </div>

        {/* ─── Candidates Feed Grid ─── */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground border border-white/5">
            {t('candidates.no_candidates')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map((cand) => {
              const initials = `${cand.firstName?.[0] || 'C'}${cand.lastName?.[0] || 'P'}`.toUpperCase();
              const rating = cand.reputation?.averageRating || 5.0;
              const fitScore = calculateMatchingScore({ userRating: rating });

              return (
                <div
                  key={cand.id}
                  className="glass rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xl hover:scale-[1.01]"
                >
                  <div className="space-y-3">
                    {/* Header: Avatar + Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-amber-200/10 border border-amber-500/30 text-amber-400 font-extrabold text-base flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                            {cand.firstName} {cand.lastName}
                            {cand.isVerified && (
                              <span title="Profil Vérifié">
                                <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-500/20" />
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-white">{rating.toFixed(1)}</span>
                            <span>({cand.reputation?.totalReviews || 0} {t('candidates.reviews')})</span>
                          </p>
                        </div>
                      </div>

                      {/* Matching Score Badge */}
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                        <Target className="w-3 h-3 text-purple-400" />
                        🎯 {fitScore}% Fit
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {cand.bio || "Prestataire qualifié disponible pour réaliser vos missions avec soin et professionnalisme."}
                    </p>

                    {/* Skills Badges */}
                    {cand.skills && cand.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cand.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                          >
                            🛠️ {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reputation Badges */}
                    {cand.reputation?.badges && cand.reputation.badges.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {cand.reputation.badges.map((b) => (
                          <span
                            key={b.code}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300"
                          >
                            {b.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Portfolio Button (if photos exist) */}
                    {cand.portfolio && cand.portfolio.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPortfolioCandidate(cand)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all cursor-pointer"
                      >
                        📸 {t('candidates.portfolio')} ({cand.portfolio.length})
                      </button>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(cand)}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {t('candidates.invite')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── MODAL INVITATION A UNE MISSION ─── */}
        {selectedCandidate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedCandidate(null)}
          >
            <div
              className="glass rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-amber-500/30 relative shadow-2xl bg-[#141414]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {t('candidates.invite_modal_title')} — {selectedCandidate.firstName} {selectedCandidate.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground">Proposez-lui directement l'une de vos annonces</p>
                </div>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                {myJobs.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-400">
                    Vous n'avez actuellement aucune annonce active. Créez une annonce depuis votre tableau de bord pour pouvoir inviter ce candidat.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">{t('candidates.invite_select_job')} :</label>
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:border-amber-500 focus:outline-none cursor-pointer"
                      >
                        {myJobs.map((job) => (
                          <option key={job.id} value={job.id} className="bg-[#121212] text-white">
                            {job.title} ({job.price} €)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Message d'invitation (Optionnel) :</label>
                      <textarea
                        rows={3}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Bonjour, votre profil correspond parfaitement à ma recherche. Je vous invite à postuler !"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
                    >
                      {isSending ? 'Envoi en cours...' : `${t('candidates.invite_send')} 🚀`}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL PORTFOLIO PHOTO SHOWCASE ─── */}
        {portfolioCandidate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setPortfolioCandidate(null)}
          >
            <div
              className="glass rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-blue-500/30 relative shadow-2xl bg-[#141414]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPortfolioCandidate(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Portfolio de {portfolioCandidate.firstName} {portfolioCandidate.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground">Photos de réalisations de travaux et chantiers passés</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {(portfolioCandidate.portfolio || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} className="glass rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-3 bg-card/90">
                      <p className="font-bold text-sm text-white">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
