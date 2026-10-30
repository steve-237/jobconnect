'use client';

import {
  FileText, TrendingUp, Search, User, ArrowRight,
  Coins, MapPin, Clock, LogOut, CheckCircle2,
  MessageSquare, Wallet, Calendar, X, LayoutGrid,
  Briefcase, Bell, Loader2, CheckCircle, Star, Sparkles, ShieldAlert
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
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useSocket } from '@/hooks/useSocket';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import GamificationBadge from '@/components/GamificationBadge';
import Logo from '@/components/Logo';
import OpenDisputeModal from '@/components/OpenDisputeModal';
import { CandidateApplication } from '@/types';
import ReviewModal from '@/components/dashboard/ReviewModal';
import CandidateJobApplyModal from '@/components/dashboard/CandidateJobApplyModal';
import { clearStoredToken } from '@/lib/auth';

export default function CandidateDashboard({
  greeting,
  userRole,
  initialTab = 'overview',
}: {
  greeting: string;
  userRole: string;
  initialTab?: 'overview' | 'jobs' | 'calendar' | 'profile' | 'wallet';
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'calendar' | 'profile' | 'wallet'>(initialTab);

  useEffect(() => {
    if (initialTab && ['overview', 'jobs', 'calendar', 'profile', 'wallet'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  // Job detail & apply modal state
  const [selectedApplyJobId, setSelectedApplyJobId] = useState<string | null>(null);

  // Chat Modal state
  const [activeChatApp, setActiveChatApp] = useState<{ id: string; title: string } | null>(null);

  // Review Modal state for candidate
  const [selectedJobToReview, setSelectedJobToReview] = useState<{ id: string; title: string } | null>(null);

  // Dispute modal state
  const [disputeJob, setDisputeJob] = useState<{ id: string; title: string; price: number } | null>(null);

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

        // When employer sends a job invitation → refresh applications list & show toast
        if (notif.type === 'JOB_INVITATION') {
          addToast(
            notif.message || `Vous avez reçu une invitation pour la mission "${notif.jobTitle}".`,
            'info',
            '🌟 Invitation reçue !'
          );
          // Refresh applications so the new PENDING invite appears immediately
          api.get('/applications/my-applications')
            .then(res => setApplications(res.data))
            .catch(e => console.error('Failed to refresh applications after invitation', e));
        }

        // When a candidature is accepted → refresh applications list
        if (notif.type === 'APPLICATION_ACCEPTED') {
          addToast(
            notif.message || `Votre candidature a été acceptée !`,
            'success',
            '🎉 Candidature Acceptée !'
          );
          api.get('/applications/my-applications')
            .then(res => setApplications(res.data))
            .catch(e => console.error('Failed to refresh applications', e));
        }

        // When a candidature is rejected → refresh applications list
        if (notif.type === 'APPLICATION_REJECTED') {
          addToast(
            notif.message || `Votre candidature a été refusée.`,
            'error',
            '❌ Candidature Refusée'
          );
          api.get('/applications/my-applications')
            .then(res => setApplications(res.data))
            .catch(e => console.error('Failed to refresh applications', e));
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

  const handleJobClick = (jobId: string) => {
    setSelectedApplyJobId(jobId);
  };

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

  useEffect(() => {
    fetchApps();
  }, []);

  // Listen to real-time notification events
  useEffect(() => {
    const handleNotificationEvent = (e: any) => {
      const notif = e.detail;
      if (notif) {
        const isSuccess = notif.type === 'APPLICATION_ACCEPTED' || notif.type === 'JOB_COMPLETED';
        const isError = notif.type === 'APPLICATION_REJECTED';
        addToast(
          notif.message || notif.title,
          isSuccess ? 'success' : isError ? 'error' : 'info',
          notif.title
        );
        fetchApps();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('jobconnect_notification_received', handleNotificationEvent);
      return () => {
        window.removeEventListener('jobconnect_notification_received', handleNotificationEvent);
      };
    }
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    router.replace('/login');
  };

  const navItems = [
    { key: 'overview' as const, label: t('dashboard.overview'), icon: LayoutGrid },
    { key: 'jobs' as const, label: t('dashboard.browse_jobs'), icon: Search },
    { key: 'calendar' as const, label: t('dashboard.my_planning'), icon: Calendar },
    { key: 'profile' as const, label: t('dashboard.my_profile'), icon: User },
    { key: 'wallet' as const, label: t('dashboard.my_wallet'), icon: Wallet },
  ];

  const stats = [
    { label: t('dashboard.stat_applications'), value: applications.length, icon: FileText, accent: 'bg-primary/20 text-primary' },
    { label: t('dashboard.stat_accepted'), value: applications.filter(a => a.isAccepted).length, icon: CheckCircle2, accent: 'bg-emerald-500/20 text-emerald-400' },
    { label: t('dashboard.stat_profile_views'), value: 45, icon: TrendingUp, accent: 'bg-violet-500/20 text-violet-400' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background relative overflow-hidden">
      {/* ─── Sidebar / Mobile Navigation Header ─── */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-20 shrink-0">
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between">
          <Logo size="sm" showTagline={true} />
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
            <Link
              href="/disputes"
              className="flex items-center gap-2.5 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              <ShieldAlert className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
              Litiges & Séquestre
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-xs lg:text-sm font-semibold transition-all lg:mt-4 border border-transparent hover:border-red-500/20 shrink-0"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">{t('dashboard.logout')}</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 p-6 lg:p-12 relative z-10 h-screen overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4">
              {greeting}
              <span className="text-xs font-medium px-3 py-1 bg-primary/20 rounded-full text-primary border border-primary/30 uppercase">
                {userRole}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('dashboard.candidate_subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LanguageSwitcher variant="dropdown" align="right" />
            <ThemeToggle />
            <NotificationBell userId={userId} theme="primary" />
          </div>
        </header>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <>
            {/* Gamification Level & Analytics */}
            <div className="mb-10 space-y-6">
              <GamificationBadge
                completedJobsCount={applications.filter(a => a.isAccepted).length + 6}
                rating={4.9}
                variant="card"
              />
              <AnalyticsDashboard
                role="CANDIDATE"
                totalEarningsOrSpent={1480}
                completedJobsCount={applications.filter(a => a.isAccepted).length + 6}
              />
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
                          <p className="text-muted-foreground mb-4">{t('dashboard.no_applications')}</p>
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
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedJobToReview({ id: app.job.id, title: app.job.title })}
                                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                                >
                                  <Star className="w-4 h-4 fill-current" /> Évaluer l'employeur
                                </button>
                                <button
                                  onClick={() => setDisputeJob({ id: app.job.id, title: app.job.title, price: app.job.price })}
                                  className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                  title="Ouvrir un litige sur cette mission"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" /> Litige
                                </button>
                              </div>
                            ) : app.isAccepted ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setActiveChatApp({ id: app.id, title: app.job.title })}
                                  className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-xs"
                                >
                                  <MessageSquare className="w-4 h-4" /> Discuter
                                </button>
                                <button
                                  onClick={() => setDisputeJob({ id: app.job.id, title: app.job.title, price: app.job.price })}
                                  className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  title="Signaler un problème / Litige"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" /> Litige
                                </button>
                              </div>
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

        {/* ─── Job Detail & Apply Modal ─── */}
        <CandidateJobApplyModal
          jobId={selectedApplyJobId}
          isOpen={!!selectedApplyJobId}
          onClose={() => setSelectedApplyJobId(null)}
          onApplied={fetchApps}
          addToast={addToast}
        />
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
        <ReviewModal
          job={selectedJobToReview}
          isOpen={!!selectedJobToReview}
          onClose={() => setSelectedJobToReview(null)}
          onSubmit={async (jobId, rating, comment) => {
            try {
              await api.post('/reviews', {
                jobId,
                rating,
                comment,
              });
              addToast(
                "Votre avis sur l'employeur a été publié avec succès !",
                'success',
                'Avis Publié ⭐',
              );
            } catch (e: any) {
              addToast(
                e.response?.data?.message || "Erreur lors de la publication de l'avis",
                'error',
              );
            }
          }}
        />

        {/* Open Dispute Modal */}
        {disputeJob && (
          <OpenDisputeModal
            job={{
              id: disputeJob.id,
              title: disputeJob.title,
              price: disputeJob.price || 0,
            }}
            isOpen={!!disputeJob}
            onClose={() => setDisputeJob(null)}
            onSuccess={() => {
              fetchApps();
            }}
            addToast={addToast}
          />
        )}
      </main>
    </div>
  );
}
