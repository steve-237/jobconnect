'use client';

import {
  Briefcase, Users, MessageSquare, Plus, ArrowRight, User, MoreVertical,
  LayoutGrid, CheckCircle, Bell, LogOut, Loader2, X, Check, Star, Wallet,
  Trash2, Edit3, Coins, MapPin, Calendar, Clock, List, AlignLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatPrice, getSelectedCurrency, CurrencyConfig } from '@/lib/currency';
import ProfilePage from '../profile/page';
import WalletPage from '../wallet/page';
import ChatModal from '@/components/ChatModal';
import { useSocket } from '@/hooks/useSocket';
import NotificationBell from '@/components/NotificationBell';
import { NotificationToast, ConfirmModal, ToastMessage, ConfirmDialog } from '@/components/NotificationToast';

interface Job {
  id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  categoryId?: string;
  scheduledDate?: string | null;
  estimatedDuration?: number | null;
  status: string;
  createdAt: string;
  _count: { applications: number };
}

interface Application {
  id: string;
  message: string;
  isAccepted: boolean;
  status?: string;
  createdAt: string;
  jobId?: string;
  jobTitle?: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function EmployerDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();
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

  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'profile' | 'wallet'>('overview');

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

  // Applicants for a specific job modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // All candidates applications state (for the Candidates tab)
  const [allCandidatesApps, setAllCandidatesApps] = useState<Application[]>([]);
  const [isLoadingAllCandidates, setIsLoadingAllCandidates] = useState(false);

  // Review modal state
  const [selectedJobToReview, setSelectedJobToReview] = useState<Job | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Create Job Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    categoryId: '',
    scheduledDate: '',
    estimatedDuration: '',
  });

  // Edit Job Modal state
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isUpdatingJob, setIsUpdatingJob] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    categoryId: '',
    scheduledDate: '',
    estimatedDuration: '',
  });

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

  const submitReview = async () => {
    if (!selectedJobToReview) return;
    try {
      await api.post('/reviews', {
        jobId: selectedJobToReview.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setSelectedJobToReview(null);
      setReviewRating(5);
      setReviewComment('');
      addToast('Avis publié avec succès !', 'success');
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Erreur lors de la publication de l\'avis', 'error');
    }
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

  // Create Job Handler
  const handleOpenCreateModal = () => {
    setCreateFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      scheduledDate: '',
      estimatedDuration: '',
    });
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingJob(true);
    setCreateError('');

    try {
      await api.post('/jobs', {
        title: createFormData.title,
        description: createFormData.description,
        price: parseFloat(createFormData.price),
        location: createFormData.location,
        categoryId: createFormData.categoryId,
        scheduledDate: createFormData.scheduledDate ? new Date(createFormData.scheduledDate).toISOString() : undefined,
        estimatedDuration: createFormData.estimatedDuration ? parseInt(createFormData.estimatedDuration) : undefined,
      });
      setIsCreateModalOpen(false);
      await fetchJobs();
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Erreur lors de la création de l\'annonce');
    } finally {
      setIsCreatingJob(false);
    }
  };

  // Edit Job Handler
  const handleOpenEditModal = async (job: Job) => {
    setEditError('');
    setEditingJob(job);
    try {
      const res = await api.get(`/jobs/${job.id}`);
      const fullJob = res.data;
      let formattedDate = '';
      if (fullJob.scheduledDate) {
        const d = new Date(fullJob.scheduledDate);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }
      setEditFormData({
        title: fullJob.title || '',
        description: fullJob.description || '',
        price: fullJob.price ? fullJob.price.toString() : '',
        location: fullJob.location || '',
        categoryId: fullJob.categoryId || (categories.length > 0 ? categories[0].id : ''),
        scheduledDate: formattedDate,
        estimatedDuration: fullJob.estimatedDuration ? fullJob.estimatedDuration.toString() : '',
      });
    } catch (e) {
      console.error('Failed to load job details', e);
    }
  };

  const handleEditJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setIsUpdatingJob(true);
    setEditError('');

    try {
      await api.patch(`/jobs/${editingJob.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        location: editFormData.location,
        categoryId: editFormData.categoryId,
        scheduledDate: editFormData.scheduledDate ? new Date(editFormData.scheduledDate).toISOString() : null,
        estimatedDuration: editFormData.estimatedDuration ? parseInt(editFormData.estimatedDuration) : null,
      });
      setEditingJob(null);
      await fetchJobs();
    } catch (err: any) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setIsUpdatingJob(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background relative overflow-hidden">
      {/* Sidebar / Mobile Header Navigation */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-20 shrink-0">
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            Employer Hub
          </h2>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Annonce
            </button>
            <NotificationBell userId={userId} theme="amber" />
          </div>
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
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'candidates' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 lg:w-5 lg:h-5" />
              Candidats & Postulants
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'profile' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'wallet' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
              Portefeuille
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3.5 py-2.5 lg:px-4 lg:py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-xs lg:text-sm font-semibold transition-all lg:mt-4 border border-transparent hover:border-red-500/20 shrink-0">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Déconnexion</span>
            </button>
          </nav>
        </div>

        <div className="hidden lg:block p-6 border-t border-white/5">
          <button onClick={handleOpenCreateModal} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Plus className="w-5 h-5" />
            Créer une annonce
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 relative z-10 h-screen overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4">
              {greeting}
              <span className="text-xs font-medium px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 border border-amber-500/30 uppercase">
                {userRole}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gérez vos annonces et suivez les candidatures reçues.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <NotificationBell userId={userId} theme="amber" />
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="bg-amber-500/20 text-amber-500 p-3 rounded-xl"><Briefcase className="w-6 h-6" /></div>
                </div>
                <h3 className="text-4xl font-bold mt-4 mb-1">{jobs.length}</h3>
                <p className="text-muted-foreground font-medium">Missions créées</p>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl"><Users className="w-6 h-6" /></div>
                </div>
                <h3 className="text-4xl font-bold mt-4 mb-1">
                  {jobs.reduce((acc, job) => acc + (job._count?.applications || 0), 0)}
                </h3>
                <p className="text-muted-foreground font-medium">Total Candidatures</p>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                </div>
                <h3 className="text-4xl font-bold mt-4 mb-1">
                  {jobs.filter(j => j.status === 'COMPLETED').length}
                </h3>
                <p className="text-muted-foreground font-medium">Missions Terminées</p>
              </div>
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
                          <button onClick={handleOpenCreateModal} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
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
                              <button
                                onClick={() => handleCompleteJob(job.id)}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-2"
                              >
                                <CheckCircle className="inline w-4 h-4 mr-1" /> Terminer
                              </button>
                            )}
                            {job.status === 'COMPLETED' && (
                              <button
                                onClick={() => setSelectedJobToReview(job)}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-2"
                              >
                                <Star className="inline w-4 h-4 mr-1" /> Noter
                              </button>
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
                            <Check className="w-4 h-4" /> Accepter
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                          >
                            <X className="w-4 h-4" /> Refuser
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

        {/* Modal for Applicants of a specific job */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold">Candidats pour "{selectedJob.title}"</h3>
                  <p className="text-sm text-muted-foreground mt-1">{applications.length} candidat(s) au total</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingApps ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Aucun candidat pour le moment.</div>
                ) : (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                          <h4 className="font-bold text-lg">{app.candidate.firstName} {app.candidate.lastName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{app.candidate.email}</p>
                          <div className="bg-black/30 p-3 rounded-lg text-sm italic text-gray-300">
                            "{app.message || "Je suis très intéressé par cette opportunité."}"
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {app.isAccepted || app.status === 'ACCEPTED' ? (
                            <>
                              <span className="hidden sm:inline-flex items-center gap-2 text-emerald-400 px-2 text-sm font-semibold">
                                <CheckCircle className="w-4 h-4" /> Accepté
                              </span>
                              <button
                                onClick={() => setActiveChatApp({ id: app.id, title: `Chat — ${app.candidate.firstName} ${app.candidate.lastName}` })}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" /> Discuter
                              </button>
                            </>
                          ) : app.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-2 text-red-400 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-semibold">
                              <X className="w-4 h-4" /> Refusée
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
                                    alert('Erreur lors de l\'initiation du paiement');
                                  }
                                }}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                              >
                                <Check className="w-4 h-4" /> Accepter
                              </button>
                              <button
                                onClick={() => handleRejectApplication(app.id)}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                              >
                                <X className="w-4 h-4" /> Refuser
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Job Modal (No Scrollbar Layout) */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsCreateModalOpen(false)}>
            <div className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Publier une nouvelle annonce</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Remplissez les informations pour trouver un candidat qualifié</p>
                  </div>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content - 2 Columns Compact */}
              <div className="relative z-10">
                {createError && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateJobSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Essential Fields */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Titre de l'annonce</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={createFormData.title}
                          onChange={e => setCreateFormData({ ...createFormData, title: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                          placeholder="ex: Déménagement appartement 3 pièces"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Catégorie</label>
                      <div className="relative">
                        <List className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                          required
                          value={createFormData.categoryId}
                          onChange={e => setCreateFormData({ ...createFormData, categoryId: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-[#141414] pl-10 pr-8 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-[#141414] text-white">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Budget ({getSelectedCurrency().symbol})
                        </label>
                        <div className="relative">
                          <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                          <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={createFormData.price}
                            onChange={e => setCreateFormData({ ...createFormData, price: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="150"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Localisation</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={createFormData.location}
                            onChange={e => setCreateFormData({ ...createFormData, location: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                            placeholder="Paris 11e"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Date prévue</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="datetime-local"
                            value={createFormData.scheduledDate}
                            onChange={e => setCreateFormData({ ...createFormData, scheduledDate: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-2 py-2 text-[11px] text-foreground focus:border-amber-500 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Durée (min)</label>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="number"
                            min="15"
                            step="15"
                            value={createFormData.estimatedDuration}
                            onChange={e => setCreateFormData({ ...createFormData, estimatedDuration: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none font-medium"
                            placeholder="120 min"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Description & Publish Button */}
                  <div className="flex flex-col justify-between space-y-3.5">
                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Description détaillée</label>
                      <div className="relative flex-1 flex flex-col">
                        <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                        <textarea
                          required
                          value={createFormData.description}
                          onChange={e => setCreateFormData({ ...createFormData, description: e.target.value })}
                          className="w-full flex-1 min-h-[145px] rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed font-normal"
                          placeholder="Décrivez précisément la mission, le matériel nécessaire et les consignes particulières..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingJob}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {isCreatingJob ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publier l\'annonce maintenant'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Job Modal (No Scrollbar Layout) */}
        {editingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setEditingJob(null)}>
            <div className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Modifier l'annonce</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Mettez à jour les détails de votre offre de mission</p>
                  </div>
                </div>
                <button onClick={() => setEditingJob(null)} className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content - 2 Columns Compact */}
              <div className="relative z-10">
                {editError && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
                    {editError}
                  </div>
                )}

                <form onSubmit={handleEditJobSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Titre de l'annonce</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={editFormData.title}
                          onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Catégorie</label>
                      <div className="relative">
                        <List className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                          required
                          value={editFormData.categoryId}
                          onChange={e => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-[#141414] pl-10 pr-8 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-[#141414] text-white">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Budget ({getSelectedCurrency().symbol})
                        </label>
                        <div className="relative">
                          <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                          <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={editFormData.price}
                            onChange={e => setEditFormData({ ...editFormData, price: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Localisation</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={editFormData.location}
                            onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Date prévue</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="datetime-local"
                            value={editFormData.scheduledDate}
                            onChange={e => setEditFormData({ ...editFormData, scheduledDate: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-2 py-2 text-[11px] text-foreground focus:border-amber-500 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Durée (min)</label>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="number"
                            min="15"
                            step="15"
                            value={editFormData.estimatedDuration}
                            onChange={e => setEditFormData({ ...editFormData, estimatedDuration: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col justify-between space-y-3.5">
                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Description détaillée</label>
                      <div className="relative flex-1 flex flex-col">
                        <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                        <textarea
                          required
                          value={editFormData.description}
                          onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                          className="w-full flex-1 min-h-[145px] rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed font-normal"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingJob}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingJob ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {selectedJobToReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedJobToReview(null)}>
            <div className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Évaluer le candidat</h3>
                </div>
                <button onClick={() => setSelectedJobToReview(null)} className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Comment s'est passée la mission <span className="text-white font-semibold">"{selectedJobToReview.title}"</span> ?
                </p>
                <div className="flex gap-2 justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl transition-all ${reviewRating >= star ? 'text-amber-400 scale-110' : 'text-white/20 hover:text-white/40'}`}
                    >
                      <Star className="w-7 h-7 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Laissez un commentaire sur le travail effectué..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-amber-500/50 focus:outline-none resize-none mb-5"
                />
                <button
                  onClick={submitReview}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  Publier l'avis
                </button>
              </div>
            </div>
          </div>
        )}

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
        {/* Confirm Modal & Toast Notifications */}
        <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
        {confirmDialog && <ConfirmModal dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />}
      </main>
    </div>
  );
}
