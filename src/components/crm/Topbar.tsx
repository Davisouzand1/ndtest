import { useCRM } from '@/contexts/CRMContext';
import { useTheme } from 'next-themes';
import { Sun, Moon, Plus } from 'lucide-react';
import { MobileFilters } from './MobileFilters';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onNewLead: () => void;
}

export function Topbar({ title, subtitle = 'Gestão Integrada', onNewLead }: TopbarProps) {
  const { state, clearFilters } = useCRM();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="topbar-panel">
      <div className="min-w-0 flex-1 flex items-center gap-3">
        {state.logo && (
          <img 
            src={state.logo} 
            alt="Logo" 
            className="h-8 md:h-10 w-auto max-w-[120px] object-contain"
          />
        )}
        <div>
          <h1 className="text-base md:text-xl font-bold tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text truncate">{title}</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-1.5 md:gap-2.5 items-center flex-shrink-0">
        {/* Mobile filters button */}
        <div className="md:hidden">
          <MobileFilters />
        </div>
        
        <button
          onClick={toggleTheme}
          className="icon-button"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
        </button>
        <button
          onClick={clearFilters}
          className="text-button hidden sm:block"
        >
          Limpar filtros
        </button>
        <button onClick={onNewLead} className="btn-gold flex items-center gap-1 md:gap-2 text-sm md:text-base px-3 md:px-5 py-2 md:py-2.5">
          <Plus className="w-4 h-4 md:hidden" />
          <span className="hidden md:inline text-lg">+</span>
          <span className="hidden sm:inline">Novo Lead</span>
          <span className="sm:hidden">Lead</span>
        </button>
      </div>
    </div>
  );
}
