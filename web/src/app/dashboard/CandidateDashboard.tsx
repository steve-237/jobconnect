'use client';

import { FileText, Users, TrendingUp, Search, User, ArrowRight, DollarSign, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const recentJobsCandidate = [
  { id: 1, title: 'Senior React Developer', price: '$85k – $120k', location: 'Remote', status: 'Applied', postedAgo: '2 days ago' },
  { id: 2, title: 'UI/UX Designer', price: '$60k – $90k', location: 'New York, NY', status: 'Interview', postedAgo: '1 week ago' },
];

const statusColor: Record<string, string> = {
  Applied: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Interview: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

export default function CandidateDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();

  const stats = [
    { label: 'Jobs Applied', value: 8, icon: FileText, accent: 'text-primary' },
    { label: 'Interviews', value: 2, icon: Users, accent: 'text-emerald-400' },
    { label: 'Profile Views', value: 45, icon: TrendingUp, accent: 'text-violet-400' },
  ];

  const quickActions = [
    { label: 'Browse Jobs', href: '/jobs', icon: Search, color: 'bg-emerald-500/20 text-emerald-400' },
    { label: 'My Applications', href: '#', icon: FileText, color: 'bg-primary/20 text-primary' },
    { label: 'My Profile', href: '/profile', icon: User, color: 'bg-violet-500/20 text-violet-400' },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-4">
            {greeting}
            <span className="text-xs font-medium px-3 py-1 bg-white/10 rounded-full text-muted-foreground border border-white/10 uppercase">
              {userRole}
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here's the status of your applications and job searches.
          </p>
        </div>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.accent} bg-white/5`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Recent Applications</h2>
              <button onClick={() => router.push('/jobs')} className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80">
                Browse more <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentJobsCandidate.map((job) => (
                <div key={job.id} className="group flex flex-col gap-3 rounded-xl bg-white/[0.03] p-5 transition-all duration-200 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />{job.price}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{job.postedAgo}</span>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor[job.status]}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-5 text-xl font-semibold text-foreground">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button key={action.label} onClick={() => router.push(action.href)} className="flex w-full items-center gap-4 rounded-xl bg-white/[0.03] p-4 text-left transition-all duration-200 hover:bg-white/[0.07] group">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
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
        </aside>
      </div>
    </div>
  );
}
