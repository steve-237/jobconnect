'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit3,
  X,
  Briefcase,
  List,
  Coins,
  MapPin,
  Calendar,
  Clock,
  AlignLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { Job, Category } from '@/types';
import { getSelectedCurrency } from '@/lib/currency';

interface EditJobModalProps {
  job: Job | null;
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => Promise<void>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function EditJobModal({
  job,
  isOpen,
  categories,
  onClose,
  onSuccess,
  addToast,
}: EditJobModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    categoryId: '',
    scheduledDate: '',
    estimatedDuration: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!job) return;

    const loadDetails = async () => {
      try {
        const res = await api.get(`/jobs/${job.id}`);
        const fullJob = res.data;
        let formattedDate = '';
        if (fullJob.scheduledDate) {
          const d = new Date(fullJob.scheduledDate);
          formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        }
        setFormData({
          title: fullJob.title || '',
          description: fullJob.description || '',
          price: fullJob.price ? fullJob.price.toString() : '',
          location: fullJob.location || '',
          categoryId:
            fullJob.categoryId || (categories.length > 0 ? categories[0].id : ''),
          scheduledDate: formattedDate,
          estimatedDuration: fullJob.estimatedDuration
            ? fullJob.estimatedDuration.toString()
            : '',
        });
      } catch (e) {
        console.error('Failed to load job details', e);
      }
    };

    loadDetails();
  }, [job, categories]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      await api.patch(`/jobs/${job.id}`, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        categoryId: formData.categoryId,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate).toISOString()
          : null,
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration, 10)
          : null,
      });
      addToast('Annonce modifiée avec succès !', 'success');
      onClose();
      await onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center pb-5 mb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Modifier l'annonce
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mettez à jour les détails de votre offre de mission
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="relative z-10">
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Left Column */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Titre de l'annonce
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Catégorie
                </label>
                <div className="relative">
                  <List className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#141414] pl-10 pr-8 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        className="bg-[#141414] text-white"
                      >
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
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Localisation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Date prévue
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledDate: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-2 py-2 text-[11px] text-foreground focus:border-amber-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Durée (min)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={formData.estimatedDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedDuration: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col justify-between space-y-3.5">
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Description détaillée
                </label>
                <div className="relative flex-1 flex flex-col">
                  <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full flex-1 min-h-[145px] rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed font-normal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
