'use client';

import {
  Briefcase, Users, MessageSquare, Plus, ArrowRight, User, MoreVertical,
  LayoutGrid, CheckCircle, Bell, LogOut, Loader2, X, Check, Star, Wallet,
  Trash2, Edit3, Coins, MapPin, Calendar, Clock, List, AlignLeft, ChevronRight, Search, Sparkles, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice, getSelectedCurrency, CurrencyConfig } from '@/lib/currency';
import ProfilePage from '../profile/page';
import WalletPage from '../wallet/page';
import CandidatesPage from '../candidates/page';
import ChatModal from '@/components/ChatModal';
import { useSocket } from '@/hooks/useSocket';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import { NotificationToast, ConfirmModal, ToastMessage, ConfirmDialog } from '@/components/NotificationToast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import GamificationBadge from '@/components/GamificationBadge';
import Logo from '@/components/Logo';
import OpenDisputeModal from '@/components/OpenDisputeModal';
import { Job, Application, Category, EmployerApplication } from '@/types';
import ReviewModal from '@/components/dashboard/ReviewModal';
import EditJobModal from '@/components/dashboard/EditJobModal';
import CreateJobModal from '@/components/dashboard/CreateJobModal';
import EmployerStatsGrid from '@/components/dashboard/EmployerStatsGrid';
import JobApplicantsModal from '@/components/dashboard/JobApplicantsModal';

export default function EmployerDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub || payload.id);
      } catch (e) {}
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'annuaire' | 'profile' | 'wallet'>('overview');

  // Toast & Confirm states
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Chat Modal state
  const [activeChatApp, setActiveChatApp] = useState<{ id: string; title: string } | null>(null);

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

  // Listen to custom real-time notification events
  useEffect(() => {
    const handleNotificationEvent = (e: any) => {
      const notif = e.detail;
      if (notif) {
        addToast(
          notif.message || notif.title,
          notif.type === 'NEW_APPLICATION' ? 'success' : 'info',
          notif.title
        );
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('jobconnect_notification_received', handleNotificationEvent);
      return () => {
        window.removeEventListener('jobconnect_notification_received', handleNotificationEvent);
      };
    }
  }, []);

  // Applicants for a specific job modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // All candidates applications state (for the Candidates tab)
  const [allCandidatesApps, setAllCandidatesApps] = useState<EmployerApplication[]>([]);
  const [isLoadingAllCandidates, setIsLoadingAllCandidates] = useState(false);

  // Review modal state
  const [selectedJobToReview, setSelectedJobToReview] = useState<Job | null>(null);

  // Dispute modal state
  const [disputeJob, setDisputeJob] = useState<Job | null>(null);

  // Create Job Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit Job Modal state
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchCategories();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true' || urlParams.get('success') === 'true') {
        addToast('Paiement validé ! Candidature acceptée et mission en cours 🎉', 'success', 'Succès');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'candidates' && jobs.length > 0) {
      fetchAllCandidates();
    }
  }, [activeTab, jobs]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/employer/my-jobs');
      setJobs(res.data);
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCandidates = async () => {
    setIsLoadingAllCandidates(true);
    try {
      const results = await Promise.all(
        jobs.map(async (job) => {
          try {
            const res = await api.get(`/applications/job/${job.id}`);
            return res.data.map((app: Application) => ({
              ...app,
              jobTitle: job.title,
              jobId: job.id,
            }));
          } catch {
            return [];
          }
        })
      );
      setAllCandidatesApps(results.flat());
    } catch (e) {
      console.error('Failed to fetch all candidates', e);
    } finally {
      setIsLoadingAllCandidates(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  const handleCompleteJob = (jobId: string) => {
    setConfirmDialog({
      title: 'Terminer la mission ?',
      message: 'Voulez-vous marquer cette mission comme terminée ? Cette action est irréversible.',
      type: 'warning',
      confirmText: 'Terminer',
      onConfirm: async () => {
        try {
          await api.patch(`/jobs/${jobId}/status`, { status: 'COMPLETED' });
          setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'COMPLETED' } : j));
          addToast('Mission clôturée avec succès', 'success');
        } catch (e) {
          console.error(e);
          addToast('Erreur lors de la clôture de la mission', 'error');
        }
      },
    });
  };

  const handleDeleteJob = (jobId: string) => {
    setConfirmDialog({
      title: 'Supprimer l\'annonce ?',
      message: 'Voulez-vous vraiment supprimer cette annonce ?',
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        try {
          await api.delete(`/jobs/${jobId}`);
          setJobs(jobs.filter(j => j.id !== jobId));
          addToast('Annonce supprimée', 'info');
        } catch (e) {
          console.error(e);
          addToast('Erreur lors de la suppression de l\'annonce', 'error');
        }
      },
    });
  };


  const handleRejectApplication = (appId: string) => {
    setConfirmDialog({
      title: 'Refuser la candidature ?',
      message: 'Êtes-vous sûr de vouloir refuser cette candidature ?',
      type: 'danger',
      confirmText: 'Refuser',
      onConfirm: async () => {
        try {
          await api.patch(`/applications/${appId}/reject`);
          setApplications(prev => prev.map(a => a.id === appId ? { ...a, isAccepted: false, status: 'REJECTED' } : a));
          setAllCandidatesApps(prev => prev.map(a => a.id === appId ? { ...a, isAccepted: false, status: 'REJECTED' } : a));
          addToast('Candidature refusée', 'info');
        } catch (e) {
          console.error(e);
          addToast('Erreur lors du refus de la candidature', 'error');
        }
      },
    });
  };


  // Edit Job Handler
  const handleOpenEditModal = (job: Job) => {
    setEditingJob(job);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background relative overflow-hidden">
      {/* Sidebar / Mobile Header Navigation */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-20 shrink-0">
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between">
          <Logo size="sm" showTagline={true} />
        </div>

        <div className="p-2 lg:p-4 flex-1 overflow-x-auto no-scrollbar">
          <nav className="flex lg:flex-col gap-1.5 lg:space-y-2 min-w-max lg:min-w-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'overview' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4 lg:w-5 lg:h-5" />
              {t('dashboard.overview')}
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'candidates' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 lg:w-5 lg:h-5" />
              {t('dashboard.applicants')}
            </button>
            <button
              onClick={() => setActiveTab('annuaire')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'annuaire' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              {t('dashboard.directory')} 🔍
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'profile' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              {t('dashboard.my_profile')}
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'wallet' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
              {t('dashboard.my_wallet')}
            </button>
            <Link
              href="/disputes"
              className="flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              <ShieldAlert className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
              Litiges & Séquestre
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-xs lg:text-sm font-semibold transition-all lg:mt-4 border border-transparent hover:border-red-500/20 shrink-0">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">{t('dashboard.logout')}</span>
            </button>
          </nav>
        </div>

        <div className="hidden lg:block p-6 border-t border-white/5">
          <button onClick={() => setIsCreateModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Plus className="w-5 h-5" />
            Créer une annonce
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 relative z-10 h-screen overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4">
              {greeting}
              <span className="text-xs font-medium px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 border border-amber-500/30 uppercase">
                {userRole}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('dashboard.employer_subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LanguageSwitcher variant="dropdown" align="right" />
            <ThemeToggle />
            <NotificationBell userId={userId} theme="amber" />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Annonce
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            {/* Top Stats */}
            <EmployerStatsGrid jobs={jobs} statJobsPostedLabel={t('dashboard.stat_jobs_posted')} />

            {/* Gamification Level & Employer Analytics */}
            <div className="mb-10 space-y-6">
              <GamificationBadge
                completedJobsCount={jobs.length + 8}
                rating={5.0}
                variant="card"
              />
              <AnalyticsDashboard
                role="EMPLOYER"
                totalEarningsOrSpent={2850}
                completedJobsCount={jobs.filter(j => j.status === 'COMPLETED').length + 8}
              />
            </div>

            {/* Detailed Job List */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-foreground">Vos Annonces Actives</h2>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-muted-foreground text-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Titre</th>
                      <th className="px-6 py-4 font-semibold">Statut</th>
                      <th className="px-6 py-4 font-semibold">Candidats</th>
                      <th className="px-6 py-4 font-semibold">Publié le</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement des annonces...</td></tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <p className="text-muted-foreground mb-4">Vous n'avez pas encore publié d'annonce.</p>
                          <button onClick={() => setIsCreateModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Publier votre première annonce
                          </button>
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-foreground">{job.title}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                              job.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{job._count?.applications || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-muted-foreground text-sm">
                            {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            {job.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  onClick={() => handleCompleteJob(job.id)}
                                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-2 cursor-pointer"
                                >
                                  <CheckCircle className="inline w-4 h-4 mr-1" /> Terminer
                                </button>
                                <button
                                  onClick={() => setDisputeJob(job)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors mr-2 cursor-pointer"
                                  title="Signaler un litige / Bloquer le séquestre"
                                >
                                  <ShieldAlert className="inline w-4 h-4 mr-1" /> Litige
                                </button>
                              </>
                            )}
                            {job.status === 'COMPLETED' && (
                              <>
                                <button
                                  onClick={() => setSelectedJobToReview(job)}
                                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-2 cursor-pointer"
                                >
                                  <Star className="inline w-4 h-4 mr-1" /> Noter
                                </button>
                                <button
                                  onClick={() => setDisputeJob(job)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors mr-2 cursor-pointer"
                                  title="Ouvrir une contestation d'assurance"
                                >
                                  <ShieldAlert className="inline w-4 h-4 mr-1" /> Litige
                                </button>
                              </>
                            )}
                            {(job.status === 'PENDING' || job.status === 'PUBLISHED') && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(job)}
                                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition-colors mr-2"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors mr-2"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={async () => {
                                setSelectedJob(job);
                                setIsLoadingApps(true);
                                try {
                                  const res = await api.get(`/applications/job/${job.id}`);
                                  setApplications(res.data);
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setIsLoadingApps(false);
                                }
                              }}
                              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Voir les candidats
                            </button>
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

        {/* Tab 2: Candidates Pool & Applications */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Toutes les Candidatures Reçues</h2>
                <p className="text-muted-foreground text-sm mt-1">Consultez et gérez les candidats ayant postulé à vos annonces.</p>
              </div>
            </div>

            {isLoadingAllCandidates ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : allCandidatesApps.length === 0 ? (
              <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Aucune candidature reçue pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allCandidatesApps.map((app) => (
                  <div key={app.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-lg text-foreground">{app.candidate.firstName} {app.candidate.lastName}</h4>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">
                          {app.jobTitle}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{app.candidate.email} • Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}</p>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-sm italic text-gray-300">
                        "{app.message || "Je suis très intéressé par cette mission."}"
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      {app.isAccepted || app.status === 'ACCEPTED' ? (
                        <>
                          <span className="inline-flex items-center gap-2 text-emerald-400 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" /> Candidat Accepté
                          </span>
                          <button
                            onClick={() => setActiveChatApp({ id: app.id, title: `Chat — ${app.candidate.firstName} (${app.jobTitle || 'Mission'})` })}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" /> Discuter
                          </button>
                        </>
                      ) : app.status === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-2 text-red-400 px-3.5 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-semibold">
                          <X className="w-4 h-4" /> Candidature Refusée
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.post(`/payments/checkout/${app.id}`);
                                if (res.data.url) {
                                  window.location.href = res.data.url;
                                }
                              } catch (e) {
                                alert('Erreur lors du paiement');
                              }
                            }}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                          >
                            <Check className="w-4 h-4" /> {t('dashboard.accept')}
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                          >
                            <X className="w-4 h-4" /> {t('dashboard.reject')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile */}
        {activeTab === 'profile' && (
          <div className="w-full -mt-10">
            <ProfilePage isEmbedded={true} />
          </div>
        )}

        {/* Tab 5: Wallet */}
        {activeTab === 'wallet' && (
          <div className="w-full -mt-10">
            <WalletPage isEmbedded={true} />
          </div>
        )}

        {/* Tab: Annuaire Prestataires (embedded) */}
        {activeTab === 'annuaire' && (
          <div className="w-full">
            <CandidatesPage />
          </div>
        )}

        {/* Modal for Applicants of a specific job */}
        <JobApplicantsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          applications={applications}
          isLoading={isLoadingApps}
          onClose={() => setSelectedJob(null)}
          onStartChat={(appId, candidateName) =>
            setActiveChatApp({ id: appId, title: `Chat — ${candidateName}` })
          }
          onReject={handleRejectApplication}
          acceptLabel={t('dashboard.accept')}
          rejectLabel={t('dashboard.reject')}
        />

        {/* Create Job Modal */}
        <CreateJobModal
          isOpen={isCreateModalOpen}
          categories={categories}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchJobs}
          addToast={addToast}
        />

        {/* Edit Job Modal */}
        <EditJobModal
          job={editingJob}
          isOpen={!!editingJob}
          categories={categories}
          onClose={() => setEditingJob(null)}
          onSuccess={fetchJobs}
          addToast={addToast}
        />

        {/* Review Modal */}
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
              addToast('Avis publié avec succès !', 'success');
            } catch (e: any) {
              addToast(
                e.response?.data?.message || "Erreur lors de la publication de l'avis",
                'error',
              );
            }
          }}
        />

        {/* Chat Modal */}
        {activeChatApp && (
          <ChatModal
            applicationId={activeChatApp.id}
            title={activeChatApp.title}
            onClose={() => setActiveChatApp(null)}
          />
        )}

        {/* Real-time Notification Toast */}
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1a1a1a] border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
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
                setActiveChatApp({ id: activeToast.applicationId, title: `Chat — ${activeToast.senderName}` });
                setActiveToast(null);
                setUnreadNotifsCount(prev => Math.max(0, prev - 1));
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
            >
              Répondre au message
            </button>
          </div>
        )}
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
              fetchJobs();
            }}
            addToast={addToast}
          />
        )}

        {/* Confirm Modal & Toast Notifications */}
        <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
        {confirmDialog && <ConfirmModal dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />}
      </main>
    </div>
  );
}
