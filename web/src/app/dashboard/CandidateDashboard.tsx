'use client';

import {
  FileText, TrendingUp, Search, User, ArrowRight,
  Coins, MapPin, Clock, LogOut, CheckCircle2,
  MessageSquare, Wallet, Calendar, X, LayoutGrid,
  Briefcase, Bell, Loader2, CheckCircle, Star
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice, getSelectedCurrency, CurrencyConfig } from '@/lib/currency';
import JobsPage from '../jobs/page';
import CalendarPage from '../calendar/page';
import ProfilePage from '../profile/page';
import WalletPage from '../wallet/page';
import ChatModal from '@/components/ChatModal';
import NotificationBell from '@/components/NotificationBell';
import { useSocket } from '@/hooks/useSocket';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';

interface Application {
  id: string;
  isAccepted: boolean;
  status?: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    price: number;
    location: string;
    status?: string;
  };
}

export default function CandidateDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'calendar' | 'profile' | 'wallet'>('overview');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub || payload.id);
      } catch (e) {}
    }
  }, []);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Job detail modal state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobDetail, setJobDetail] = useState<any>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Chat Modal state
  const [activeChatApp, setActiveChatApp] = useState<{ id: string; title: string } | null>(null);

  // Review Modal state for candidate
  const [selectedJobToReview, setSelectedJobToReview] = useState<{ id: string; title: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const submitReview = async () => {
    if (!selectedJobToReview) return;
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', {
        jobId: selectedJobToReview.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      addToast('Votre avis sur l\'employeur a été publié avec succès !', 'success', 'Avis Publié ⭐');
      setSelectedJobToReview(null);
      setReviewComment('');
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Erreur lors de la publication de l\'avis', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Real-time Notifications state
  const { socket, isConnected } = useSocket();
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    senderName: string;
    jobTitle: string;
    content: string;
    applicationId: string;
  } | null>(null);

  useEffect(() => {
    if (socket && isConnected) {
      const handleNotification = (notif: any) => {
        if (notif.type === 'NEW_MESSAGE') {
          setUnreadNotifsCount(prev => prev + 1);
          setActiveToast({
            id: notif.id,
            senderName: notif.senderName,
            jobTitle: notif.jobTitle,
            content: notif.content,
            applicationId: notif.applicationId,
          });
        }
      };

      socket.on('notification', handleNotification);
      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, isConnected]);

  const openModal = (title: string, content: React.ReactNode) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
  };

  const handleJobClick = async (jobId: string) => {
    setIsJobModalOpen(true);
    setIsLoadingJob(true);
    setJobDetail(null);
    setApplyMessage('');
    setIsApplying(false);
    setHasApplied(false);
    try {
      const res = await api.get(`/jobs/${jobId}`);
      setJobDetail(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingJob(false);
    }
  };

  const handleApplyFromModal = async () => {
    if (!jobDetail) return;
    setIsApplying(true);
    try {
      await api.post('/applications', { jobId: jobDetail.id, message: applyMessage });
      setHasApplied(true);
      addToast('Candidature envoyée avec succès !', 'success', 'Candidature enregistrée');
      // Refresh applications list
      const res = await api.get('/applications/my-applications');
      setApplications(res.data);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setHasApplied(true);
        addToast('Vous avez déjà postulé à cette mission.', 'info');
      } else {
        addToast(err.response?.data?.message || 'Erreur lors de la candidature', 'error');
      }
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications/my-applications');
        setApplications(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  const navItems = [
    { key: 'overview' as const, label: 'Overview', icon: LayoutGrid },
    { key: 'jobs' as const, label: 'Browse Jobs', icon: Search },
    { key: 'calendar' as const, label: 'Mon Planning', icon: Calendar },
    { key: 'profile' as const, label: 'Mon Profil', icon: User },
    { key: 'wallet' as const, label: 'Portefeuille', icon: Wallet },
  ];

  const stats = [
    { label: 'Candidatures', value: applications.length, icon: FileText, accent: 'bg-primary/20 text-primary' },
    { label: 'Acceptées', value: applications.filter(a => a.isAccepted).length, icon: CheckCircle2, accent: 'bg-emerald-500/20 text-emerald-400' },
    { label: 'Vues profil', value: 45, icon: TrendingUp, accent: 'bg-violet-500/20 text-violet-400' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background relative overflow-hidden">
      {/* ─── Sidebar / Mobile Navigation Header ─── */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-20 shrink-0">
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            Candidate Hub
          </h2>
          <div className="lg:hidden">
            <NotificationBell userId={userId} theme="primary" />
          </div>
        </div>

        <div className="p-2 lg:p-4 flex-1 overflow-x-auto no-scrollbar">
          <nav className="flex lg:flex-col gap-1.5 lg:space-y-2 min-w-max lg:min-w-0">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                  activeTab === item.key
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-xs lg:text-sm font-semibold transition-all lg:mt-4 border border-transparent hover:border-red-500/20 shrink-0"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Déconnexion</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 p-6 lg:p-12 relative z-10 h-screen overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4">
              {greeting}
              <span className="text-xs font-medium px-3 py-1 bg-primary/20 rounded-full text-primary border border-primary/30 uppercase">
                {userRole}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Voici l'état de vos candidatures et recherches d'emploi.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <NotificationBell userId={userId} theme="primary" />
          </div>
        </header>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {stats.map((s) => (
                <div key={s.label} className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div className={`${s.accent} p-3 rounded-xl`}>
                      <s.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mt-4 mb-1">{s.value}</h3>
                  <p className="text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Applications Table */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-foreground">Mes Candidatures Récentes</h2>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  Chercher des jobs <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-muted-foreground text-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Mission</th>
                      <th className="px-6 py-4 font-semibold">Statut</th>
                      <th className="px-6 py-4 font-semibold">Salaire</th>
                      <th className="px-6 py-4 font-semibold">Lieu</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement...</td></tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <p className="text-muted-foreground mb-4">Vous n'avez pas encore postulé.</p>
                          <button
                            onClick={() => setActiveTab('jobs')}
                            className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Trouver des missions
                          </button>
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-foreground">{app.job.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                              app.isAccepted || app.status === 'ACCEPTED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : app.status === 'REJECTED'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {app.isAccepted || app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Coins className="w-4 h-4 text-muted-foreground" />
                              {formatPrice(app.job.price)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {app.job.location || 'Remote'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            {app.job.status === 'COMPLETED' ? (
                              <button
                                onClick={() => setSelectedJobToReview({ id: app.job.id, title: app.job.title })}
                                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                              >
                                <Star className="w-4 h-4 fill-current" /> Évaluer l'employeur
                              </button>
                            ) : app.isAccepted ? (
                              <button
                                onClick={() => setActiveChatApp({ id: app.id, title: app.job.title })}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" /> Discuter
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal(
                                  app.job.title,
                                  <div className="space-y-3">
                                    <p><strong>Prix :</strong> {app.job.price} €</p>
                                    <p><strong>Lieu :</strong> {app.job.location || 'Remote'}</p>
                                    <p><strong>Postulé le :</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-muted-foreground mt-4">Votre candidature est en cours d'examen par l'employeur.</p>
                                  </div>
                                )}
                                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Voir détails
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ─── Embedded Pages ─── */}
        {activeTab === 'jobs' && <JobsPage isEmbedded={true} onJobClick={handleJobClick} excludeJobIds={applications.map(a => a.job?.id || '').filter(Boolean)} />}
        {activeTab === 'calendar' && (
          <CalendarPage
            isEmbedded={true}
            onJobClick={handleJobClick}
            onChatClick={(appId, title) => setActiveChatApp({ id: appId, title: `Chat — ${title}` })}
          />
        )}
        {activeTab === 'profile' && <ProfilePage isEmbedded={true} />}
        {activeTab === 'wallet' && <WalletPage isEmbedded={true} />}

        {/* ─── Generic Modal ─── */}
        {isModalOpen && modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="text-xl font-bold">{modalContent.title}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 text-muted-foreground">
                {modalContent.content}
              </div>
            </div>
          </div>
        )}

        {/* ─── Job Detail Modal ─── */}
        {isJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsJobModalOpen(false)}>
            <div className="bg-[#121212] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-3 py-0.5 text-xs font-bold text-primary">
                    {jobDetail?.category?.name || 'Général'}
                  </span>
                  <h3 className="text-xl font-bold text-white line-clamp-1">{isLoadingJob ? 'Chargement...' : jobDetail?.title || 'Détails de la mission'}</h3>
                </div>
                <button onClick={() => setIsJobModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 relative z-10 space-y-6">
                {isLoadingJob ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : jobDetail ? (
                  <div className="space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-lg">
                          <Coins className="w-4 h-4 shrink-0" />
                          {formatPrice(jobDetail.price)}
                        </div>
                        <p className="text-[11px] text-emerald-400/80 font-semibold mt-0.5">Rémunération</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {jobDetail.location || 'Sur place'}
                            {jobDetail.distanceKm !== undefined ? ` (📍 ${jobDetail.distanceKm} km)` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Localisation & Distance</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                          <User className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="truncate">{jobDetail.employer?.firstName} {jobDetail.employer?.lastName[0]}.</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Employeur</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{new Date(jobDetail.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Publication</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Description de la mission
                      </h4>
                      <div className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-2xl border border-white/5 font-normal">
                        {jobDetail.description}
                      </div>
                    </div>

                    {/* Apply Section */}
                    <div className="border-t border-white/10 pt-6">
                      {hasApplied ? (
                        <div className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-2xl font-bold border border-emerald-500/30 text-sm">
                          <CheckCircle className="w-5 h-5" />
                          Candidature envoyée avec succès !
                        </div>
                      ) : (
                        <>
                          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Message à l'employeur (optionnel)</label>
                          <textarea
                            value={applyMessage}
                            onChange={(e) => setApplyMessage(e.target.value)}
                            placeholder="Présentez brièvement vos compétences pour cette mission..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors resize-none mb-4"
                          />
                          <button
                            onClick={handleApplyFromModal}
                            disabled={isApplying}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary/25 disabled:opacity-50 cursor-pointer"
                          >
                            {isApplying ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</>
                            ) : (
                              'Postuler pour cette mission'
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    Impossible de charger les détails de cette mission.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ─── Chat Modal ─── */}
        {activeChatApp && (
          <ChatModal
            applicationId={activeChatApp.id}
            title={activeChatApp.title}
            onClose={() => setActiveChatApp(null)}
          />
        )}

        {/* Real-time Notification Toast & App Toasts */}
        <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] border border-primary/40 rounded-2xl p-4 shadow-2xl shadow-primary/20 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                <MessageSquare className="w-4 h-4" />
                Nouveau message
              </div>
              <button onClick={() => setActiveToast(null)} className="text-muted-foreground hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{activeToast.senderName}</p>
              <p className="text-xs text-muted-foreground mb-1">{activeToast.jobTitle}</p>
              <p className="text-xs text-gray-300 line-clamp-2 bg-white/5 p-2 rounded-lg italic">"{activeToast.content}"</p>
            </div>
            <button
              onClick={() => {
                setActiveChatApp({ id: activeToast.applicationId, title: `Chat — ${activeToast.jobTitle}` });
                setActiveToast(null);
                setUnreadNotifsCount(prev => Math.max(0, prev - 1));
              }}
              className="w-full bg-primary hover:bg-primary/80 text-white text-xs font-bold py-2 rounded-xl transition-colors"
            >
              Répondre au message
            </button>
          </div>
        )}

        {/* Review Modal for Candidate */}
        {selectedJobToReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedJobToReview(null)}>
            <div className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Évaluer l'employeur</h3>
                </div>
                <button onClick={() => setSelectedJobToReview(null)} className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Comment s'est passée votre collaboration sur la mission <span className="text-white font-semibold">"{selectedJobToReview.title}"</span> ?
                </p>
                <div className="flex gap-2 justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${reviewRating >= star ? 'text-amber-400 scale-110' : 'text-white/20 hover:text-white/40'}`}
                    >
                      <Star className="w-7 h-7 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Partagez votre avis sur l'employeur (ponctualité, clarté des consignes, communication...)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-amber-500/50 focus:outline-none resize-none mb-5"
                />
                <button
                  onClick={submitReview}
                  disabled={isSubmittingReview}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? 'Publication de l\'avis...' : 'Publier mon avis sur l\'employeur'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
