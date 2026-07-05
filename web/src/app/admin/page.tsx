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
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

/* ---------- helpers ---------- */

function decodeUserFromToken(): { email: string, role?: string } | null {
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
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const user = decodeUserFromToken();
    if (user?.role !== 'ADMIN') {
      router.replace('/dashboard'); // Unauthorized users get bounced to standard dashboard
      return;
    }

    setReady(true);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      setUsersList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (role === 'EMPLOYER') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              Administration Control Panel
            </h1>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Admin Privileges Active
          </div>
        </header>

        {/* Global KPIs */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-6 border-t-2 border-t-red-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground font-medium">Total Users</h3>
              <div className="bg-red-500/20 p-2 rounded-lg text-red-400"><Users className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-bold text-foreground">{usersList.length}</p>
          </div>
          
          <div className="glass rounded-2xl p-6 border-t-2 border-t-primary/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground font-medium">Active Jobs</h3>
              <div className="bg-primary/20 p-2 rounded-lg text-primary"><Briefcase className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-bold text-foreground">124</p>
          </div>

          <div className="glass rounded-2xl p-6 border-t-2 border-t-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground font-medium">System Health</h3>
              <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Activity className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-bold text-foreground text-emerald-400">100%</p>
          </div>
        </section>

        {/* Users Management */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold">User Management</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search users..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500/50 transition-colors" />
              </div>
              <button onClick={fetchUsers} disabled={loadingUsers} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 text-muted-foreground hover:text-white transition-colors">
                <RefreshCw className={`w-5 h-5 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
                ) : (
                  usersList.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${roleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button className="text-muted-foreground hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
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
      </div>
    </div>
  );
}
