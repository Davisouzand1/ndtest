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
    <div className="flex items-center justify-between gap-4 p-4 md:p-5 border border-border bg-card rounded-[22px] panel-shadow mb-6">
      <div>
        <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-[10px] bg-white/5 border border-border text-foreground hover:bg-white/10 transition-all"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2.5 rounded-[10px] text-sm font-semibold bg-white/5 border border-border text-foreground hover:bg-white/10 transition-all"
        >
          Limpar filtros
        </button>
        <button onClick={onNewLead} className="btn-gold flex items-center gap-2">
          + Novo Lead
        </button>
      </div>
    </div>
  );
}
