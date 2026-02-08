import { useCRM } from '@/contexts/CRMContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const periodOptions = [
  { value: '7', label: '7d' },
  { value: '14', label: '14d' },
  { value: '30', label: '30d' },
];

export function FiltersPopover() {
  const { state, filters, setFilters, clearFilters } = useCRM();

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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border/60 bg-card/50 hover:bg-card">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-card border-border" align="end">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4 text-primary" />
            Filtros
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <input
            className="input-crm"
            placeholder="Buscar: nome, empresa..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1 block">Vendedor</label>
              <select
                className="input-crm text-sm"
                value={filters.owner}
                onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}
              >
                <option value="">(Todos)</option>
                {state.config.owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1 block">Origem</label>
              <select
                className="input-crm text-sm"
                value={filters.source}
                onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
              >
                <option value="">(Todos)</option>
                {state.config.sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1 block">Serviços</label>
              <select
                className="input-crm text-sm"
                value={filters.service}
                onChange={e => setFilters(f => ({ ...f, service: e.target.value }))}
              >
                <option value="">(Todos)</option>
                {state.config.services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1 block">Funil</label>
              <select
                className="input-crm text-sm"
                value={filters.pipeline}
                onChange={e => setFilters(f => ({ ...f, pipeline: e.target.value }))}
              >
                <option value="">Todos</option>
                {state.pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2 block">Período</label>
            <div className="flex gap-2">
              {periodOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handlePeriodClick(opt.value)}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                    filters.period === opt.value
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Ou selecione mês</label>
            <input
              type="month"
              className="input-crm text-sm"
              value={filters.month}
              onChange={e => handleMonthChange(e.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
