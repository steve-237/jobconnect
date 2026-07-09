'use client';

import { Briefcase, Users, MessageSquare, Plus, ArrowRight, User, MoreVertical, LayoutGrid, CheckCircle, Bell, LogOut, Loader2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Job {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count: { applications: number };
}

interface Application {
  id: string;
  message: string;
  isAccepted: boolean;
  createdAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function EmployerDashboard({ greeting, userRole }: { greeting: string, userRole: string }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/employer/my-jobs');
      setJobs(res.data);
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

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
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-all mt-4 border border-transparent hover:border-red-500/20">
              <LogOut className="w-5 h-5" />
              Sign Out
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
            <h3 className="text-4xl font-bold mt-4 mb-1">
              {jobs.reduce((acc, job) => acc + job._count.applications, 0)}
            </h3>
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
                {isLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading jobs...</td></tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                      <button onClick={() => router.push('/jobs/create')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Post your first Job
                      </button>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{job.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                          job.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{job._count.applications}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-muted-foreground text-sm">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={async () => {
                            setSelectedJob(job);
                            setIsLoadingApps(true);
                            try {
                              const res = await api.get(`/applications/job/${job.id}`);
                              setApplications(res.data);
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsLoadingApps(false);
                            }
                          }}
                          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Applicants
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Applicants */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold">Applicants for "{selectedJob.title}"</h3>
                  <p className="text-sm text-muted-foreground mt-1">{applications.length} total candidates</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingApps ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No applicants yet.</div>
                ) : (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                          <h4 className="font-bold text-lg">{app.candidate.firstName} {app.candidate.lastName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{app.candidate.email}</p>
                          <div className="bg-black/30 p-3 rounded-lg text-sm italic text-gray-300">
                            "{app.message || "I am very interested in this opportunity."}"
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {app.isAccepted ? (
                            <>
                              <span className="hidden sm:inline-flex items-center gap-2 text-emerald-400 px-2 text-sm font-semibold">
                                <CheckCircle className="w-4 h-4" /> Accepted
                              </span>
                              <button 
                                onClick={() => router.push(`/messages/${app.id}`)}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" /> Discuter
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={async () => {
                                try {
                                  await api.patch(`/applications/${app.id}/accept`);
                                  setApplications(applications.map(a => a.id === app.id ? { ...a, isAccepted: true } : a));
                                } catch (e) {
                                  console.error(e);
                                  alert('Failed to accept');
                                }
                              }}
                              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                            >
                              <Check className="w-4 h-4" /> Accept Candidate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
