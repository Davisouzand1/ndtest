import { useCRM } from '@/contexts/CRMContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

const periodOptions = [
  { value: '7', label: '7d' },
  { value: '14', label: '14d' },
  { value: '30', label: '30d' },
];

export function MobileFilters() {
  const { state, filters, setFilters } = useCRM();

  const handlePeriodClick = (days: string) => {
    if (filters.period === days) {
      setFilters(f => ({ ...f, period: '', month: '' }));
    } else {
      setFilters(f => ({ ...f, period: days, month: '' }));
    }
  };

  const handleMonthChange = (month: string) => {
    setFilters(f => ({ ...f, month, period: '' }));
  };

  const activeFiltersCount = [
    filters.search,
    filters.owner,
    filters.source,
    filters.service,
    filters.pipeline,
    filters.period,
    filters.month,
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="icon-button relative">
          <Filter className="w-5 h-5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[320px] bg-background border-border overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <span>🔎</span>
            Filtros
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div>
            <input
              className="input-crm"
              placeholder="Buscar: nome, empresa..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Vendedor</label>
            <select
              className="input-crm"
              value={filters.owner}
              onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}
            >
              <option value="">(Todos)</option>
              {state.config.owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Origem</label>
            <select
              className="input-crm"
              value={filters.source}
              onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
            >
              <option value="">(Todos)</option>
              {state.config.sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Serviços</label>
            <select
              className="input-crm"
              value={filters.service}
              onChange={e => setFilters(f => ({ ...f, service: e.target.value }))}
            >
              <option value="">(Todos)</option>
              {state.config.services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1.5 block">Funil</label>
            <select
              className="input-crm"
              value={filters.pipeline}
              onChange={e => setFilters(f => ({ ...f, pipeline: e.target.value }))}
            >
              <option value="">Todos</option>
              {state.pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-2 block">Período</label>
            <div className="flex gap-2">
              {periodOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handlePeriodClick(opt.value)}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                    filters.period === opt.value
                      ? 'bg-gradient-to-r from-primary/25 to-primary/15 border-primary text-primary shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block">Ou selecione mês</label>
            <input
              type="month"
              className="input-crm"
              value={filters.month}
              onChange={e => handleMonthChange(e.target.value)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
