'use client';

import React from 'react';
import { X, Loader2, CheckCircle, MessageSquare, Check } from 'lucide-react';
import { Job, EmployerApplication } from '@/types';
import api from '@/lib/api';

interface JobApplicantsModalProps {
  job: Job | null;
  isOpen: boolean;
  applications: EmployerApplication[];
  isLoading: boolean;
  onClose: () => void;
  onStartChat: (applicationId: string, candidateName: string) => void;
  onReject: (applicationId: string) => void;
  acceptLabel?: string;
  rejectLabel?: string;
}

export default function JobApplicantsModal({
  job,
  isOpen,
  applications,
  isLoading,
  onClose,
  onStartChat,
  onReject,
  acceptLabel = 'Accepter',
  rejectLabel = 'Refuser',
}: JobApplicantsModalProps) {
  if (!isOpen || !job) return null;

  const handleCheckout = async (applicationId: string) => {
    try {
      const res = await api.post(`/payments/checkout/${applicationId}`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      alert("Erreur lors de l'initiation du paiement");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold">Candidats pour "{job.title}"</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {applications.length} candidat(s) au total
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun candidat pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                >
                  <div>
                    <h4 className="font-bold text-lg">
                      {app.candidate.firstName} {app.candidate.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {app.candidate.email}
                    </p>
                    <div className="bg-black/30 p-3 rounded-lg text-sm italic text-gray-300">
                      "{app.message || "Je suis très intéressé par cette opportunité."}"
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {app.isAccepted || app.status === 'ACCEPTED' ? (
                      <>
                        <span className="hidden sm:inline-flex items-center gap-2 text-emerald-400 px-2 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" /> Accepté
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onStartChat(
                              app.id,
                              `${app.candidate.firstName} ${app.candidate.lastName}`,
                            )
                          }
                          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" /> Discuter
                        </button>
                      </>
                    ) : app.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-2 text-red-400 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-semibold">
                        <X className="w-4 h-4" /> Refusée
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCheckout(app.id)}
                          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> {acceptLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(app.id)}
                          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
                        >
                          <X className="w-4 h-4" /> {rejectLabel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
