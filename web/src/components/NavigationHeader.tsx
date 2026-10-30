'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Wallet,
  Calendar,
  LogOut,
  User,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/NotificationBell';
import { decodeToken, clearStoredToken } from '@/lib/auth';

interface NavigationHeaderProps {
  currentRole?: string;
  showDashboardLink?: boolean;
}

export default function NavigationHeader({
  currentRole,
  showDashboardLink = true,
}: NavigationHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(currentRole || null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = decodeToken();
    if (user) {
      setIsLoggedIn(true);
      setRole(user.role || 'CANDIDATE');
      setUserEmail(user.email || '');
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    setIsLoggedIn(false);
    router.push('/login');
  };

  const roleBadgeStyle = (r: string) => {
    if (r === 'ADMIN') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (r === 'EMPLOYER') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Logo size="sm" showTagline={false} />

          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <Link
              href="/jobs"
              className={`transition-colors hover:text-white px-2 py-1 rounded-lg ${
                pathname.startsWith('/jobs') ? 'text-white bg-white/5' : ''
              }`}
            >
              Missions
            </Link>

            {role === 'EMPLOYER' && (
              <Link
                href="/candidates"
                className={`transition-colors hover:text-white px-2 py-1 rounded-lg ${
                  pathname === '/candidates' ? 'text-white bg-white/5' : ''
                }`}
              >
                Candidats
              </Link>
            )}

            {isLoggedIn && (
              <>
                <Link
                  href="/wallet"
                  className={`transition-colors hover:text-white px-2 py-1 rounded-lg ${
                    pathname === '/wallet' ? 'text-white bg-white/5' : ''
                  }`}
                >
                  Portefeuille
                </Link>

                <Link
                  href="/disputes"
                  className={`transition-colors hover:text-white px-2 py-1 rounded-lg ${
                    pathname === '/disputes' ? 'text-white bg-white/5' : ''
                  }`}
                >
                  Litiges
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLoggedIn && <NotificationBell />}
          <LanguageSwitcher variant="dropdown" />
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {showDashboardLink && (
                <Link
                  href="/dashboard"
                  className="bg-primary hover:bg-primary/80 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tableau de bord</span>
                </Link>
              )}

              {role && (
                <span className={`hidden lg:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleBadgeStyle(role)}`}>
                  {role}
                </span>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors px-3 py-2"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-primary/80 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
