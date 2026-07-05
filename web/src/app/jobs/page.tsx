'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

const mockJobs = [
  {
    id: 1,
    title: 'Déménagement Appartement',
    description:
      "Besoin d'aide pour déménager un appartement T3 au 2ème étage. Meubles lourds à transporter, cartons déjà prêts. Véhicule fourni, besoin de bras solides pour une demi-journée.",
    price: 120,
    location: 'Paris 11e',
    employer: 'Sophie Martin',
    postedDate: '2026-07-03',
    category: 'Déménagement',
  },
  {
    id: 2,
    title: 'Jardinage Weekend',
    description:
      'Entretien complet du jardin : tonte de la pelouse, taille des haies, désherbage des massifs et nettoyage de la terrasse. Outils disponibles sur place.',
    price: 85,
    location: 'Lyon 6e',
    employer: 'Marc Dubois',
    postedDate: '2026-07-02',
    category: 'Jardinage',
  },
  {
    id: 3,
    title: 'Aide au ménage',
    description:
      "Recherche une personne pour un grand ménage de printemps dans une maison de 120m². Nettoyage des sols, vitres, salle de bain et cuisine. Produits d'entretien fournis.",
    price: 65,
    location: 'Marseille 8e',
    employer: 'Claire Leroy',
    postedDate: '2026-07-01',
    category: 'Ménage',
  },
  {
    id: 4,
    title: 'Livraison colis',
    description:
      'Livraison de 15 colis dans le centre-ville. Véhicule personnel requis (type utilitaire). Tournée optimisée fournie, créneaux horaires flexibles entre 9h et 18h.',
    price: 95,
    location: 'Toulouse',
    employer: 'Antoine Bernard',
    postedDate: '2026-06-30',
    category: 'Livraison',
  },
  {
    id: 5,
    title: 'Montage meubles',
    description:
      "Montage de meubles IKEA : une armoire PAX, une bibliothèque BILLY et un bureau MALM. Tout le matériel est fourni, notice incluse. Estimation : environ 4 heures de travail.",
    price: 75,
    location: 'Bordeaux',
    employer: 'Julie Moreau',
    postedDate: '2026-06-29',
    category: 'Bricolage',
  },
  {
    id: 6,
    title: 'Cours particuliers',
    description:
      "Cours de mathématiques pour un élève de Terminale préparant le baccalauréat. 2 séances par semaine, niveau avancé. Expérience en enseignement souhaitée.",
    price: 35,
    location: 'Nantes',
    employer: 'Pierre Durand',
    postedDate: '2026-06-28',
    category: 'Éducation',
  },
];

const categories = [
  'Toutes les catégories',
  'Déménagement',
  'Jardinage',
  'Ménage',
  'Livraison',
  'Bricolage',
  'Éducation',
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return `Il y a ${diff} jours`;
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Toutes les catégories' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Browse{' '}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Jobs
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
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="relative sm:w-64">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>Triées par date</span>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="glass group relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Category Badge */}
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  {job.category}
                </span>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
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
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{job.employer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{daysAgo(job.postedDate)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/25 active:scale-[0.98]">
                  Voir les détails
                </button>
              </div>
            ))}
          </div>
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
          <button className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                page === 1
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'glass text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {page}
            </button>
          ))}

          <button className="glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground">
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
