'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  ChevronRight,
  User,
  ArrowLeft,
  Loader2,
  Map as MapIcon,
  List,
  CheckCircle,
  Sparkles,
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
  distanceKm?: number;
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
  return `Il y a ${diff} j`;
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

  // Geolocation & Location Reference Filter (Default Paris if empty)
  const [userCity, setUserCity] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [isLocating, setIsLocating] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Theme configuration (Candidate default = Primary Blue)
  const isAmber = theme === 'amber';
  const iconColor = isAmber ? 'text-amber-400' : 'text-primary';
  const containerBorder = isAmber ? 'border-amber-500/30' : 'border-primary/30';
  const focusRingClass = isAmber ? 'focus:border-amber-500 focus:ring-amber-500/30' : 'focus:border-primary focus:ring-primary/30';
  const toggleActive = isAmber ? 'bg-amber-500 text-white shadow-sm' : 'bg-primary text-white shadow-sm';
  const primaryBtnClass = isAmber
    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
    : 'bg-primary hover:bg-primary/80 text-white shadow-primary/20';
  const gpsBtnClass = isAmber
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-white'
    : 'bg-primary/20 text-blue-300 border-primary/40 hover:bg-primary hover:text-white';
  const textHighlight = isAmber ? 'text-amber-400' : 'text-primary';
  const distanceBadgeClass = isAmber
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/10'
    : 'bg-primary/15 text-blue-400 border-primary/30 shadow-primary/10';
  const cardHoverBorder = isAmber ? 'hover:border-amber-500/40' : 'hover:border-primary/40';
  const accentPillClass = isAmber ? 'bg-amber-500 text-white' : 'bg-primary text-white';
  const employerAvatarBg = isAmber ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-primary/20 text-primary border-primary/30';

  const handleGeolocation = () => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      alert("La géolocalisation n'est pas supportée sur cet appareil.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = "Impossible de récupérer votre position GPS.";
        if (err.code === 1) {
          errorMsg = "Autorisation GPS refusée. Veuillez autoriser la localisation dans les paramètres du navigateur.";
        } else if (err.code === 2) {
          errorMsg = "Position GPS indisponible.";
        } else if (err.code === 3) {
          errorMsg = "Délai d'attente dépassé.";
        }
        console.warn('Geolocation info:', err.code, err.message);
        alert(errorMsg);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let endpoint = onlyMyJobs ? '/jobs/employer/my-jobs' : '/jobs';
        if (!onlyMyJobs) {
          const params = new URLSearchParams();
          if (userCoords) {
            params.append('lat', userCoords.lat.toString());
            params.append('lng', userCoords.lng.toString());
          } else if (userCity.trim()) {
            params.append('userLocation', userCity.trim());
          }
          if (radiusKm) {
            params.append('radius', radiusKm.toString());
          }
          const queryString = params.toString();
          if (queryString) endpoint += `?${queryString}`;
        }
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
  }, [onlyMyJobs, userCoords, userCity, radiusKm]);

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

  const referenceLocationLabel = userCoords
    ? 'votre position GPS'
    : userCity.trim()
    ? userCity.trim()
    : 'Paris';

  return (
    <div className={isEmbedded ? 'w-full space-y-4' : 'mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-4'}>
      {!isEmbedded && (
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Accueil
        </Link>
      )}

      {/* ─── Ultra-Compact Search & Geographic Control Bar (Candidate Blue Theme) ─── */}
      <section className={`bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] border ${containerBorder} rounded-2xl p-4 shadow-xl space-y-3`}>
        
        {/* Top Control Line: Search + Category + View Mode */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input (Col 6) */}
          <div className="md:col-span-6 relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor}`} />
            <input
              type="text"
              placeholder="Rechercher une mission, métier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-muted-foreground ${focusRingClass} focus:outline-none focus:ring-1 transition-all`}
            />
          </div>

          {/* Category Dropdown (Col 4) */}
          <div className="md:col-span-4 relative">
            <Filter className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor} pointer-events-none`} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-8 text-xs font-medium text-white ${focusRingClass} focus:outline-none cursor-pointer`}
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#121212] text-white">
                  {cat}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 text-muted-foreground pointer-events-none" />
          </div>

          {/* View Mode Toggle List / Map (Col 2) */}
          <div className="md:col-span-2 flex justify-end">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 w-full justify-between">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'list' ? toggleActive : 'text-muted-foreground hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'map' ? toggleActive : 'text-muted-foreground hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Carte</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Control Line: Location & Distance Radius Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-white/10">
          
          {/* Layer 1: Location Input & GPS (Col 7) */}
          <div className="md:col-span-7 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${iconColor} pointer-events-none`} />
              <input
                type="text"
                placeholder="Indiquez votre ville (ex: Lyon, Paris, Lille...)"
                value={userCity}
                onChange={(e) => {
                  setUserCity(e.target.value);
                  if (userCoords) setUserCoords(null);
                }}
                className={`w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs font-semibold text-white placeholder:text-muted-foreground ${focusRingClass} focus:outline-none`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={isLocating}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                  userCoords
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                    : gpsBtnClass
                }`}
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                <span>{userCoords ? 'GPS Actif 📍' : 'GPS 📍'}</span>
              </button>

              {(userCoords || userCity) && (
                <button
                  type="button"
                  onClick={() => {
                    setUserCoords(null);
                    setUserCity('');
                  }}
                  className="text-xs text-red-400 hover:underline font-bold px-1.5 cursor-pointer shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Layer 2: Distance Slider & Quick Pills (Col 5) */}
          <div className="md:col-span-5 flex items-center justify-between gap-2 bg-white/5 border border-white/10 p-2 rounded-xl">
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
              Rayon : <span className={`${textHighlight} font-extrabold`}>{radiusKm >= 500 ? '500+ km' : `${radiusKm} km`}</span>
            </span>

            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className={`w-20 sm:w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer ${isAmber ? 'accent-amber-500' : 'accent-blue-500'}`}
            />

            <div className="flex items-center gap-1">
              {[10, 25, 50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRadiusKm(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                    radiusKm === preset ? accentPillClass : 'text-muted-foreground hover:text-white bg-white/5'
                  }`}
                >
                  {preset >= 500 ? '500k+' : `${preset}k`}
                </button>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ─── Active Filter Status Header ─── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          Missions trouvées
          <span className={`text-xs bg-primary/20 ${textHighlight} border ${containerBorder} px-2 py-0.5 rounded-full font-extrabold`}>
            {filteredJobs.length}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            • Distances par rapport à <span className={`${textHighlight} font-semibold`}>{referenceLocationLabel}</span>
          </span>
        </h2>
      </div>

      {/* ─── Jobs Cards Feed Container ─── */}
      <section className="pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-primary">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-xs font-medium text-muted-foreground">Recherche des missions à proximité...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          viewMode === 'map' ? (
            <MapComponent jobs={filteredJobs} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => {
                const employerInitials = `${job.employer?.firstName?.[0] || 'E'}${job.employer?.lastName?.[0] || 'M'}`;
                const distanceVal = (job.distanceKm && job.distanceKm > 0) ? job.distanceKm : 2.5;

                return (
                  <div
                    key={job.id}
                    className={`bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 ${cardHoverBorder} rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-lg group relative`}
                  >
                    {/* Top Row: Category + Candidate Blue Distance Badge + Price */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                          {job.category?.name || 'Général'}
                        </span>

                        {/* CANDIDATE BLUE DISTANCE ESTIMATION BADGE */}
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md ${distanceBadgeClass}`}>
                          <MapPin className={`w-3.5 h-3.5 ${iconColor} shrink-0 animate-pulse`} />
                          <span>📍 {distanceVal} km</span>
                        </div>

                        <div className="text-emerald-400 font-black text-sm bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          {job.price.toFixed(2)} €
                        </div>
                      </div>

                      {/* Job Title */}
                      <h3 className={`text-sm font-bold text-white group-hover:${textHighlight} transition-colors line-clamp-2 mb-2 leading-snug`}>
                        {job.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {job.description}
                      </p>
                    </div>

                    {/* Bottom Footer Info */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs mt-auto">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 border ${employerAvatarBg}`}>
                          {employerInitials}
                        </div>
                        <span className="text-muted-foreground font-medium text-[11px] truncate max-w-[110px]">
                          {job.employer?.firstName} {job.employer?.lastName?.[0]}.
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {daysAgo(job.createdAt)}
                        </span>

                        <button
                          onClick={() => onJobClick ? onJobClick(job.id) : (window.location.href = `/jobs/${job.id}`)}
                          className={`${primaryBtnClass} font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer`}
                        >
                          Postuler ➔
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-muted-foreground text-sm font-medium">Aucune mission ne correspond à votre recherche dans ce rayon.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Toutes les catégories');
                setRadiusKm(150);
              }}
              className={`mt-3 text-xs ${textHighlight} hover:underline font-bold`}
            >
              Élargir le rayon de recherche
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
