'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, DollarSign, Clock, User, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface Job {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  createdAt: string;
  employer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
  };
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        console.error('Failed to fetch job', err);
        setError('Job not found or an error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setIsApplying(true);
    // Simulate API call for application
    setTimeout(() => {
      setApplied(true);
      setIsApplying(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Oops!</h2>
        <p className="text-muted-foreground mb-8">{error || 'Job not found'}</p>
        <Link href="/jobs" className="bg-primary px-6 py-3 rounded-xl text-white font-medium">
          Browse Jobs
        </Link>
      </div>
    );
  }

  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/5 pb-8 mb-8">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary mb-4">
                {job.category?.name || 'Uncategorized'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {job.employer.firstName} {job.employer.lastName}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Posted on {postedDate}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-4 shrink-0">
              <div className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                {job.price}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />
                {job.location || 'Remote/Anywhere'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Job Description
            </h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5">
              {job.description}
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-center sm:justify-start">
            {applied ? (
              <button disabled className="flex items-center gap-2 bg-success/20 text-success px-8 py-4 rounded-xl font-semibold cursor-not-allowed border border-success/30">
                <CheckCircle2 className="w-5 h-5" />
                Application Sent Successfully!
              </button>
            ) : (
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className="flex items-center justify-center w-full sm:w-auto gap-2 bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isApplying ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Applying...</>
                ) : (
                  'Apply for this Job'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
