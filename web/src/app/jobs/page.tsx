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
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false, loading: () => <div className="w-full h-[600px] rounded-xl glass animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div> });

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
  const badgeColor = isAmber ? 'bg-amber-500/15 text-amber-400' : 'bg-primary/15 text-primary';
  const headerGradient = isAmber ? 'from-amber-500/10 via-transparent to-amber-500/5' : 'from-primary/10 via-transparent to-purple-500/5';
  const titleGradient = isAmber ? 'from-amber-400 to-amber-500' : 'from-primary to-blue-400';
  const hoverBorder = isAmber ? 'hover:border-amber-500/40 hover:shadow-amber-500/10' : 'hover:border-primary/40 hover:shadow-primary/10';
  const titleHover = isAmber ? 'group-hover:text-amber-400' : 'group-hover:text-primary';
  const actionBtnClass = isAmber
    ? 'block text-center w-full rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-all duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/25 active:scale-[0.98]'
    : 'block text-center w-full rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/25 active:scale-[0.98]';
  const viewToggleActive = isAmber ? 'bg-amber-500 text-white shadow-sm' : 'bg-primary text-white shadow-sm';
  const paginationActive = isAmber ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'bg-primary text-white shadow-md shadow-primary/25';
  const focusRing = isAmber ? 'focus:border-amber-500/50 focus:ring-amber-500/50' : 'focus:border-primary/50 focus:ring-primary/50';
  const loaderColor = isAmber ? 'text-amber-500' : 'text-primary';

  const allCategories = ['Toutes les catégories', ...(Array.isArray(categories) ? categories.map(c => c.name) : [])];

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
    <div className={isEmbedded ? "w-full" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}>
      {!isEmbedded && (
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      )}

      {/* Header Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className={`absolute inset-0 bg-gradient-to-br ${headerGradient}`} />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Explorer les{' '}
              <span className={`bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
                Missions
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Découvrez les missions disponibles près de chez vous et postulez en quelques clics.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une mission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground ${focusRing} focus:outline-none focus:ring-1 transition-colors`}
              />
            </div>

            {/* Category Filter */}
            <div className="relative sm:w-64">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-foreground ${focusRing} focus:outline-none focus:ring-1 transition-colors cursor-pointer`}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-card text-foreground">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Results Info */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredJobs.length}</span>{' '}
            mission{filteredJobs.length > 1 ? 's' : ''} disponible{filteredJobs.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* View Toggle */}
            <div className="flex items-center glass rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'list' ? viewToggleActive : 'hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md flex items-center gap-2 transition-all ${viewMode === 'map' ? viewToggleActive : 'hover:text-foreground'}`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Carte</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className={`flex flex-col items-center justify-center py-20 ${loaderColor}`}>
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Chargement des missions...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          viewMode === 'map' ? (
            <MapComponent jobs={filteredJobs} />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`glass group relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${hoverBorder}`}
                >
                  {/* Category Badge */}
                  <span className={`mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${badgeColor}`}>
                    {job.category?.name || 'Non catégorisé'}
                  </span>

                  {/* Title */}
                  <h3 className={`mb-2 text-lg font-semibold text-foreground ${titleHover} transition-colors`}>
                    {job.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {job.description}
                  </p>

                  {/* Details */}
                  <div className="mb-5 mt-auto space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">{job.price} €</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="flex items-center gap-1" title={job.employer?.isVerified ? "Profil Vérifié" : undefined}>
                        {job.employer?.firstName} {job.employer?.lastName}
                        {job.employer?.isVerified && (
                          <CheckCircle className="h-3 w-3 text-blue-500 fill-blue-500/20" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{daysAgo(job.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isEmbedded && onJobClick ? (
                    <button onClick={() => onJobClick(job.id)} className={actionBtnClass}>
                      Voir les détails
                    </button>
                  ) : (
                    <Link href={`/jobs/${job.id}`} className={actionBtnClass}>
                      Voir les détails
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="glass flex flex-col items-center justify-center rounded-2xl py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">Aucune mission trouvée</h3>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </section>

      {/* Pagination */}
      <section className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
          <button className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-white/20 hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                page === 1
                  ? paginationActive
                  : 'glass text-muted-foreground hover:border-white/20 hover:text-foreground'
              }`}
            >
              {page}
            </button>
          ))}

          <button className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-white/20 hover:text-foreground">
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
