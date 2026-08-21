'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon, MapPin, DollarSign, ArrowLeft, Clock, User,
  Briefcase, MessageSquare, ChevronLeft, ChevronRight, List, CalendarDays,
  CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import ChatModal from '@/components/ChatModal';

interface Application {
  id: string;
  isAccepted: boolean;
  status: string;
}

interface Job {
  id: string;
  title: string;
  price: number;
  location: string;
  status: string;
  scheduledDate: string | null;
  estimatedDuration: number | null;
  employer: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  applications?: Application[];
}

function getRelativeDateLabel(dateStr: string | null) {
  if (!dateStr) return { text: 'Date à fixer', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: "Aujourd'hui", color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold' };
  if (diffDays === 1) return { text: 'Demain', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-bold' };
  if (diffDays > 1) return { text: `Dans ${diffDays} jours`, color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
  return { text: 'Passée', color: 'bg-white/10 text-muted-foreground border-white/10' };
}

export default function CalendarPage({
  isEmbedded,
  onJobClick,
  onChatClick,
}: {
  isEmbedded?: boolean;
  onJobClick?: (jobId: string) => void;
  onChatClick?: (applicationId: string, title: string) => void;
} = {}) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // View & Filter states
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Embedded Chat Modal state
  const [activeChatApp, setActiveChatApp] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/jobs/candidate/calendar')
      .then((res) => {
        setJobs(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  // Compute KPI Stats
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalHours = jobs.reduce((acc, j) => acc + (j.estimatedDuration ? j.estimatedDuration / 60 : 0), 0);
    const totalEarnings = jobs.reduce((acc, j) => acc + j.price, 0);
    return { totalJobs, totalHours: Math.round(totalHours * 10) / 10, totalEarnings };
  }, [jobs]);

  // Filtered jobs list based on status & month grid day selection
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Filter by status tab
      if (statusFilter === 'in_progress' && job.status !== 'IN_PROGRESS') return false;
      if (statusFilter === 'completed' && job.status !== 'COMPLETED') return false;

      if (statusFilter === 'upcoming') {
        if (job.status === 'COMPLETED') return false;
        if (job.scheduledDate) {
          const jobDate = new Date(job.scheduledDate);
          if (jobDate < new Date() && job.status !== 'IN_PROGRESS') return false;
        }
      }

      // Filter by selected calendar day
      if (selectedDay !== null && job.scheduledDate) {
        const d = new Date(job.scheduledDate);
        if (d.getDate() !== selectedDay || d.getMonth() !== currentMonthDate.getMonth() || d.getFullYear() !== currentMonthDate.getFullYear()) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, statusFilter, selectedDay, currentMonthDate]);

  // Calendar month days calculation
  const calendarGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map of day number -> jobs on that day
    const jobsByDay: { [day: number]: Job[] } = {};
    jobs.forEach((job) => {
      if (job.scheduledDate) {
        const d = new Date(job.scheduledDate);
        if (d.getMonth() === month && d.getFullYear() === year) {
          const dayNum = d.getDate();
          if (!jobsByDay[dayNum]) jobsByDay[dayNum] = [];
          jobsByDay[dayNum].push(job);
        }
      }
    });

    return { firstDayIndex: (firstDayIndex + 6) % 7, daysInMonth, jobsByDay }; // Adjusted for Mon start
  }, [currentMonthDate, jobs]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const monthYearTitle = currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground text-sm">Chargement de votre planning...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className={isEmbedded ? 'w-full' : 'mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'}>
        {!isEmbedded && (
          <div className="mb-8 flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour au Dashboard
            </Link>
          </div>
        )}

        {/* ─── Page Header ─── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary/20 to-blue-500/10 text-primary p-4 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Mon Planning
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Organisez et suivez toutes vos missions acceptées.</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center glass p-1 rounded-xl self-start sm:self-auto border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'list' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" /> Liste
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Calendrier
            </button>
          </div>
        </div>

        {/* ─── KPI Stats Summary Bar ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="bg-blue-500/15 text-blue-400 p-3 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
              <p className="text-xs text-muted-foreground font-medium">Missions acceptées</p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="bg-purple-500/15 text-purple-400 p-3 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalHours} h</p>
              <p className="text-xs text-muted-foreground font-medium">Temps estimé total</p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="bg-emerald-500/15 text-emerald-400 p-3 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.totalEarnings} €</p>
              <p className="text-xs text-muted-foreground font-medium">Revenus prévus</p>
            </div>
          </div>
        </div>

        {/* ─── Status Filter Tabs ─── */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-white/5 pb-4">
          {[
            { id: 'all', label: 'Toutes les missions' },
            { id: 'upcoming', label: 'À venir' },
            { id: 'in_progress', label: 'En cours 🟢' },
            { id: 'completed', label: 'Terminées ✅' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id as any);
                setSelectedDay(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Grid View (Month Calendar) ─── */}
        {viewMode === 'grid' && (
          <div className="glass rounded-3xl p-6 border border-white/10 mb-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {monthYearTitle}
              </h2>
              <div className="flex items-center gap-2">
                {selectedDay !== null && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-medium transition-colors mr-2"
                  >
                    Effacer filtre jour
                  </button>
                )}
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground uppercase border-b border-white/5 pb-3">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span>Sam</span>
              <span>Dim</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading days */}
              {Array.from({ length: calendarGrid.firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 rounded-2xl bg-white/[0.01] opacity-20 pointer-events-none" />
              ))}

              {/* Month days */}
              {Array.from({ length: calendarGrid.daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayJobs = calendarGrid.jobsByDay[dayNum] || [];
                const isToday =
                  dayNum === new Date().getDate() &&
                  currentMonthDate.getMonth() === new Date().getMonth() &&
                  currentMonthDate.getFullYear() === new Date().getFullYear();
                const isSelected = selectedDay === dayNum;

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                    className={`h-24 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                      isSelected
                        ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20 scale-[1.03]'
                        : isToday
                        ? 'bg-white/10 border-primary/50'
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {dayNum}
                      </span>
                      {dayJobs.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/30 text-primary font-bold">
                          {dayJobs.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayJobs.slice(0, 2).map((j) => (
                        <div
                          key={j.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-medium"
                          title={j.title}
                        >
                          {j.title}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <div className="text-[9px] text-muted-foreground font-semibold px-1">
                          +{dayJobs.length - 2} de plus
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Jobs Cards List View ─── */}
        {filteredJobs.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center border border-white/5">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Aucune mission planifiée</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
              {selectedDay !== null
                ? `Aucune mission trouvée pour le ${selectedDay} ${monthYearTitle}.`
                : "Vous n'avez pas de mission correspondant aux filtres sélectionnés."}
            </p>
            {selectedDay !== null ? (
              <button onClick={() => setSelectedDay(null)} className="bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-xl font-bold transition-all">
                Voir toutes les dates
              </button>
            ) : (
              <button onClick={() => router.push('/jobs')} className="bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25">
                Parcourir les missions
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const dateInfo = getRelativeDateLabel(job.scheduledDate);
              const appId = job.applications?.[0]?.id;

              return (
                <div
                  key={job.id}
                  className="glass rounded-2xl p-6 border border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden"
                >
                  {/* Status Highlight Stripe */}
                  {job.status === 'IN_PROGRESS' && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
                  )}

                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    {/* Left: Date Box */}
                    <div className="shrink-0 bg-black/50 border border-white/10 rounded-2xl p-4 text-center min-w-[110px] flex flex-col justify-center items-center h-28 shadow-inner">
                      {job.scheduledDate ? (
                        <>
                          <span className="text-[11px] font-bold text-primary uppercase tracking-widest mb-0.5">
                            {new Date(job.scheduledDate).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="text-3xl font-extrabold text-foreground leading-none mb-1">
                            {new Date(job.scheduledDate).getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">
                            {new Date(job.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-7 h-7 text-amber-400 mb-1" />
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">À définir</span>
                        </>
                      )}
                    </div>

                    {/* Middle: Mission Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Relative Date Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${dateInfo.color}`}>
                          {dateInfo.text}
                        </span>

                        {/* Status Badge */}
                        {job.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Mission en cours
                          </span>
                        ) : job.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-muted-foreground border border-white/10">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Terminée
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          {job.employer.firstName} {job.employer.lastName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {job.location || 'Remote'}
                        </span>
                        {job.estimatedDuration && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            {job.estimatedDuration / 60}h estimé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="text-2xl font-extrabold text-emerald-400 flex items-center">
                        <DollarSign className="w-5 h-5 -mr-1" />
                        {job.price} €
                      </div>

                      <div className="flex items-center gap-2">
                        {appId && (
                          <button
                            onClick={() => {
                              if (onChatClick) {
                                onChatClick(appId, job.title);
                              } else {
                                setActiveChatApp({ id: appId, title: `Chat — ${job.title}` });
                              }
                            }}
                            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            title="Contacter l'employeur"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Discuter
                          </button>
                        )}

                        {isEmbedded && onJobClick ? (
                          <button
                            onClick={() => onJobClick(job.id)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
                          >
                            Détails
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
                          >
                            Détails
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Embedded Chat Modal */}
        {activeChatApp && (
          <ChatModal
            applicationId={activeChatApp.id}
            title={activeChatApp.title}
            onClose={() => setActiveChatApp(null)}
          />
        )}
      </div>
    </div>
  );
}
