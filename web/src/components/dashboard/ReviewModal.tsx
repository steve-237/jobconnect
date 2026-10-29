'use client';

import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';

interface ReviewModalProps {
  job: { id: string; title: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobId: string, rating: number, comment: string) => Promise<void>;
}

export default function ReviewModal({
  job,
  isOpen,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(job.id, rating, comment);
      setComment('');
      setRating(5);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-lg font-bold text-white">Évaluer le candidat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            Comment s'est passée la mission{' '}
            <span className="text-white font-semibold">"{job.title}"</span> ?
          </p>
          <div className="flex gap-2 justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-xl transition-all ${
                  rating >= star
                    ? 'text-amber-400 scale-110'
                    : 'text-white/20 hover:text-white/40'
                }`}
              >
                <Star className="w-7 h-7 fill-current" />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Laissez un commentaire sur le travail effectué..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-amber-500/50 focus:outline-none resize-none mb-5"
          />
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Publier l'avis"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
