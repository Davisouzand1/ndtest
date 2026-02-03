import { useCRM } from '@/contexts/CRMContext';
import logo from '@/assets/logo.png';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'kanban', icon: '📌', label: 'CRM', showCount: true },
  { id: 'tasks', icon: '✅', label: 'Tarefas' },
  { id: 'financial', icon: '💰', label: 'Financeiro' },
  { id: 'contracts', icon: '📜', label: 'Contratos' },
  { id: 'reports', icon: '📊', label: 'Relatórios' },
  { id: 'config', icon: '⚙️', label: 'Configurações' },
];

const periodOptions = [
  { value: '7', label: '7d' },
  { value: '14', label: '14d' },
  { value: '30', label: '30d' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { state, filters, setFilters } = useCRM();

  const handlePeriodClick = (days: string) => {
    // Toggle: if already selected, deselect it
    if (filters.period === days) {
      setFilters(f => ({ ...f, period: '', month: '' }));
    } else {
      setFilters(f => ({ ...f, period: days, month: '' }));
    }
  };

  const handleMonthChange = (month: string) => {
    setFilters(f => ({ ...f, month, period: '' }));
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] border-r border-border bg-gradient-to-b from-[rgba(17,17,20,0.98)] to-[rgba(11,11,12,0.98)] h-screen sticky top-0 overflow-auto p-4">
      <div className="flex justify-center items-center pb-5 border-b border-border mb-5">
        <img src={logo} alt="ND Digital" className="h-16 w-auto object-contain" />
      </div>

      <nav className="flex flex-col gap-2 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.showCount && (
              <span className="ml-auto text-xs text-primary border border-primary/45 px-1.5 py-0.5 rounded-full bg-primary/10">
                {state.leads.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl mt-4">
        <div className="text-xs text-muted-foreground mb-2">🔎 Filtros globais</div>
        <input
          className="input-crm mb-2"
          placeholder="Buscar: nome, empresa..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wide mb-1 block">Vendedor</label>
        <select
          className="input-crm mb-2"
          value={filters.owner}
          onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}
        >
          <option value="">(Todos)</option>
          {state.config.owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wide mb-1 block">Origem</label>
        <select
          className="input-crm mb-2"
          value={filters.source}
          onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
        >
          <option value="">(Todos)</option>
          {state.config.sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wide mb-1 block">Serviços</label>
        <select
          className="input-crm mb-2"
          value={filters.service}
          onChange={e => setFilters(f => ({ ...f, service: e.target.value }))}
        >
          <option value="">(Todos)</option>
          {state.config.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wide mb-1 block">Funil</label>
        <select
          className="input-crm mb-3"
          value={filters.pipeline}
          onChange={e => setFilters(f => ({ ...f, pipeline: e.target.value }))}
        >
          <option value="">Todos</option>
          {state.pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wide mb-2 block">Período</label>
        <div className="flex gap-2 mb-2">
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handlePeriodClick(opt.value)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                filters.period === opt.value
                  ? 'bg-primary/25 border-primary text-primary'
                  : 'bg-white/5 border-border text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <label className="text-[11px] text-muted-foreground mb-1 block">Ou selecione mês</label>
        <input
          type="month"
          className="input-crm"
          value={filters.month}
          onChange={e => handleMonthChange(e.target.value)}
        />
      </div>
    </aside>
  );
}