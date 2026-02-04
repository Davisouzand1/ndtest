import { useCRM } from '@/contexts/CRMContext';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onNewLead: () => void;
}

export function Topbar({ title, subtitle = 'Gestão Integrada', onNewLead }: TopbarProps) {
  const { clearFilters } = useCRM();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="topbar-panel">
      <div>
        <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex gap-2.5 items-center">
        <button
          onClick={toggleTheme}
          className="icon-button"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={clearFilters}
          className="text-button"
        >
          Limpar filtros
        </button>
        <button onClick={onNewLead} className="btn-gold flex items-center gap-2">
          <span className="text-lg">+</span>
          Novo Lead
        </button>
      </div>
    </div>
  );
}
