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
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';

interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  role: 'CANDIDATE' | 'EMPLOYER';
  createdAt: string;
  isVerified: boolean;
  kycStatus: string;
  jobsApplied: number;
  jobsApplied: number;
  jobsPosted: number;
  rating: number;
}

interface Availability {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
}

const mockProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  bio: 'Passionate software engineer with 5+ years of experience building scalable web applications. Open to new opportunities in full-stack development.',
  role: 'CANDIDATE',
  createdAt: '2025-03-15T10:00:00Z',
  isVerified: false,
  kycStatus: 'UNVERIFIED',
  jobsApplied: 0,
  jobsPosted: 0,
  rating: 0,
};

export default function ProfilePage({ isEmbedded }: { isEmbedded?: boolean } = {}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(mockProfile);
  const [loading, setLoading] = useState(true);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Availabilities
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [newAvail, setNewAvail] = useState({ date: '', startTime: '', endTime: '' });
  const [isAddingAvail, setIsAddingAvail] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<{id: string, rating: number, comment: string, createdAt: string, reviewer: {firstName: string, lastName: string}}[]>([]);

  // KYC Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycDocType, setKycDocType] = useState('CNI');
  const [kycDocUrl, setKycDocUrl] = useState('');
  const [kycSelfieUrl, setKycSelfieUrl] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycDocUrl || !kycSelfieUrl) {
      addToast('Veuillez fournir à la fois la pièce d\'identité et le selfie de contrôle.', 'error');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      await api.post('/users/me/kyc', {
        docType: kycDocType,
        docUrl: kycDocUrl,
        selfieUrl: kycSelfieUrl,
      });
      setProfile(prev => ({ ...prev, kycStatus: 'PENDING' }));
      setIsKycModalOpen(false);
      addToast('Dossier KYC transmis avec succès ! En cours d\'examen par l\'administration.', 'success', 'Dossier Reçu 📄');
    } catch (e: any) {
      console.error(e);
      addToast(e.response?.data?.message || 'Erreur lors de l\'envoi du dossier KYC', 'error');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    api.get('/users/me')
      .then(async (res) => {
        const defaultEmployerBio = 'Entreprise / Employeur proposant des missions et opportunités de travail sur JobConnect.';
        const defaultCandidateBio = 'Prestataire / Candidat qualifié prêt à effectuer des missions sur JobConnect.';
        const defaultBio = res.data.role === 'EMPLOYER' ? defaultEmployerBio : defaultCandidateBio;
        const userBio = res.data.bio || defaultBio;

        const updatedData = { ...mockProfile, ...res.data, bio: userBio };
        setProfile(updatedData);
        setDraft(updatedData);

        if (res.data.role === 'CANDIDATE') {
          try {
            const availRes = await api.get(`/availabilities/user/${res.data.id}`);
            setAvailabilities(availRes.data);
          } catch (e) {
            console.error('Error fetching availabilities:', e);
          }
        }

        try {
          const reviewsRes = await api.get(`/reviews/user/${res.data.id}`);
          setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        } catch (e) {
          console.error('Error fetching reviews:', e);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const handleSave = async () => {
    try {
      await api.patch('/users/me', {
        firstName: draft.firstName,
        lastName: draft.lastName,
        bio: draft.bio
      });
      setProfile({ ...draft });
      setEditing(false);
      addToast('Profil mis à jour avec succès', 'success');
    } catch(e) {
      console.error(e);
      addToast('Erreur lors de la sauvegarde du profil', 'error');
    }
  };

  const handleKycRequest = async () => {
    try {
      await api.post('/users/me/kyc');
      setProfile(prev => ({ ...prev, kycStatus: 'PENDING' }));
    } catch(e) {
      console.error(e);
    }
  };

  const handleAddAvailability = async () => {
    if (!newAvail.date) return;
    setIsAddingAvail(true);
    try {
      const res = await api.post('/availabilities', newAvail);
      setAvailabilities([...availabilities, res.data]);
      setNewAvail({ date: '', startTime: '', endTime: '' });
      addToast('Disponibilité ajoutée', 'success');
    } catch(e) {
      console.error(e);
      addToast('Erreur lors de l\'ajout de la disponibilité', 'error');
    } finally {
      setIsAddingAvail(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await api.delete(`/availabilities/${id}`);
      setAvailabilities(availabilities.filter(a => a.id !== id));
      addToast('Disponibilité supprimée', 'info');
    } catch(e) {
      console.error(e);
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const simulateAdminApprove = async () => {
    try {
      await api.post('/users/me/kyc/simulate-approve');
      setProfile(prev => ({ ...prev, kycStatus: 'APPROVED', isVerified: true }));
    } catch(e) {
      console.error(e);
    }
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      {/* ─── Background Elements ─── */}
      {!isEmbedded && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
        </>
      )}

      <div className={isEmbedded ? "w-full space-y-8" : "mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"}>
        {!isEmbedded && (
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        )}
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2" title={profile.isVerified ? "Profil Vérifié" : undefined}>
                  {profile.firstName} {profile.lastName}
                  {profile.isVerified && (
                    <CheckCircle className="text-blue-500 w-6 h-6 fill-blue-500/20" />
                  )}
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

        {/* ─── KYC Banner ─── */}
        {!profile.isVerified && (
          <div className="glass rounded-2xl p-6 border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-3 rounded-2xl text-amber-400">
                {profile.kycStatus === 'PENDING' ? <Clock className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                  {profile.kycStatus === 'PENDING' ? 'Vérification d\'identité en cours ⏳' : 'Obtenez votre Badge de Confiance 🔵'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.kycStatus === 'PENDING'
                    ? 'Vos pièces justificatives ont été transmises et sont actuellement examinées par notre équipe de modération.'
                    : 'Transmettez votre pièce d\'identité et selfie de contrôle pour certifier votre profil.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {profile.kycStatus !== 'PENDING' && (
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Soumettre mes pièces d'identité
                </button>
              )}
              {profile.kycStatus === 'PENDING' && (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold">
                  Dossier en Examen
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Stats Cards ─── */}
        <div className={`grid grid-cols-1 ${profile.role === 'EMPLOYER' ? 'sm:grid-cols-2' : 'sm:grid-cols-2'} gap-4`}>
          {[
            ...(profile.role === 'CANDIDATE'
              ? [
                  {
                    label: 'Missions postulées',
                    value: profile.jobsApplied,
                    icon: FileText,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                  },
                ]
              : [
                  {
                    label: 'Missions publiées',
                    value: profile.jobsPosted,
                    icon: Briefcase,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                  },
                ]),
            {
              label: 'Note globale',
              value: profile.rating ? profile.rating.toFixed(1) : '0.0',
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

        {/* ─── Admin Action ─── */}
        {profile.role === 'ADMIN' && (
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-4 mb-6 border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 rounded-lg p-2">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-red-100">Espace Administration</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Accédez au panneau de contrôle pour gérer les utilisateurs et le contenu de la plateforme.
            </p>
            <button 
              onClick={() => router.push('/admin')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Aller au Panel Admin
            </button>
          </div>
        )}

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

        {/* ─── Availabilities (CANDIDATE only) ─── */}
        {profile.role === 'CANDIDATE' && (
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 rounded-lg p-2">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold">Mes Disponibilités</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Indiquez les dates exactes auxquelles vous êtes disponible pour réaliser des missions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-end bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date précise</label>
                <input 
                  type="date"
                  value={newAvail.date}
                  onChange={e => setNewAvail({...newAvail, date: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Heure de début (opt.)</label>
                <input 
                  type="time"
                  value={newAvail.startTime}
                  onChange={e => setNewAvail({...newAvail, startTime: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Heure de fin (opt.)</label>
                <input 
                  type="time"
                  value={newAvail.endTime}
                  onChange={e => setNewAvail({...newAvail, endTime: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button 
                onClick={handleAddAvailability}
                disabled={!newAvail.date || isAddingAvail}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Ajouter
              </button>
            </div>

            {availabilities.length > 0 ? (
              <div className="space-y-3 mt-4">
                {availabilities.map(av => (
                  <div key={av.id} className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-500/20 text-amber-500 p-2 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{new Date(av.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        {(av.startTime || av.endTime) && (
                          <p className="text-sm text-muted-foreground">
                            {av.startTime ? `De ${av.startTime}` : ''} {av.endTime ? `à ${av.endTime}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAvailability(av.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground bg-white/5 border border-white/10 rounded-xl">
                Aucune disponibilité renseignée.
              </div>
            )}
          </div>
        )}

        {/* ─── Reviews Section ─── */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 rounded-lg p-2">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold">Mes Avis</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${star <= Math.round(profile.rating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
            <span className="font-medium">{profile.rating.toFixed(1)}/5 ({reviews.length} avis)</span>
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="glass rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{review.reviewer?.firstName} {review.reviewer?.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-muted-foreground bg-white/5 border border-white/10 rounded-xl">
                Aucun avis pour le moment
              </div>
            )}
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

        {/* ─── KYC Submission Modal ─── */}
        {isKycModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsKycModalOpen(false)}>
            <div className="bg-[#121212] border border-amber-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Vérification d'Identité (KYC)</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Transmettez vos pièces justificatives officielles</p>
                  </div>
                </div>
                <button onClick={() => setIsKycModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleKycSubmit} className="space-y-4">
                {/* Document Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Type de Pièce d'Identité</label>
                  <select
                    value={kycDocType}
                    onChange={(e) => setKycDocType(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="CNI">Carte Nationale d'Identité (CNI)</option>
                    <option value="PASSPORT">Passeport International</option>
                    <option value="PERMIS">Permis de Conduire</option>
                    <option value="KBIS">Kbis / Registre du Commerce (Employeur)</option>
                  </select>
                </div>

                {/* Upload Zone 1: ID Document */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">1. Scan / Photo du Document d'Identité</label>
                  <div className="border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl p-4 bg-white/5 text-center transition-colors relative">
                    {kycDocUrl ? (
                      <div className="relative group">
                        <img src={kycDocUrl} alt="Pièce d'identité" className="h-28 mx-auto rounded-xl object-contain border border-white/10" />
                        <button
                          type="button"
                          onClick={() => setKycDocUrl('')}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 py-2">
                        <FileText className="w-7 h-7 text-amber-400" />
                        <span className="text-xs font-semibold text-white">Sélectionner ou glisser la photo du document</span>
                        <span className="text-[10px] text-muted-foreground">Format JPG, PNG ou WEBP</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setKycDocUrl)} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Upload Zone 2: Selfie Control */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">2. Photo Selfie de Contrôle</label>
                  <div className="border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl p-4 bg-white/5 text-center transition-colors relative">
                    {kycSelfieUrl ? (
                      <div className="relative group">
                        <img src={kycSelfieUrl} alt="Selfie de contrôle" className="h-28 mx-auto rounded-xl object-contain border border-white/10" />
                        <button
                          type="button"
                          onClick={() => setKycSelfieUrl('')}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 py-2">
                        <User className="w-7 h-7 text-blue-400" />
                        <span className="text-xs font-semibold text-white">Prendre / Choisir un Selfie tenant la carte</span>
                        <span className="text-[10px] text-muted-foreground">Assurez-vous que votre visage et le document sont lisibles</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setKycSelfieUrl)} />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingKyc || !kycDocUrl || !kycSelfieUrl}
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingKyc ? 'Transmissions des pièces...' : 'Soumettre mon dossier KYC'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
