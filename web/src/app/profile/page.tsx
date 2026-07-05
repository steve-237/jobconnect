'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Edit3,
  Star,
  Briefcase,
  Calendar,
  Settings,
  Save,
  X,
  Lock,
  Trash2,
  FileText,
} from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  role: 'CANDIDATE' | 'EMPLOYER';
  createdAt: string;
  jobsApplied: number;
  jobsPosted: number;
  rating: number;
}

const mockProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  bio: 'Passionate software engineer with 5+ years of experience building scalable web applications. Open to new opportunities in full-stack development.',
  role: 'CANDIDATE',
  createdAt: '2025-03-15T10:00:00Z',
  jobsApplied: 24,
  jobsPosted: 0,
  rating: 4.7,
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(mockProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Simulate loading
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [router]);

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  const handleEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const handleSave = () => {
    setProfile({ ...draft });
    setEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        {/* ─── Profile Header ─── */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/25">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-card" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 self-center sm:self-auto rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
                    profile.role === 'EMPLOYER'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'bg-primary/15 text-primary border border-primary/20'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {profile.role}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-muted-foreground text-sm">
                <span className="inline-flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                <span className="inline-flex items-center gap-1.5 justify-center sm:justify-start">
                  <Calendar className="h-4 w-4" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Jobs Applied',
              value: profile.jobsApplied,
              icon: FileText,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
            },
            {
              label: 'Jobs Posted',
              value: profile.jobsPosted,
              icon: Briefcase,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              label: 'Rating',
              value: profile.rating.toFixed(1),
              icon: Star,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              suffix: '/ 5',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <div className={`${stat.bg} rounded-lg p-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Personal Information ─── */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>

            {!editing ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-card hover:bg-muted-foreground/10 text-muted-foreground px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                First Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={editing ? draft.firstName : profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Last Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={editing ? draft.lastName : profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  disabled={!editing}
                  value={editing ? draft.email : profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Bio
              </label>
              <textarea
                rows={4}
                disabled={!editing}
                value={editing ? draft.bio : profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* ─── Account Settings ─── */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Account Settings</h2>
          </div>

          <div className="space-y-3">
            {/* Change Password */}
            <button className="w-full flex items-center justify-between rounded-xl border border-white/5 bg-card/60 hover:bg-card px-5 py-4 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 rounded-lg p-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Change Password</p>
                  <p className="text-xs text-muted-foreground">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>
              <svg
                className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Delete Account */}
            <button className="w-full flex items-center justify-between rounded-xl border border-red-500/10 bg-card/60 hover:bg-red-500/5 px-5 py-4 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 rounded-lg p-2">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-red-400">
                    Delete Account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove your account and all associated data
                  </p>
                </div>
              </div>
              <svg
                className="h-4 w-4 text-muted-foreground group-hover:text-red-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
