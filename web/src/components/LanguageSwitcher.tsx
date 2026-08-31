'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, Locale } from '@/contexts/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LANGUAGES: { code: Locale; flag: string; label: string; name: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'FR', name: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'ES', name: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
];

interface LanguageSwitcherProps {
  /** 
   * 'dropdown' (default): Elegant dropdown selector with flag, label and popover menu
   * 'pills': Horizontal segmented control pills
   * 'compact': Minimal flag buttons row
   */
  variant?: 'dropdown' | 'pills' | 'compact';
  className?: string;
  align?: 'left' | 'right';
}

export default function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
  align = 'right',
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // PILLS VARIANT
  if (variant === 'pills') {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg ${className}`}
        role="group"
        aria-label="Language selector"
      >
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLocale(lang.code)}
              aria-pressed={isActive}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30 scale-[1.03]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                }
              `}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // COMPACT VARIANT
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-1.5 ${className}`}
        role="group"
        aria-label="Language selector"
      >
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLocale(lang.code)}
              aria-pressed={isActive}
              title={lang.name}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border
                ${
                  isActive
                    ? 'bg-primary/20 text-primary border-primary/40 shadow-sm scale-105'
                    : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground'
                }
              `}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span className="text-[11px] font-semibold">{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // DROPDOWN VARIANT (Default - Premium glassmorphic popover)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-foreground text-xs font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span className="font-bold tracking-wide">{currentLang.name}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 w-44 rounded-2xl bg-background/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50 p-1.5 animate-in fade-in zoom-in-95 duration-150
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70 border-b border-white/5 mb-1">
            Changer de langue / Language
          </div>

          <div className="space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isActive = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer
                    ${
                      isActive
                        ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
