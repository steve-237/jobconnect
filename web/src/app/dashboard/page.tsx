'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Plus,
  Search,
  User,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

/* ---------- helpers ---------- */

function decodeUserFromToken(): { email: string } | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return { email: decoded.email ?? decoded.sub ?? '' };
  } catch {
    return null;
  }
}

function firstNameFromEmail(email: string): string {
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/* ---------- static data ---------- */

const stats = [
  { label: 'Active Jobs', value: 12, icon: Briefcase, accent: 'text-primary' },
  { label: 'Applications', value: 48, icon: Users, accent: 'text-emerald-400' },
  { label: 'Messages', value: 7, icon: MessageSquare, accent: 'text-amber-400' },
  { label: 'Profile Views', value: 156, icon: TrendingUp, accent: 'text-violet-400' },
];

const recentJobs = [
  {
    id: 1,
    title: 'Senior React Developer',
    price: '$85k – $120k',
    location: 'Remote',
    status: 'Open',
    postedAgo: '2 hours ago',
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    price: '$60k – $90k',
    location: 'New York, NY',
    status: 'In Review',
    postedAgo: '5 hours ago',
  },
  {
    id: 3,
    title: 'Backend Engineer (Node.js)',
    price: '$95k – $130k',
    location: 'San Francisco, CA',
    status: 'Open',
    postedAgo: '1 day ago',
  },
  {
    id: 4,
    title: 'DevOps Specialist',
    price: '$100k – $140k',
    location: 'Remote',
    status: 'Closed',
    postedAgo: '3 days ago',
  },
];

const statusColor: Record<string, string> = {
  Open: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'In Review': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Closed: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const quickActions = [
  { label: 'Post a Job', href: '/jobs/create', icon: Plus, color: 'bg-primary/20 text-primary' },
  { label: 'Browse Jobs', href: '/jobs', icon: Search, color: 'bg-emerald-500/20 text-emerald-400' },
  { label: 'My Profile', href: '/profile', icon: User, color: 'bg-violet-500/20 text-violet-400' },
];

/* ---------- component ---------- */

export default function DashboardPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const user = decodeUserFromToken();
    if (user?.email) {
      setGreeting(`Welcome back, ${firstNameFromEmail(user.email)}!`);
    } else {
      setGreeting('Welcome back!');
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s what&apos;s happening with your jobs today.
          </p>
        </header>

        {/* ── Stats ── */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.accent} bg-white/5`}
                >
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── Main grid: recent jobs + sidebar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Jobs */}
          <section className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Recent Jobs</h2>
                <button
                  onClick={() => router.push('/jobs')}
                  className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group flex flex-col gap-3 rounded-xl bg-white/[0.03] p-5 transition-all duration-200 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          {job.price}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {job.postedAgo}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-5 text-xl font-semibold text-foreground">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="flex w-full items-center gap-4 rounded-xl bg-white/[0.03] p-4 text-left transition-all duration-200 hover:bg-white/[0.07] group"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-5 text-xl font-semibold text-foreground">Activity</h2>
              <ul className="space-y-4 text-sm">
                {[
                  { text: 'New application received for Senior React Developer', time: '30 min ago' },
                  { text: 'Your job post "UI/UX Designer" is under review', time: '2 hrs ago' },
                  { text: 'Message from TechCorp Inc.', time: '5 hrs ago' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-foreground/90">{item.text}</p>
                      <p className="mt-0.5 text-muted-foreground">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
