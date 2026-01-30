import { useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Lead, fmtBRL, cleanPhone } from '@/lib/crm-types';

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
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-bold text-primary uppercase border-b border-border pb-2 mb-3">📊 Volume</div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Ativos</span>
            <b>{kpis.active}</b>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Negociação</span>
            <b>{kpis.inProgress}</b>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fechados</span>
            <b className="text-success">{kpis.won}</b>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-bold text-primary uppercase border-b border-border pb-2 mb-3">💰 Receita</div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Pipeline</span>
            <b className="text-primary">{fmtBRL(kpis.pipeMRR)}</b>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Fechado</span>
            <b className="text-success">{fmtBRL(kpis.wonMRR)}</b>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ticket Médio</span>
            <b>{fmtBRL(kpis.avgTicket)}</b>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-bold text-primary uppercase border-b border-border pb-2 mb-3">🎯 Conversão</div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Taxa Geral</span>
            <b>{kpis.convRate}%</b>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Win Rate</span>
            <b>{kpis.winRate}%</b>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Indicações</span>
            <b>{kpis.refConv}%</b>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {currentPipeline.stages.map(stage => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage);
          const stageSum = stageLeads.reduce((a, b) => a + (Number(b.mrr) || 0), 0);

          return (
            <div key={stage} className="min-w-[280px] w-[280px] border border-border rounded-[18px] bg-card panel-shadow flex flex-col">
              <div className="flex items-center justify-between gap-2 p-3.5 border-b border-border sticky top-0 bg-card rounded-t-[18px] z-[3]">
                <div>
                  <strong className="text-sm">{stage}</strong>
                  <div className="text-[11px] text-success font-bold mt-0.5">{fmtBRL(stageSum)}</div>
                </div>
                <span className="text-sm text-muted-foreground">{stageLeads.length}</span>
              </div>

              <div
                className="p-2.5 flex flex-col gap-2.5 min-h-[120px] flex-1"
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
      className="crm-card"
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <strong className="text-sm">{lead.name}</strong>
        <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">{lead.source}</span>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        {lead.company && <div>{lead.company}</div>}
        {lead.contact && <div>{lead.contact}</div>}
        <div>Vendedor: <b className="text-foreground font-medium">{lead.owner || '-'}</b></div>
      </div>
      <div className="mt-2.5 flex gap-1.5 flex-wrap">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
          >
            📱 WhatsApp
          </a>
        )}
        {lead.mrr > 0 && (
          <span className="badge-success text-[10px] px-2 py-0.5 rounded-full border">{fmtBRL(lead.mrr)}</span>
        )}
      </div>
    </div>
  );
}
