'use client';

import { Briefcase, Users, MessageSquare, Plus, ArrowRight, User, MoreVertical, LayoutGrid, CheckCircle, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const recentJobsEmployer = [
  { id: 1, title: 'Backend Engineer (Node.js)', applicants: 12, status: 'Active', postedAgo: '1 day ago' },
  { id: 2, title: 'DevOps Specialist', applicants: 5, status: 'Reviewing', postedAgo: '3 days ago' },
  { id: 3, title: 'Frontend Developer', applicants: 28, status: 'Closed', postedAgo: '2 weeks ago' },
];

export default function EmployerDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background relative overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            Employer Hub
          </h2>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-amber-500/10 text-amber-400 rounded-xl font-medium border border-amber-500/20 transition-all">
              <LayoutGrid className="w-5 h-5" />
              Overview
            </button>
            <button onClick={() => router.push('/jobs')} className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-xl font-medium transition-all">
              <Briefcase className="w-5 h-5" />
              Manage Jobs
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-xl font-medium transition-all">
              <Users className="w-5 h-5" />
              Candidates
            </button>
            <button onClick={() => router.push('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-xl font-medium transition-all">
              <User className="w-5 h-5" />
              Company Profile
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5">
          <button onClick={() => router.push('/jobs/create')} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 relative z-10 h-screen overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4">
              {greeting}
              <span className="text-xs font-medium px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 border border-amber-500/30 uppercase">
                {userRole}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your active listings and incoming applications.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <button className="p-2 bg-white/5 border border-white/10 rounded-full text-muted-foreground hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-background"></span>
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="bg-amber-500/20 text-amber-500 p-3 rounded-xl"><Briefcase className="w-6 h-6" /></div>
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">+2 this week</span>
            </div>
            <h3 className="text-4xl font-bold mt-4 mb-1">3</h3>
            <p className="text-muted-foreground font-medium">Active Jobs</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl"><Users className="w-6 h-6" /></div>
            </div>
            <h3 className="text-4xl font-bold mt-4 mb-1">45</h3>
            <p className="text-muted-foreground font-medium">Total Applicants</p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
            </div>
            <h3 className="text-4xl font-bold mt-4 mb-1">12</h3>
            <p className="text-muted-foreground font-medium">Hires Made</p>
          </div>
        </div>

        {/* Detailed Job List (Kanban-ish) */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-foreground">Active Listings Pipeline</h2>
            <Link href="/jobs" className="text-amber-500 font-medium hover:text-amber-400 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/20 text-muted-foreground text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Job Title</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Applicants</th>
                  <th className="px-6 py-4 font-semibold">Posted</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentJobsEmployer.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-foreground">{job.title}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                        job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        job.status === 'Reviewing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{job.applicants}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground text-sm">
                      {job.postedAgo}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-muted-foreground hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
