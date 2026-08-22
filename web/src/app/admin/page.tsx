'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  Activity,
  Shield,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  UserCheck,
  Building,
  User,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { NotificationToast, ConfirmModal, ToastMessage, ConfirmDialog } from '@/components/NotificationToast';

function decodeUserFromToken(): { email: string; role?: string } | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return { email: decoded.email ?? '', role: decoded.role };
  } catch {
    return null;
  }
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  kycStatus?: string;
  isVerified?: boolean;
  bio?: string;
  createdAt?: string;
}

interface AdminStats {
  totalUsers: number;
  candidatesCount: number;
  employersCount: number;
  totalJobs: number;
  completedJobs: number;
  pendingKycCount: number;
  totalVolume: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'kyc' | 'users'>('kyc');

  // Stats
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    candidatesCount: 0,
    employersCount: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingKycCount: 0,
    totalVolume: 0,
  });

  // Data lists
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [pendingKycList, setPendingKycList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toasts & Confirm Modals
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, kycRes, statsRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/admin/kyc/pending'),
        api.get('/users/admin/stats'),
      ]);

      setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPendingKycList(Array.isArray(kycRes.data) ? kycRes.data : []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const user = decodeUserFromToken();
    if (user?.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    setReady(true);
    fetchAdminData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  // Approve KYC Handler
  const handleApproveKyc = (user: UserData) => {
    setConfirmDialog({
      title: 'Approuver la vérification KYC ?',
      message: `Voulez-vous accorder le badge de vérification 🔵 à ${user.firstName} ${user.lastName} (${user.email}) ?`,
      type: 'primary',
      confirmText: 'Approuver',
      onConfirm: async () => {
        try {
          await api.patch(`/users/admin/kyc/${user.id}/approve`);
          addToast(`Profil de ${user.firstName} vérifié avec succès !`, 'success', 'KYC Approuvé');
          fetchAdminData();
        } catch (err: any) {
          addToast(err.response?.data?.message || 'Erreur lors de l\'approbation KYC', 'error');
        }
      },
    });
  };

  // Reject KYC Handler
  const handleRejectKyc = (user: UserData) => {
    setConfirmDialog({
      title: 'Rejeter la vérification KYC ?',
      message: `Voulez-vous refuser la demande de vérification de ${user.firstName} ${user.lastName} ?`,
      type: 'danger',
      confirmText: 'Rejeter',
      onConfirm: async () => {
        try {
          await api.patch(`/users/admin/kyc/${user.id}/reject`);
          addToast(`Demande KYC de ${user.firstName} rejetée.`, 'info');
          fetchAdminData();
        } catch (err: any) {
          addToast(err.response?.data?.message || 'Erreur lors du rejet KYC', 'error');
        }
      },
    });
  };

  // Delete User Handler
  const handleDeleteUser = (userId: string, name: string) => {
    setConfirmDialog({
      title: 'Supprimer l\'utilisateur ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${name} ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${userId}`);
          setUsersList((prev) => prev.filter((u) => u.id !== userId));
          addToast(`Compte de ${name} supprimé avec succès.`, 'info');
        } catch (err: any) {
          addToast(err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur.', 'error');
        }
      },
    });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const roleBadge = (role: string) => {
    if (role === 'ADMIN') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (role === 'EMPLOYER') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 relative">
      <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      {confirmDialog && <ConfirmModal dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />}

      <div className="mx-auto max-w-7xl">
        {/* Header Bar */}
        <header className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Retour au site
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              Panneau d'Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
              Actualiser
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </header>

        {/* Global KPIs Stats Grid */}
        <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateurs</span>
              <div className="bg-red-500/20 p-2.5 rounded-xl text-red-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalUsers}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.candidatesCount} Candidats • {stats.employersCount} Employeurs
            </p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Missions</span>
              <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalJobs}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              {stats.completedJobs} missions terminées
            </p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KYC En Attente</span>
              <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-400">{stats.pendingKycCount}</p>
            <p className="text-[11px] text-amber-400/80 font-semibold mt-1">Demandes de vérification</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume d'Affaires</span>
              <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-400">{stats.totalVolume.toFixed(2)} €</p>
            <p className="text-[11px] text-emerald-400/80 font-semibold mt-1">Paiements validés</p>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'kyc'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Vérifications KYC ({pendingKycList.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            Gestion des Utilisateurs ({usersList.length})
          </button>
        </div>

        {/* ─── TAB 1: KYC MODERATION ─── */}
        {activeTab === 'kyc' && (
          <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Demandes de Vérification KYC en Attente
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Examinez les profils et validez les badges de vérification 🔵
                </p>
              </div>
            </div>

            {pendingKycList.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                Aucune demande de vérification KYC en attente pour le moment. 🎉
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {pendingKycList.map((user) => (
                  <div key={user.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-white">{user.firstName} {user.lastName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground/80 mt-1 italic max-w-lg">
                            "{user.bio}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleRejectKyc(user)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>

                      <button
                        onClick={() => handleApproveKyc(user)}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver KYC 🔵
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── TAB 2: USERS MANAGEMENT ─── */}
        {activeTab === 'users' && (
          <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Gestion des Utilisateurs</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Consultez la liste des comptes inscrits sur la plateforme</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Statut KYC</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                          {u.firstName} {u.lastName}
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" title="Vérifié" />}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${roleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.kycStatus === 'APPROVED' ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Vérifié
                            </span>
                          ) : u.kycStatus === 'PENDING' ? (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> En Attente
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-medium">Non Vérifié</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                              className="text-muted-foreground hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Supprimer cet utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
