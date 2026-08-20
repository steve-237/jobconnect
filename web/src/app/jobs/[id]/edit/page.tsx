'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin, DollarSign, AlignLeft, List, Loader2, Calendar, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    categoryId: '',
    scheduledDate: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    // Role check
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'CANDIDATE') {
          router.replace('/dashboard');
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    const loadData = async () => {
      try {
        const [catsRes, jobRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/jobs/${id}`)
        ]);
        
        setCategories(catsRes.data);
        const job = jobRes.data;
        
        let formattedDate = '';
        if (job.scheduledDate) {
          const d = new Date(job.scheduledDate);
          formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        }

        setFormData({
          title: job.title || '',
          description: job.description || '',
          price: job.price ? job.price.toString() : '',
          location: job.location || '',
          categoryId: job.categoryId || (catsRes.data.length > 0 ? catsRes.data[0].id : ''),
          scheduledDate: formattedDate,
          estimatedDuration: job.estimatedDuration ? job.estimatedDuration.toString() : '',
        });
      } catch (err) {
        console.error('Failed to load data', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setIsFetchingData(false);
      }
    };
    
    if (id) {
      loadData();
    }
  }, [router, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.patch(`/jobs/${id}`, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        categoryId: formData.categoryId,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update job. Make sure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="glass rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="mb-10 text-center sm:text-left relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Modifier <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">l'annonce</span>
            </h1>
            <p className="text-muted-foreground">Mettez à jour les informations de votre mission.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 relative z-10">
              {error}
            </div>
          )}

          {isFetchingData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                <div className="relative">
                  <List className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-white/10 bg-[#111] pl-12 pr-4 py-3.5 text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#111] text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-muted-foreground mb-2">Budget (€)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="1"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Scheduled Date */}
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-muted-foreground mb-2">Date (Optionnel)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Estimated Duration */}
                <div>
                  <label htmlFor="estimatedDuration" className="block text-sm font-medium text-muted-foreground mb-2">Durée estimée (minutes)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      id="estimatedDuration"
                      name="estimatedDuration"
                      min="15"
                      step="15"
                      value={formData.estimatedDuration}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">Detailed Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
