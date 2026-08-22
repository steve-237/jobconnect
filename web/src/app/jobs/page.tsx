'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User,
  ArrowLeft,
  Loader2,
  Map as MapIcon,
  List,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-3xl glass animate-pulse flex items-center justify-center border border-white/10">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
    </div>
  ),
});

interface Job {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  employer: {
    firstName: string;
    lastName: string;
    isVerified?: boolean;
  };
  category: {
    name: string;
  };
}

function daysAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return `Il y a ${diff} jours`;
}

export default function JobsPage({
  isEmbedded,
  onJobClick,
  theme = 'primary',
  excludeJobIds = [],
  onlyMyJobs = false,
}: {
  isEmbedded?: boolean;
  onJobClick?: (jobId: string) => void;
  theme?: 'primary' | 'amber';
  excludeJobIds?: string[];
  onlyMyJobs?: boolean;
} = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = onlyMyJobs ? '/jobs/employer/my-jobs' : '/jobs';
        const promises: Promise<any>[] = [api.get(endpoint), api.get('/categories')];

        const token = localStorage.getItem('token');
        let isCandidate = false;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'CANDIDATE') {
              isCandidate = true;
            }
          } catch (e) {}
        }

        if (isCandidate && !onlyMyJobs) {
          promises.push(api.get('/applications/my-applications'));
        }

        const [jobsRes, catsRes, appsRes] = await Promise.all(promises);
        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);

        if (appsRes && Array.isArray(appsRes.data)) {
          const ids = new Set<string>(appsRes.data.map((app: any) => app.job?.id || app.jobId).filter(Boolean));
          setAppliedJobIds(ids);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [onlyMyJobs]);

  const isAmber = theme === 'amber';
  const badgeColor = isAmber ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-primary/15 text-primary border-primary/30';
  const titleGradient = isAmber ? 'from-amber-400 to-amber-500' : 'from-primary via-blue-400 to-indigo-400';
  const hoverBorder = isAmber ? 'hover:border-amber-500/40 hover:shadow-amber-500/10' : 'hover:border-primary/40 hover:shadow-primary/10';
  const titleHover = isAmber ? 'group-hover:text-amber-400' : 'group-hover:text-primary';
  const actionBtnClass = isAmber
    ? 'flex items-center justify-center gap-2 w-full rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm font-bold text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]'
    : 'flex items-center justify-center gap-2 w-full rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]';
  const viewToggleActive = isAmber ? 'bg-amber-500 text-white shadow-md' : 'bg-primary text-white shadow-md';
  const focusRing = isAmber ? 'focus:border-amber-500/50 focus:ring-amber-500/50' : 'focus:border-primary/50 focus:ring-primary/50';
  const loaderColor = isAmber ? 'text-amber-500' : 'text-primary';

  const allCategories = ['Toutes les catégories', ...(Array.isArray(categories) ? categories.map((c) => c.name) : [])];
  const excludedSet = new Set([...excludeJobIds, ...Array.from(appliedJobIds)]);

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
    if (excludedSet.has(job.id)) return false;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'Toutes les catégories' || job.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={isEmbedded ? 'w-full' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>
      {!isEmbedded && (
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      )}

      {/* Header & Search Hero */}
      <section className="relative overflow-hidden rounded-3xl glass border border-white/10 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> Des milliers de missions vérifiées
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Trouvez votre prochaine{' '}
            <span className={`bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
              Mission Ideal
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
            Parcourez les offres disponibles en direct, filtrez selon vos compétences et postulez directement en 1 clic.
          </p>

          {/* Search Bar Container */}
          <div className="glass rounded-2xl p-3 border border-white/15 shadow-2xl flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Job, compétence, ville (ex: Déménagement, Paris...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground ${focusRing} focus:outline-none focus:ring-1 transition-all text-sm font-medium`}
              />
            </div>

            {/* Category Select */}
            <div className="relative sm:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-10 text-foreground text-sm font-medium ${focusRing} focus:outline-none focus:ring-1 transition-all cursor-pointer`}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#121212] text-foreground py-2">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {allCategories.slice(0, 6).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Header Info & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Missions disponibles
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-extrabold">
              {filteredJobs.length}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paiement garanti et séquestre sécurisé par Stripe
          </p>
        </div>

        {/* Toggle List/Map */}
        <div className="flex items-center glass rounded-xl p-1 border border-white/10 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'list' ? viewToggleActive : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Vue Liste</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'map' ? viewToggleActive : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Vue Carte</span>
          </button>
        </div>
      </div>

      {/* Jobs Container */}
      <section className="pb-12">
        {isLoading ? (
          <div className={`flex flex-col items-center justify-center py-20 ${loaderColor}`}>
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Chargement des missions en cours...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          viewMode === 'map' ? (
            <MapComponent jobs={filteredJobs} />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => {
                const employerInitials = `${job.employer?.firstName?.[0] || 'E'}${job.employer?.lastName?.[0] || 'M'}`;

                return (
                  <div
                    key={job.id}
                    className={`glass group relative flex flex-col rounded-3xl p-6 border border-white/10 transition-all duration-300 hover:scale-[1.02] shadow-xl ${hoverBorder}`}
                  >
                    {/* Top Row: Category + Price Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className={`inline-flex items-center border rounded-full px-3 py-1 text-xs font-bold ${badgeColor}`}>
                        {job.category?.name || 'Général'}
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold px-3 py-1 rounded-full text-sm">
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>{job.price.toFixed(2)} €</span>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className={`mb-3 text-lg font-bold text-foreground leading-snug ${titleHover} transition-colors line-clamp-2`}>
                      {job.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>

                    {/* Meta info grid */}
                    <div className="mb-6 mt-auto space-y-2.5 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="font-medium text-foreground">{job.location || 'Sur place'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{daysAgo(job.createdAt)}</span>
                        </div>
                      </div>

                      {/* Employer info */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {employerInitials}
                          </div>
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                            {job.employer?.firstName} {job.employer?.lastName}
                            {job.employer?.isVerified && (
                              <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500/20" title="Compte Vérifié" />
                            )}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Garanti
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isEmbedded && onJobClick ? (
                      <button onClick={() => onJobClick(job.id)} className={actionBtnClass}>
                        <span>Voir les détails</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <Link href={`/jobs/${job.id}`} className={actionBtnClass}>
                        <span>Voir les détails</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="glass flex flex-col items-center justify-center rounded-3xl py-20 text-center border border-white/10">
            <div className="p-4 bg-white/5 rounded-full mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">Aucune mission ne correspond à votre recherche</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6">
              Essayez de modifier votre mot-clé ou réinitialisez la catégorie pour voir toutes les offres.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Toutes les catégories');
              }}
              className="bg-primary hover:bg-primary/80 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/25"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
