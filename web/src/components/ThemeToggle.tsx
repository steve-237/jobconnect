'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('jobconnect_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light-theme', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('jobconnect_theme', nextTheme);
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-muted-foreground hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
      title={`Basculez vers le thème ${theme === 'dark' ? 'Clair ☀️' : 'Sombre 🌙'}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Clair</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Sombre</span>
        </>
      )}
    </button>
  );
}
