'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Briefcase, LogOut, LayoutDashboard, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navbar simple */}
      <header className="w-full flex justify-between items-center p-6 md:px-12 z-20">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">JobConnect</span>
        </div>
        <div>
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Background decoration */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      <main className="flex-1 z-10 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-6 lg:px-12 py-12 gap-12">
        
        {/* Left Column : Text & CTA */}
        <div className="flex flex-col items-start text-left lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform Live Now
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Connect. <br/> Collaborate. <br/> <span className="text-primary">Succeed.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">
            The ultimate platform bridging the gap between talented freelancers and forward-thinking employers. Instant matching, secure escrow payments, and verified profiles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {isLoggedIn ? (
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-primary-foreground px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 w-full sm:w-auto"
              >
                Go to Dashboard
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/register"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-primary-foreground px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 w-full sm:w-auto"
                >
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 border border-white/10 w-full sm:w-auto"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Secure Escrow
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified Pros
            </div>
          </div>
        </div>

        {/* Right Column : Illustration */}
        <div className="lg:w-1/2 flex justify-center relative w-full aspect-square max-w-[500px]">
          {/* Glassmorphism background for the image to sit on */}
          <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-2xl overflow-hidden glass">
            <Image 
              src="/hero.png"
              alt="Digital platform connecting professionals"
              fill
              priority
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

      </main>
    </div>
  );
}
