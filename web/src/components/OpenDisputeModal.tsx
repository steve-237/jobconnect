'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  Loader2,
  FileText,
  ShieldAlert,
  Info,
  Upload,
} from 'lucide-react';
import api from '@/lib/api';

interface OpenDisputeModalProps {
  job: {
    id: string;
    title: string;
    price: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

const DISPUTE_REASONS = [
  { value: 'MISSION_INCOMPLETE', label: 'Mission non terminée ou abandonnée' },
  { value: 'NO_SHOW', label: 'Absence du prestataire / Pas de présentation' },
  { value: 'QUALITY_ISSUE', label: 'Travail non conforme ou mal exécuté' },
  { value: 'DAMAGE_CLAIM', label: 'Dégradation ou préjudice matériel' },
  { value: 'PAYMENT_DISPUTE', label: 'Désaccord sur le montant ou prestations hors contrat' },
  { value: 'OTHER', label: 'Autre motif grave' },
];

export default function OpenDisputeModal({
  job,
  isOpen,
  onClose,
  onSuccess,
  addToast,
}: OpenDisputeModalProps) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0].value);
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceList, setEvidenceList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvidenceList((prev) => [...prev, res.data.url]);
      addToast('Fichier justificatif téléversé avec succès', 'success', 'Preuve Ajoutée');
    } catch (err: any) {
      console.error('Evidence upload error', err);
      addToast(err.response?.data?.message || 'Erreur lors du téléversement du fichier', 'error');
    } finally {
      setIsUploadingEvidence(false);
      e.target.value = '';
    }
  };

  const handleAddEvidence = () => {
    if (evidenceUrl.trim()) {
      setEvidenceList((prev) => [...prev, evidenceUrl.trim()]);
      setEvidenceUrl('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 20) {
      addToast('Veuillez détailler le motif du litige (minimum 20 caractères)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/disputes', {
        jobId: job.id,
        reason,
        description,
        evidenceUrls: evidenceList,
      });

      addToast(
        'Dossier de litige ouvert. Le séquestre est gelé pendant l\'examen.',
        'success',
        'Litige Déclaré 🛡️'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to open dispute', err);
      addToast(
        err.response?.data?.message || 'Erreur lors de l\'ouverture du litige',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-red-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Centre de Résolution des Litiges</h2>
              <p className="text-xs text-muted-foreground">Mission : <span className="text-white font-medium">{job.title}</span> ({job.price} €)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection Banner */}
        <div className="my-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Garantie Protection JobConnect :</strong> Dès l&apos;ouverture d&apos;un litige, le paiement sous séquestre ({job.price} €) est immédiatement bloqué en sécurité jusqu&apos;à médiation ou décision arbitrale.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Motif principal du signalement
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-900 text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Explication détaillée & chronologie
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez précisément ce qui s'est passé, les horaires, et pourquoi la prestation pose problème..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Pièces justificatives ou liens photos (optionnel)
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://exemple.com/photo-preuve.jpg"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Ajouter URL
              </button>
              <label className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                {isUploadingEvidence ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Téléverser fichier</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploadingEvidence}
                  className="hidden"
                />
              </label>
            </div>

            {evidenceList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {evidenceList.map((url, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 text-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Preuve #{i + 1}
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(i)}
                      className="hover:text-red-100 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transmission...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ouvrir le litige officiel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
