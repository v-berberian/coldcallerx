
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('dark', 'light');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    }
    // For light theme, we don't add any class as the default CSS variables are for light mode
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Smartphone className="h-5 w-5" />;
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-muted/50 active:bg-muted/80 text-muted-foreground hover:text-foreground"
      title={`Current theme: ${theme}`}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
