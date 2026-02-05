import { useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Lead, fmtBRL, cleanPhone } from '@/lib/crm-types';
import { GoalsCard } from './GoalsCard';

interface KanbanViewProps {
  onEditLead: (id: string) => void;
}

export function KanbanView({ onEditLead }: KanbanViewProps) {
  const { state, filters, moveLead } = useCRM();

  const currentPipeline = useMemo(() => {
    return state.pipelines.find(p => p.id === (filters.pipeline || state.pipelines[0]?.id)) || state.pipelines[0];
  }, [state.pipelines, filters.pipeline]);

  const filteredLeads = useMemo(() => {
    return state.leads.filter(l => {
      if (filters.pipeline && l.pipeline !== filters.pipeline) return false;
      if (!filters.pipeline && l.pipeline !== currentPipeline?.id) return false;
      
      const q = filters.search.toLowerCase();
      if (q && !l.name.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q)) return false;
      if (filters.owner && l.owner !== filters.owner) return false;
      if (filters.source && l.source !== filters.source) return false;
      if (filters.service && l.service !== filters.service) return false;
      return true;
    });
  }, [state.leads, filters, currentPipeline]);

  const kpis = useMemo(() => {
    const won = filteredLeads.filter(l => l.stage === "Fechado");
    const active = filteredLeads.filter(l => l.stage !== "Fechado" && l.stage !== "Perdeu");
    const total = filteredLeads.length;
    const wonMRR = won.reduce((a, b) => a + (Number(b.mrr) || 0), 0);
    const pipeMRR = active.reduce((a, b) => a + (Number(b.mrr) || 0), 0);
    const avgTicket = won.length > 0 ? wonMRR / won.length : 0;
    const convRate = total > 0 ? ((won.length / total) * 100).toFixed(1) : '0';
    const refLeads = filteredLeads.filter(l => l.isReferral);
    const refWon = refLeads.filter(l => l.stage === "Fechado");
    const refConv = refLeads.length > 0 ? ((refWon.length / refLeads.length) * 100).toFixed(1) : '0';

    return {
      active: active.length,
      won: won.length,
      inProgress: active.length,
      pipeMRR,
      wonMRR,
      avgTicket,
      convRate,
      winRate: convRate,
      refConv,
    };
  }, [filteredLeads]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('id', id);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (id && currentPipeline) {
      moveLead(id, currentPipeline.id, stage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!currentPipeline) {
    return <div className="text-muted-foreground">Nenhum funil configurado</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Goals Card */}
      <GoalsCard />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-4 md:mb-6">
        <div className="kpi-card gold">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-border/40 pb-2 md:pb-3 mb-3 md:mb-4">
            <span className="text-sm md:text-base">📊</span>
            <span className="tracking-wider">Volume</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Ativos</span>
              <b className="text-base md:text-lg">{kpis.active}</b>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Negociação</span>
              <b className="text-base md:text-lg">{kpis.inProgress}</b>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Fechados</span>
              <b className="text-base md:text-lg text-success">{kpis.won}</b>
            </div>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-border/40 pb-2 md:pb-3 mb-3 md:mb-4">
            <span className="text-sm md:text-base">💰</span>
            <span className="tracking-wider">Receita</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Pipeline</span>
              <b className="text-base md:text-lg text-primary">{fmtBRL(kpis.pipeMRR)}</b>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Fechado</span>
              <b className="text-base md:text-lg text-success">{fmtBRL(kpis.wonMRR)}</b>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Ticket Médio</span>
              <b className="text-base md:text-lg">{fmtBRL(kpis.avgTicket)}</b>
            </div>
          </div>
        </div>

        <div className="kpi-card sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-border/40 pb-2 md:pb-3 mb-3 md:mb-4">
            <span className="text-sm md:text-base">🎯</span>
            <span className="tracking-wider">Conversão</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Taxa Geral</span>
              <b className="text-base md:text-lg">{kpis.convRate}%</b>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Win Rate</span>
              <b className="text-base md:text-lg">{kpis.winRate}%</b>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-muted-foreground">Indicações</span>
              <b className="text-base md:text-lg">{kpis.refConv}%</b>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-thin -mx-3 px-3 md:mx-0 md:px-0">
        {currentPipeline.stages.map(stage => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage);
          const stageSum = stageLeads.reduce((a, b) => a + (Number(b.mrr) || 0), 0);

          return (
            <div key={stage} className="min-w-[260px] w-[260px] md:min-w-[290px] md:w-[290px] kanban-column">
              <div className="kanban-header p-3 md:p-4">
                <div>
                  <strong className="text-xs md:text-sm font-semibold">{stage}</strong>
                  <div className="text-[10px] md:text-[11px] text-success font-bold mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-success animate-pulse" />
                    {fmtBRL(stageSum)}
                  </div>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground bg-white/5 px-1.5 md:px-2 py-0.5 rounded-lg">{stageLeads.length}</span>
              </div>

              <div
                className="p-2 md:p-3 flex flex-col gap-2 md:gap-3 min-h-[120px] md:min-h-[140px] flex-1"
                onDrop={e => handleDrop(e, stage)}
                onDragOver={handleDragOver}
              >
                {stageLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onClick={() => onEditLead(lead.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
}

function LeadCard({ lead, onDragStart, onClick }: LeadCardProps) {
  const waLink = lead.contact && cleanPhone(lead.contact) ? `https://wa.me/${cleanPhone(lead.contact)}` : null;

  return (
    <div
      className="crm-card group p-2.5 md:p-3.5"
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <strong className="text-xs md:text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1">{lead.name}</strong>
        <span className="text-[9px] md:text-[10px] text-muted-foreground border border-border/50 bg-white/5 px-1.5 md:px-2 py-0.5 rounded-lg flex-shrink-0">{lead.source}</span>
      </div>
      <div className="mt-2 md:mt-2.5 grid gap-1 md:gap-1.5 text-[11px] md:text-xs text-muted-foreground">
        {lead.company && <div className="flex items-center gap-1 md:gap-1.5 truncate"><span className="text-[10px]">🏢</span> <span className="truncate">{lead.company}</span></div>}
        {lead.contact && <div className="flex items-center gap-1 md:gap-1.5"><span className="text-[10px]">📞</span> {lead.contact}</div>}
        <div className="flex items-center gap-1 md:gap-1.5">
          <span className="text-[10px]">👤</span>
          <span className="truncate">Vendedor: <b className="text-foreground font-medium">{lead.owner || '-'}</b></span>
        </div>
      </div>
      <div className="mt-2 md:mt-3 flex gap-1.5 md:gap-2 flex-wrap">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-semibold rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-emerald-500/20 transition-all duration-200"
          >
            📱 <span className="hidden xs:inline">WhatsApp</span>
          </a>
        )}
        {lead.mrr > 0 && (
          <span className="badge-success text-[9px] md:text-[10px] px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg border font-semibold">{fmtBRL(lead.mrr)}</span>
        )}
      </div>
    </div>
  );
}
