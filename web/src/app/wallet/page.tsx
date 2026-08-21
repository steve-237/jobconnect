'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  job: { title: string };
  candidate?: { firstName: string, lastName: string };
  employer?: { firstName: string, lastName: string };
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setRole(decodeRole());

    api.get('/payments/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [router]);

  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  const totalAmount = completedTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const isEmployer = role === 'EMPLOYER';

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Mon Portefeuille</h1>
            <p className="text-muted-foreground mt-2">Gérez vos transactions et paiements.</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass rounded-2xl p-8 mb-8 relative overflow-hidden border border-white/10 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{isEmployer ? 'Total Dépensé' : 'Total Gagné'}</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{totalAmount.toFixed(2)}</span>
            <span className="text-2xl text-muted-foreground">€</span>
          </div>
        </div>

        {/* Transactions List */}
        <h3 className="text-xl font-semibold mb-6">Historique des transactions</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            Aucune transaction pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(t => {
              const date = new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
              const isPending = t.status === 'PENDING';
              
              return (
                <div key={t.id} className="glass rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-transform hover:scale-[1.01]">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isEmployer ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {isEmployer ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{t.job.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {isEmployer ? `Payé à ${t.candidate?.firstName} ${t.candidate?.lastName}` : `Reçu de ${t.employer?.firstName} ${t.employer?.lastName}`} • {date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-bold">
                      {isEmployer ? '-' : '+'}{t.amount.toFixed(2)} €
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {isPending ? (
                        <span className="flex items-center text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md"><Clock size={12} className="mr-1" /> En attente</span>
                      ) : t.status === 'COMPLETED' ? (
                        <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md"><CheckCircle size={12} className="mr-1" /> Complété</span>
                      ) : (
                        <span className="flex items-center text-red-400 bg-red-400/10 px-2 py-1 rounded-md"><XCircle size={12} className="mr-1" /> Échoué</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
