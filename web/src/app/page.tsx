import Link from 'next/link';
import { ArrowRight, Briefcase } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      <main className="z-10 flex flex-col items-center text-center max-w-3xl px-6">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-full bg-white/5 border border-white/10 glass">
          <Briefcase className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">JobConnect</h1>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          The future of <br /> punctual jobs.
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl">
          Connect with employers for short-term missions instantly. Secure escrow payments and verified profiles.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="/register"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-primary-foreground px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 border border-white/10"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
