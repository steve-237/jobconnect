'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import de from '../../messages/de.json';

export type Locale = 'fr' | 'en' | 'es' | 'de';

const STORAGE_KEY = 'jobconnect_locale';
const DEFAULT_LOCALE: Locale = 'fr';

const MESSAGES: Record<Locale, Record<string, any>> = {
  fr,
  en,
  es,
  de,
};

/** Resolve a dot-separated key path from a nested object */
function resolvePath(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') return acc[key];
    return undefined;
  }, obj as any);
}

/** Replace {varName} placeholders with provided values */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  isLoading: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Read saved locale from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && ['fr', 'en', 'es', 'de'].includes(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      // Dispatch custom event so other components or tabs can react
      window.dispatchEvent(new CustomEvent('jobconnect_locale_changed', { detail: newLocale }));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      // Try active locale first, fallback to French, fallback to human key
      const activeDict = MESSAGES[locale] || MESSAGES.fr;
      let value = resolvePath(activeDict, key);

      if (typeof value !== 'string' && locale !== 'fr') {
        value = resolvePath(MESSAGES.fr, key);
      }

      if (typeof value === 'string') {
        return interpolate(value, vars);
      }

      // Fallback formatting
      const fallback = key.split('.').pop() ?? key;
      return fallback.replace(/_/g, ' ');
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading: !isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}
