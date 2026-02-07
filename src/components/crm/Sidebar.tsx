import { useCRM } from '@/contexts/CRMContext';
import logo from '@/assets/logo.png';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'kanban', icon: '📌', label: 'CRM', showCount: true },
  { id: 'agenda', icon: '📅', label: 'Agenda', showMeetingCount: true },
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
    <aside className="hidden md:flex sidebar-modern w-[270px]">
      <div className="flex justify-center items-center pb-6 border-b border-border/40 mb-6">
        <img src={logo} alt="ND Digital" className="h-16 w-auto object-contain drop-shadow-lg" />
      </div>

      <nav className="flex flex-col gap-1.5 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.showCount && (
              <span className="ml-auto text-[11px] text-primary border border-primary/40 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 font-semibold">
                {state.leads.length}
              </span>
            )}
            {tab.showMeetingCount && state.meetings.length > 0 && (
              <span className="ml-auto text-[11px] text-primary border border-primary/40 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 font-semibold">
                {state.meetings.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="filter-panel">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="text-base">🔎</span>
          <span className="font-medium uppercase tracking-wider">Filtros globais</span>
        </div>
        <input
          className="input-crm mb-3"
          placeholder="Buscar: nome, empresa..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Vendedor</label>
        <select
          className="input-crm mb-3"
          value={filters.owner}
          onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}
        >
          <option value="">(Todos)</option>
          {state.config.owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Origem</label>
        <select
          className="input-crm mb-3"
          value={filters.source}
          onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
        >
          <option value="">(Todos)</option>
          {state.config.sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Serviços</label>
        <select
          className="input-crm mb-3"
          value={filters.service}
          onChange={e => setFilters(f => ({ ...f, service: e.target.value }))}
        >
          <option value="">(Todos)</option>
          {state.config.services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Funil</label>
        <select
          className="input-crm mb-4"
          value={filters.pipeline}
          onChange={e => setFilters(f => ({ ...f, pipeline: e.target.value }))}
        >
          <option value="">Todos</option>
          {state.pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-2 block">Período</label>
        <div className="flex gap-2 mb-3">
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handlePeriodClick(opt.value)}
              className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                filters.period === opt.value
                  ? 'bg-gradient-to-r from-primary/25 to-primary/15 border-primary text-primary shadow-sm'
                  : 'bg-white/5 border-border/60 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <label className="text-[11px] text-muted-foreground mb-1.5 block">Ou selecione mês</label>
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