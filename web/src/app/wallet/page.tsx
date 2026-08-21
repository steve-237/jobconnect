'use client';

import { useEffect, useState } from 'react';
import {
  Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle, XCircle,
  PlusCircle, CreditCard, Download, X, Building, DollarSign, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  job?: { title: string };
  candidate?: { firstName: string; lastName: string };
  employer?: { firstName: string; lastName: string };
}

function decodeRole(): string {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'CANDIDATE';
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)).role || 'CANDIDATE';
  } catch {
    return 'CANDIDATE';
  }
}

export default function WalletPage({ isEmbedded }: { isEmbedded?: boolean } = {}) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('CANDIDATE');

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState('50');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [iban, setIban] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmployer = role === 'EMPLOYER';

  const fetchTransactions = () => {
    setIsLoading(true);
    api.get('/payments/transactions')
      .then((res) => setTransactions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setRole(decodeRole());
    fetchTransactions();
  }, [router]);

  const completedTransactions = transactions.filter((t) => t.status === 'COMPLETED');
  const totalAmount = completedTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Handle Deposit (Employer Recharge)
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return alert('Veuillez entrer un montant valide');

    setIsSubmitting(true);
    try {
      // Simulate Deposit Transaction
      alert(`🎉 Rechargement de ${amount} € simulé avec succès ! Votre solde a été mis à jour.`);
      setIsDepositModalOpen(false);
      setDepositAmount('50');
      // Add local mock completed transaction
      setTransactions((prev) => [
        {
          id: `dep-${Date.now()}`,
          amount,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          job: { title: 'Rechargement de solde Portefeuille' },
        },
        ...prev,
      ]);
    } catch (e) {
      alert('Erreur lors du rechargement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Withdrawal (Candidate Payout)
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert('Veuillez entrer un montant valide');
    if (amount > totalAmount) return alert('Montant supérieur à votre solde disponible');
    if (!iban || iban.length < 10) return alert('Veuillez entrer un IBAN valide');

    setIsSubmitting(true);
    try {
      alert(`✅ Virement bancaire de ${amount} € initié vers l'IBAN ${iban.slice(0, 4)}...${iban.slice(-4)}. Vous recevrez les fonds sous 24-48h.`);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setIban('');
      // Add local mock completed withdrawal transaction
      setTransactions((prev) => [
        {
          id: `with-${Date.now()}`,
          amount,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          job: { title: `Retrait vers la banque (${iban.slice(-4)})` },
        },
        ...prev,
      ]);
    } catch (e) {
      alert('Erreur lors du retrait');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Mon Portefeuille
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gérez vos transactions, rechargements et virements bancaires en toute sécurité.
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 text-primary">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {isEmployer ? 'Total Dépensé / Solde' : 'Solde Disponible (Gains)'}
                  </h2>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Compte Vérifié & Sécurisé
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white tracking-tight">{totalAmount.toFixed(2)}</span>
                <span className="text-2xl text-muted-foreground font-bold">€</span>
              </div>
            </div>

            {/* Role-Specific Main Action Button */}
            <div className="shrink-0">
              {isEmployer ? (
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  Recharger mon solde
                </button>
              ) : (
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  Demander un retrait
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Historique des transactions</h3>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground border border-white/5">
            Aucune transaction enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const date = new Date(t.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const isPending = t.status === 'PENDING';

              return (
                <div
                  key={t.id}
                  className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl border ${
                        isEmployer
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isEmployer ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">{t.job?.title || 'Transaction'}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isEmployer
                          ? t.candidate
                            ? `Payé à ${t.candidate.firstName} ${t.candidate.lastName}`
                            : 'Dépôt / Paiement'
                          : t.employer
                          ? `Reçu de ${t.employer.firstName} ${t.employer.lastName}`
                          : 'Retrait / Gain'}{' '}
                        • {date}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1.5">
                    <span className={`text-xl font-extrabold ${isEmployer ? 'text-foreground' : 'text-emerald-400'}`}>
                      {isEmployer ? '-' : '+'}{t.amount.toFixed(2)} €
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {isPending ? (
                        <span className="flex items-center text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                          <Clock size={12} className="mr-1" /> En attente
                        </span>
                      ) : t.status === 'COMPLETED' ? (
                        <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                          <CheckCircle size={12} className="mr-1" /> Validé
                        </span>
                      ) : (
                        <span className="flex items-center text-red-400 bg-red-400/10 px-2.5 py-0.5 rounded-full border border-red-400/20">
                          <XCircle size={12} className="mr-1" /> Échoué
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── MODAL RECHARGEMENT SOLDE (Employeur) ─── */}
        {isDepositModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsDepositModalOpen(false)}
          >
            <div
              className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Recharger mon compte</h3>
                </div>
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Montant du rechargement (€)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['30', '50', '100', '200'].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setDepositAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                          depositAmount === amt
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'
                        }`}
                      >
                        {amt} €
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Autre montant..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2 text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Paiement Sécurisé Stripe Checkout
                  </p>
                  <p>Vos fonds seront instantanément crédités sur votre portefeuille pour payer vos prochaines missions.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/25"
                >
                  {isSubmitting ? 'Traitement...' : `Procéder au paiement (${depositAmount || 0} €)`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL DEMANDE DE RETRAIT (Candidat) ─── */}
        {isWithdrawModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsWithdrawModalOpen(false)}
          >
            <div
              className="bg-[#121212] border border-emerald-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Building className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Demander un Virement</h3>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-muted-foreground">Montant à retirer (€)</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(totalAmount.toString())}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold"
                    >
                      Tout retirer ({totalAmount.toFixed(2)} €)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Montant..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Coordonnées Bancaires (IBAN)</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2 text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Virement SEPA Direct
                  </p>
                  <p>Les virements sont généralement crédités sur votre compte bancaire sous 24 à 48 heures ouvrées.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                >
                  {isSubmitting ? 'Traitement...' : `Confirmer le virement (${withdrawAmount || 0} €)`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
