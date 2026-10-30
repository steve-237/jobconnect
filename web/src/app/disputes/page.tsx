'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  MessageSquare,
  Scale,
  RefreshCw,
  Coins,
  User,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';
import { getStoredToken, decodeToken, isTokenExpired } from '@/lib/auth';
import NavigationHeader from '@/components/NavigationHeader';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Dispute {
  id: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  resolutionNotes?: string;
  defendantReply?: string;
  defendantProof: string[];
  createdAt: string;
  updatedAt: string;
  initiatorId?: string;
  defendantId?: string;
  job: {
    id: string;
    title: string;
    price: number;
    status: string;
  };
  initiator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  defendant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  OPEN: {
    label: 'Ouvert — En attente de réponse',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    desc: 'Le litige a été déposé. La partie adverse a la possibilité de répondre et apporter ses arguments.',
  },
  UNDER_REVIEW: {
    label: 'En cours d\'arbitrage par le Support',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    desc: 'Les deux parties ont formulé leurs explications. L\'administrateur examine les pièces pour rendre un verdict.',
  },
  RESOLVED_REFUND_EMPLOYER: {
    label: 'Résolu — Remboursement Employeur',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: 'Décision rendue : Les fonds sous séquestre ont été intégralement restitués à l\'employeur.',
  },
  RESOLVED_PAY_CANDIDATE: {
    label: 'Résolu — Paiement Libéré Prestataire',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: 'Décision rendue : Les fonds sous séquestre ont été versés au prestataire pour mission accomplie.',
  },
  RESOLVED_SPLIT: {
    label: 'Résolu — Médiation Partage 50/50',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    desc: 'Accord amiable d\'arbitrage : Les fonds ont été répartis équitablement entre les deux parties.',
  },
  DISMISSED: {
    label: 'Classé sans suite',
    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    desc: 'Le litige a été clôturé sans action financière suite à l\'absence d\'éléments probants.',
  },
};

const REASON_LABELS: Record<string, string> = {
  MISSION_INCOMPLETE: 'Mission non terminée ou abandonnée',
  NO_SHOW: 'Absence du prestataire / Pas de présentation',
  QUALITY_ISSUE: 'Travail non conforme ou mal exécuté',
  DAMAGE_CLAIM: 'Dégradation ou préjudice matériel',
  PAYMENT_DISPUTE: 'Désaccord sur le montant ou prestation hors contrat',
  OTHER: 'Autre motif grave',
};

export default function DisputesCenterPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [replyProof, setReplyProof] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}`, message, type, title }]);
  };

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/disputes/my-disputes');
      setDisputes(res.data);
      if (res.data.length > 0 && !selectedDispute) {
        setSelectedDispute(res.data[0]);
      } else if (selectedDispute) {
        const updated = res.data.find((d: Dispute) => d.id === selectedDispute.id);
        if (updated) setSelectedDispute(updated);
      }
    } catch (err) {
      console.error('Failed to fetch disputes', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    if (!token || isTokenExpired(token)) {
      router.replace('/login?redirect=/disputes');
      return;
    }
    const user = decodeToken(token);
    setCurrentUserId(user?.sub || user?.id || '');
    fetchDisputes();
  }, [router]);

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      await api.post(`/disputes/${selectedDispute.id}/respond`, {
        reply: replyText,
        evidenceUrls: replyProof.trim() ? [replyProof.trim()] : [],
      });
      addToast('Votre réponse a été enregistrée et transmise au support.', 'success', 'Réponse Envoyée');
      setReplyText('');
      setReplyProof('');
      await fetchDisputes();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Erreur lors de l\'envoi de la réponse', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavigationHeader />
      <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Breadcrumbs
            items={[
              { label: 'Tableau de bord', href: '/dashboard' },
              { label: 'Litiges & Séquestre' },
            ]}
            showBackButton
            backHref="/dashboard"
          />

          {/* Navigation & Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-red-500" />
                Centre de Résolution des Litiges & Arbitrage Séquestre
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Plateforme de médiation équitable JobConnect avec garantie de protection des paiements.
              </p>
            </div>

          <button
            onClick={fetchDisputes}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            Actualiser
          </button>
        </header>

        {disputes.length === 0 && !isLoading ? (
          <div className="glass rounded-3xl p-12 text-center border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Aucun dossier de litige en cours</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Toutes vos missions se déroulent normalement. En cas d&apos;imprévu sur une mission, vous pouvez déclarer un litige depuis votre tableau de bord.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: List of Disputes */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Vos Dossiers ({disputes.length})
              </h2>

              <div className="space-y-3">
                {disputes.map((d) => {
                  const statusInfo = STATUS_CONFIG[d.status] || STATUS_CONFIG.OPEN;
                  const isSelected = selectedDispute?.id === d.id;
                  const isInitiator = d.initiatorId === currentUserId;

                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDispute(d)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'glass border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10'
                          : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.color}`}>
                          {d.status === 'OPEN' ? 'Ouvert' : d.status.replace('RESOLVED_', '')}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
                        {d.job.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Motif : {REASON_LABELS[d.reason] || d.reason}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 text-muted-foreground">
                        <span>{isInitiator ? 'Déposé par vous' : `Déposé par ${d.initiator.firstName}`}</span>
                        <span className="font-bold text-white">{d.job.price} €</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Dispute Detail & Mediation Timeline */}
            {selectedDispute && (
              <div className="lg:col-span-8 space-y-6">
                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
                  {/* Status Banner */}
                  {(() => {
                    const statusInfo = STATUS_CONFIG[selectedDispute.status] || STATUS_CONFIG.OPEN;
                    return (
                      <div className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 ${statusInfo.color}`}>
                        <Scale className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold">{statusInfo.label}</h4>
                          <p className="text-xs mt-0.5 opacity-90">{statusInfo.desc}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {selectedDispute.job.title}
                      </h2>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Motif : <strong className="text-white">{REASON_LABELS[selectedDispute.reason] || selectedDispute.reason}</strong></span>
                        <span>•</span>
                        <span>Montant sous séquestre : <strong className="text-emerald-400 font-bold">{selectedDispute.job.price} €</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Parties involvement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Plaignant (Initiateur)
                      </span>
                      <p className="text-sm font-bold text-white">
                        {selectedDispute.initiator.firstName} {selectedDispute.initiator.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedDispute.initiator.email}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Partie Adverse (Défenseur)
                      </span>
                      <p className="text-sm font-bold text-white">
                        {selectedDispute.defendant.firstName} {selectedDispute.defendant.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedDispute.defendant.email}</p>
                    </div>
                  </div>

                  {/* Statements Timeline */}
                  <div className="space-y-6">
                    {/* 1. Initiator's complaint */}
                    <div className="relative pl-6 border-l-2 border-red-500/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-400">Signalement Initial</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(selectedDispute.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                        {selectedDispute.description}
                      </p>
                      {selectedDispute.evidenceUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedDispute.evidenceUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 text-xs hover:bg-red-500/20 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" /> Preuve #{idx + 1} <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Defendant's reply */}
                    {selectedDispute.defendantReply ? (
                      <div className="relative pl-6 border-l-2 border-blue-500/40 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-400">Réponse Contradictoire</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(selectedDispute.updatedAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                          {selectedDispute.defendantReply}
                        </p>
                        {selectedDispute.defendantProof.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {selectedDispute.defendantProof.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs hover:bg-blue-500/20 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" /> Preuve adverse #{idx + 1} <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : selectedDispute.defendantId === currentUserId && (selectedDispute.status === 'OPEN' || selectedDispute.status === 'UNDER_REVIEW') ? (
                      /* Response form for defendant */
                      <form onSubmit={handleSendResponse} className="relative pl-6 border-l-2 border-amber-500/40 space-y-3 pt-2">
                        <span className="text-xs font-bold text-amber-400 block">Votre Réponse Contradictoire</span>
                        <textarea
                          required
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Apportez votre version des faits et contestez si nécessaire les allégations..."
                          className="w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs sm:text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={replyProof}
                            onChange={(e) => setReplyProof(e.target.value)}
                            placeholder="Lien vers une photo ou document prouvant votre bonne foi (optionnel)"
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={isSendingReply}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {isSendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Envoyer ma réponse
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="relative pl-6 border-l-2 border-white/10 text-xs text-muted-foreground italic">
                        En attente de réponse de la partie adverse...
                      </div>
                    )}

                    {/* 3. Resolution Notes by Admin */}
                    {selectedDispute.resolutionNotes && (
                      <div className="relative pl-6 border-l-2 border-emerald-500/40 space-y-2 pt-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Scale className="w-4 h-4" /> Décision Arbitrale du Support JobConnect
                        </span>
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200">
                          {selectedDispute.resolutionNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  </div>
  );
}
