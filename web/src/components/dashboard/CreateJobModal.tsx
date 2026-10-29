'use client';

import React, { useState } from 'react';
import {
  Plus,
  X,
  Sparkles,
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
import { Category } from '@/types';
import { getSelectedCurrency } from '@/lib/currency';

interface CreateJobModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => Promise<void>;
  addToast: (
    message: string,
    type: 'success' | 'error' | 'info',
    title?: string,
  ) => void;
}

export default function CreateJobModal({
  isOpen,
  categories,
  onClose,
  onSuccess,
  addToast,
}: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    categoryId: '',
    scheduledDate: '',
    estimatedDuration: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-job', {
        prompt: aiPrompt,
        userLocation: formData.location || undefined,
      });
      const data = res.data;
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        price: data.recommendedPrice
          ? data.recommendedPrice.toString()
          : prev.price,
        categoryId: data.categoryId || prev.categoryId,
        estimatedDuration: data.estimatedDuration
          ? (data.estimatedDuration * 60).toString()
          : prev.estimatedDuration,
      }));
      setAiExplanation(data.explanation || '');
      addToast(
        "Annonce générée par l'IA avec succès !",
        'success',
        'Assistant IA ✨',
      );
    } catch (e: any) {
      console.error('AI Generation error', e);
      addToast(
        e.response?.data?.message || "Erreur lors de la génération de l'annonce",
        'error',
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAiEstimatePrice = async () => {
    if (!formData.title && !formData.description) {
      addToast(
        "Veuillez d'abord saisir un titre ou une description",
        'error',
      );
      return;
    }
    setIsAiEstimating(true);
    try {
      const res = await api.post('/ai/estimate-price', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
      });
      const data = res.data;
      if (data.recommendedPrice) {
        setFormData((prev) => ({
          ...prev,
          price: data.recommendedPrice.toString(),
        }));
        setAiExplanation(data.explanation || '');
        addToast(
          `Prix réajusté à ${data.recommendedPrice} € d'après le marché !`,
          'success',
          'Estimation IA 💡',
        );
      }
    } catch (e: any) {
      console.error('AI Estimation error', e);
      addToast("Échec de l'estimation IA", 'error');
    } finally {
      setIsAiEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const catId =
        formData.categoryId || (categories.length > 0 ? categories[0].id : '');

      await api.post('/jobs', {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        categoryId: catId,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate).toISOString()
          : undefined,
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration, 10)
          : undefined,
      });

      addToast('Annonce publiée avec succès ! 🎉', 'success');
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        categoryId: '',
        scheduledDate: '',
        estimatedDuration: '',
      });
      setAiPrompt('');
      setAiExplanation('');
      onClose();
      await onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'annonce",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center pb-5 mb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Publier une annonce
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remplissez les détails ci-dessous pour trouver le bon prestataire
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
          {/* AI Assistant Banner */}
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 border border-amber-500/30">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Générateur d'Annonce IA ✨
                </span>
              </div>
              {aiExplanation && (
                <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {aiExplanation}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Décrivez votre besoin en 1 phrase (ex: Déménagement 5 cartons à Paris)..."
                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500 font-medium"
              />
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isAiGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Générer
                  </>
                )}
              </button>
            </div>
          </div>

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
                    placeholder="ex: Déménagement appartement 3 pièces"
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-muted-foreground">
                      Budget ({getSelectedCurrency().symbol})
                    </label>
                    <button
                      type="button"
                      onClick={handleAiEstimatePrice}
                      disabled={isAiEstimating}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {isAiEstimating ? 'Calcul...' : 'Estimer 💡'}
                    </button>
                  </div>
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
                      placeholder="150"
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
                      placeholder="Paris 11e"
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
                      placeholder="120 min"
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
                    className="w-full flex-1 min-h-[145px] rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed font-normal"
                    placeholder="Décrivez précisément la mission, le matériel nécessaire et les consignes particulières..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Publier l'annonce maintenant"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
