'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  href?: string | null;
}

export default function Logo({
  size = 'md',
  showTagline = false,
  className = '',
  href = '/',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const zapSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Simplistic modern icon: Rounded gradient badge with fast job spark */}
      <div
        className={`relative ${iconSizes[size]} bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300 shrink-0`}
      >
        <Zap className={`${zapSizes[size]} fill-white text-white drop-shadow-sm`} />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background" />
      </div>

      <div className="flex flex-col leading-none">
        <span className={`${textSizes[size]} font-black tracking-tight text-foreground flex items-center gap-0.5`}>
          Job<span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Connect</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-muted-foreground/80 mt-1">
            Petits jobs & services ⚡
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
