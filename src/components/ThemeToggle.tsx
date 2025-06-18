
import React from 'react';
import { Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle: React.FC = () => {
  const { setTheme } = useTheme();

  // Force light mode on mount
  React.useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  return (
    <button
      onClick={() => setTheme('light')}
      className="p-2 rounded-lg transition-none text-muted-foreground"
      title="Light mode"
    >
      <Sun className="h-5 w-5" />
    </button>
  );
};

export default ThemeToggle;
