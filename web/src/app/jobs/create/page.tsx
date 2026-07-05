'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin, DollarSign, AlignLeft, List, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCats, setIsFetchingCats] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    categoryId: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: response.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/jobs', {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        categoryId: formData.categoryId,
      });
      router.push('/jobs'); // Redirect to jobs list after successful creation
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create job. Make sure you are logged in.');
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
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="mb-10 text-center sm:text-left relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Post a new <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Job</span>
            </h1>
            <p className="text-muted-foreground">Fill out the details below to find the perfect candidate for your task.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 relative z-10">
              {error}
            </div>
          )}

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
                  placeholder="e.g. Need help moving an apartment"
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
                  disabled={isFetchingCats}
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                >
                  {isFetchingCats ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-card text-foreground">
                        {cat.name}
                      </option>
                    ))
                  )}
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
                    placeholder="e.g. 50"
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
                    placeholder="e.g. Paris 11e"
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
                  placeholder="Describe the task, requirements, and any other relevant details..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isFetchingCats}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publishing Job...
                </>
              ) : (
                'Publish Job'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
