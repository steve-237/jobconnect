'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
}

export default function Breadcrumbs({
  items,
  showBackButton = false,
  backHref,
  className = '',
}: BreadcrumbsProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-white transition-colors text-muted-foreground hover:underline"
            title="Accueil"
          >
            <Home className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-white flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
                  {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors flex items-center gap-1 hover:underline truncate max-w-[160px] sm:max-w-xs"
                >
                  {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {showBackButton && (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour</span>
        </button>
      )}
    </nav>
  );
}
