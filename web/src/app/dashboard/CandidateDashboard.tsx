'use client';

import {
  FileText, TrendingUp, Search, User, ArrowRight,
  DollarSign, MapPin, Clock, LogOut, CheckCircle2,
  MessageSquare, Wallet, Calendar, X, LayoutGrid,
  Briefcase, Bell, Loader2, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import JobsPage from '../jobs/page';
import CalendarPage from '../calendar/page';
import ProfilePage from '../profile/page';
import WalletPage from '../wallet/page';
import ChatModal from '@/components/ChatModal';

interface Application {
  id: string;
  isAccepted: boolean;
  createdAt: string;
  job: {
    title: string;
    price: number;
    location: string;
  };
}

export default function CandidateDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'calendar' | 'profile' | 'wallet'>('overview');

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
      // Refresh applications list
      const res = await api.get('/applications/my-applications');
      setApplications(res.data);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setHasApplied(true);
      } else {
        alert(err.response?.data?.message || 'Erreur lors de la candidature');
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
      {/* ─── Sidebar ─── */}
      <aside className="w-full lg:w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            Candidate Hub
          </h2>
        </div>

        <div className="p-4 flex-1">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === item.key
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-all mt-4 border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
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
            <button className="p-2 bg-white/5 border border-white/10 rounded-full text-muted-foreground hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
            </button>
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
                              app.isAccepted
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {app.isAccepted ? 'Acceptée' : 'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 font-medium">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              {app.job.price} €
                            </div>
                          </td>
                          <td className="px-6 py-5 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {app.job.location || 'Remote'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            {app.isAccepted ? (
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
        {activeTab === 'calendar' && <CalendarPage isEmbedded={true} onJobClick={handleJobClick} />}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsJobModalOpen(false)}>
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
                <h3 className="text-xl font-bold">{isLoadingJob ? 'Chargement...' : jobDetail?.title || 'Détails'}</h3>
                <button onClick={() => setIsJobModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingJob ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : jobDetail ? (
                  <div className="space-y-6">
                    {/* Category + Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                        {jobDetail.category?.name || 'Non catégorisé'}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                          <DollarSign className="w-5 h-5" />
                          {jobDetail.price} €
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Rémunération</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          {jobDetail.location || 'Remote'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Localisation</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <User className="w-5 h-5 text-muted-foreground" />
                          {jobDetail.employer?.firstName} {jobDetail.employer?.lastName}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Employeur</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          {new Date(jobDetail.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Date de publication</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Description de la mission
                      </h4>
                      <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5">
                        {jobDetail.description}
                      </div>
                    </div>

                    {/* Apply Section */}
                    <div className="border-t border-white/10 pt-6">
                      {hasApplied ? (
                        <div className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-xl font-semibold border border-emerald-500/20">
                          <CheckCircle className="w-5 h-5" />
                          Candidature envoyée avec succès !
                        </div>
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">Message à l'employeur (optionnel)</label>
                          <textarea
                            value={applyMessage}
                            onChange={(e) => setApplyMessage(e.target.value)}
                            placeholder="Pourquoi êtes-vous le bon candidat pour cette mission ?"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none mb-4"
                          />
                          <button
                            onClick={handleApplyFromModal}
                            disabled={isApplying}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  <p className="text-center text-muted-foreground py-8">Impossible de charger les détails.</p>
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
      </main>
    </div>
  );
}
