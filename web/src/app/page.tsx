'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Briefcase, LogOut, LayoutDashboard, 
  CheckCircle2, Users, Shield, Zap, Star, ChevronRight,
  Search, MapPin
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Users className="w-8 h-8 text-blue-400" />,
    title: 'Instant Matching',
    description: 'Our algorithm connects freelancers with the best opportunities based on skills, location, and availability.',
    image: '/feature-matching.png',
  },
  {
    icon: <Shield className="w-8 h-8 text-green-400" />,
    title: 'Secure Escrow',
    description: 'Payments are held in escrow until the job is completed. Both parties are protected from fraud.',
    image: '/feature-payment.png',
  },
  {
    icon: <Star className="w-8 h-8 text-purple-400" />,
    title: 'Verified Profiles',
    description: 'Every professional is verified with ID checks and skill assessments. Trust built into the platform.',
    image: '/feature-verified.png',
  },
];

const STEPS = [
  { number: '01', title: 'Create your account', description: 'Sign up in seconds as a freelancer or employer.' },
  { number: '02', title: 'Post or find a job', description: 'Employers post missions. Freelancers browse and apply.' },
  { number: '03', title: 'Get matched & work', description: 'Our system matches the best candidate. Work begins.' },
  { number: '04', title: 'Get paid securely', description: 'Funds release automatically when the job is done.' },
];

const TESTIMONIALS = [
  { name: 'Marie L.', role: 'Freelancer', text: 'I found 3 jobs in my first week. The escrow system gives me total peace of mind.', rating: 5 },
  { name: 'Thomas B.', role: 'Employer', text: 'Finding reliable help for weekend projects has never been this easy. Highly recommended!', rating: 5 },
  { name: 'Sophie D.', role: 'Freelancer', text: 'The platform is intuitive and the matching algorithm is spot-on. Love it!', rating: 4 },
];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* ========== NAVBAR ========== */}
      <header className="w-full sticky top-0 z-50 glass">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">JobConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors p-2">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className="flex items-center gap-1.5 text-sm font-medium bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative flex flex-col lg:flex-row items-center max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 gap-12 lg:gap-16">
        {/* Background blobs */}
        <div className="absolute top-0 left-[-15%] w-[50%] h-[60%] rounded-full bg-primary/15 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-15%] w-[40%] h-[50%] rounded-full bg-purple-900/15 blur-[150px] pointer-events-none" />

        <div className="flex flex-col items-start lg:w-1/2 z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now in Beta — Join 2,500+ professionals
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.05]">
            <span className="bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Find the perfect
            </span>
            <br />
            <span className="text-primary">short-term job</span>
            <br />
            <span className="bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              in seconds.
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
            Whether you need help moving, a weekend gardener, or a skilled handyman — connect instantly with verified professionals near you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {isLoggedIn ? (
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
              >
                Go to Dashboard
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/register"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/jobs"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-white/10"
                >
                  <Search className="w-5 h-5" />
                  Browse Jobs
                </Link>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" /> Free to join
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" /> Secure payments
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" /> Verified profiles
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:w-1/2 flex justify-center relative w-full max-w-[520px] aspect-square z-10 animate-fade-in-up animate-delay-200">
          <div className="absolute inset-0 rounded-3xl overflow-hidden gradient-border glass shadow-2xl shadow-primary/10">
            <Image 
              src="/hero.png"
              alt="JobConnect — Digital platform connecting professionals"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Why Choose Us</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Built for trust & speed</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every feature is designed to make finding and completing punctual jobs as seamless and secure as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div 
              key={i}
              className="glass rounded-2xl p-8 flex flex-col items-start gap-5 hover:scale-[1.03] transition-all duration-300 group gradient-border"
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              <div className="relative w-full h-40 rounded-xl overflow-hidden mt-auto">
                <Image 
                  src={feature.image} 
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From sign-up to payment, the entire process takes just a few clicks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="relative glass rounded-2xl p-6 group hover:scale-[1.03] transition-all duration-300">
              <span className="text-5xl font-black text-white/5 absolute top-4 right-6 group-hover:text-primary/10 transition-colors">{step.number}</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mb-5">
                {step.number}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-600" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Loved by professionals</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-8 flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="relative glass rounded-3xl p-12 md:p-16 text-center overflow-hidden gradient-border">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 relative z-10">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto relative z-10">
            Join thousands of freelancers and employers who trust JobConnect for their punctual job needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link 
              href="/register"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/jobs"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 border border-white/10"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">JobConnect</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <p className="text-sm text-gray-600">&copy; 2026 JobConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
