'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CandidateDashboard from './CandidateDashboard';
import EmployerDashboard from './EmployerDashboard';
import { decodeToken, isTokenExpired, getDisplayNameFromEmail } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || undefined;

  const [greeting, setGreeting] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token || isTokenExpired(token)) {
      router.replace('/login?redirect=/dashboard');
      return;
    }

    const user = decodeToken(token);
    if (!user) {
      router.replace('/login?redirect=/dashboard');
      return;
    }

    if (user.role === 'ADMIN') {
      router.replace('/admin');
      return;
    }

    if (user.email) {
      setGreeting(`Welcome back, ${getDisplayNameFromEmail(user.email)}!`);
    } else {
      setGreeting('Welcome back!');
    }

    setUserRole(user.role || 'CANDIDATE');
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Dashboard Visual Routing with tab persistence
  if (userRole === 'EMPLOYER') {
    return (
      <EmployerDashboard
        greeting={greeting}
        userRole={userRole}
        initialTab={tabParam as any}
      />
    );
  }

  return (
    <CandidateDashboard
      greeting={greeting}
      userRole={userRole}
      initialTab={tabParam as any}
    />
  );
}

export default function DashboardRouterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
