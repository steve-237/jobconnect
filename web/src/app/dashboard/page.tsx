'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CandidateDashboard from './CandidateDashboard';
import EmployerDashboard from './EmployerDashboard';

function decodeUserFromToken(): { email: string, role?: string } | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return { email: decoded.email ?? decoded.sub ?? '', role: decoded.role };
  } catch {
    return null;
  }
}

function firstNameFromEmail(email: string): string {
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function DashboardRouterPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const user = decodeUserFromToken();
    if (user?.role === 'ADMIN') {
      router.replace('/admin');
      return;
    }

    if (user?.email) {
      setGreeting(`Welcome back, ${firstNameFromEmail(user.email)}!`);
    } else {
      setGreeting('Welcome back!');
    }
    
    setUserRole(user?.role || 'CANDIDATE');
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Dashboard Visual Routing
  if (userRole === 'EMPLOYER') {
    return <EmployerDashboard greeting={greeting} userRole={userRole} />;
  }

  return <CandidateDashboard greeting={greeting} userRole={userRole} />;
}
