'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  MapPin,
  Clock,
  User,
  Briefcase,
  Sparkles,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { Job } from '@/types';
import { formatPrice } from '@/lib/currency';

interface CandidateJobApplyModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
  addToast: (
    message: string,
    type: 'success' | 'error' | 'info',
    title?: string,
  ) => void;
}

export default function CandidateJobApplyModal({
  jobId,
  isOpen,
  onClose,
  onApplied,
  addToast,
}: CandidateJobApplyModalProps) {
  const [jobDetail, setJobDetail] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAiGeneratingPitch, setIsAiGeneratingPitch] = useState(false);

  useEffect(() => {
    if (!jobId || !isOpen) return;

    const fetchDetail = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [jobId, isOpen]);

  if (!isOpen || !jobId) return null;

  const handleAiGeneratePitch = async () => {
    if (!jobDetail) return;
    setIsAiGeneratingPitch(true);
    try {
      const res = await api.post('/ai/generate-pitch', {
        jobTitle: jobDetail.title,
        jobDescription: jobDetail.description || '',
      });
      if (res.data?.pitch) {
        setApplyMessage(res.data.pitch);
        addToast(
          "Pitch de candidature généré par l'IA avec succès !",
          'success',
          'Assistant IA 🤖',
        );
      }
    } catch (e: any) {
      console.error('AI Pitch error', e);
      addToast('Échec de la génération du pitch IA', 'error');
    } finally {
      setIsAiGeneratingPitch(false);
    }
  };

  const handleApply = async () => {
    if (!jobDetail) return;
    setIsApplying(true);
    try {
      await api.post('/applications', {
        jobId: jobDetail.id,
        message: applyMessage,
      });
      setHasApplied(true);
      addToast(
        'Candidature envoyée avec succès !',
        'success',
        'Candidature enregistrée',
      );
      onApplied();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setHasApplied(true);
        addToast('Vous avez déjà postulé à cette mission.', 'info');
      } else {
        addToast(
          err.response?.data?.message || 'Erreur lors de la candidature',
          'error',
        );
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {jobDetail?.category?.name || 'Mission Ponctuelle'}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {jobDetail?.estimatedDuration
                  ? `${jobDetail.estimatedDuration} min`
                  : 'Flexible'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {jobDetail?.title || 'Chargement des détails...'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 relative z-10 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Chargement des détails de la mission...
              </p>
            </div>
          ) : jobDetail ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-lg">
                    <Coins className="w-4 h-4 shrink-0" />
                    <span>{formatPrice(jobDetail.price)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    Rémunération
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">
                      {jobDetail.location || 'Remote'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    Localisation
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">
                      {jobDetail.employer?.firstName}{' '}
                      {jobDetail.employer?.lastName?.[0]}.
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    Employeur
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {new Date(jobDetail.createdAt).toLocaleDateString(
                        'fr-FR',
                        { day: 'numeric', month: 'short' },
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    Publication
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Description de la mission
                </h4>
                <div className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-2xl border border-white/5 font-normal">
                  {jobDetail.description}
                </div>
              </div>

              {/* Apply Section */}
              <div className="border-t border-white/10 pt-6">
                {hasApplied ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-2xl font-bold border border-emerald-500/30 text-sm">
                    <CheckCircle className="w-5 h-5" />
                    Candidature envoyée avec succès !
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted-foreground block">
                        Message à l'employeur (optionnel)
                      </label>
                      <button
                        type="button"
                        onClick={handleAiGeneratePitch}
                        disabled={isAiGeneratingPitch}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-xl border border-primary/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        {isAiGeneratingPitch
                          ? 'Rédaction...'
                          : "Rédiger avec l'IA 🤖"}
                      </button>
                    </div>
                    <textarea
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="Présentez brièvement vos compétences pour cette mission..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors resize-none mb-4"
                    />
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={isApplying}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary/25 disabled:opacity-50 cursor-pointer"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Envoi en
                          cours...
                        </>
                      ) : (
                        'Postuler pour cette mission'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Impossible de charger les détails de cette mission.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
