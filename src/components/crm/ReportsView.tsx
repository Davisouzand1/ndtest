import { useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { fmtBRL } from '@/lib/crm-types';

export function ReportsView() {
  const { state, filters } = useCRM();

  const reportData = useMemo(() => {
    const leads = state.leads;
    
    // By Source
    const sourceMap = new Map<string, { count: number; won: number; mrr: number }>();
    leads.forEach(l => {
      const curr = sourceMap.get(l.source) || { count: 0, won: 0, mrr: 0 };
      curr.count++;
      if (l.stage === 'Fechado') {
        curr.won++;
        curr.mrr += Number(l.mrr) || 0;
      }
      sourceMap.set(l.source, curr);
    });

    // By Referrer
    const referrerMap = new Map<string, { count: number; won: number; mrr: number; commission: number; isBarter: boolean }>();
    leads.filter(l => l.isReferral && l.referrer).forEach(l => {
      const curr = referrerMap.get(l.referrer) || { count: 0, won: 0, mrr: 0, commission: 0, isBarter: false };
      curr.count++;
      if (l.stage === 'Fechado') {
        curr.won++;
        curr.mrr += Number(l.mrr) || 0;
        if (l.commissionType === 'barter') {
          curr.isBarter = true;
        } else {
          curr.commission += Number(l.commission) || 0;
        }
      }
      referrerMap.set(l.referrer, curr);
    });

    return {
      bySource: Array.from(sourceMap.entries()).map(([source, data]) => ({ source, ...data })),
      byReferrer: Array.from(referrerMap.entries()).map(([referrer, data]) => ({ referrer, ...data })),
    };
  }, [state.leads]);

  const totalReferrals = reportData.byReferrer.reduce((a, b) => ({
    count: a.count + b.count,
    won: a.won + b.won,
    mrr: a.mrr + b.mrr,
    commission: a.commission + b.commission,
  }), { count: 0, won: 0, mrr: 0, commission: 0 });

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-[22px] panel-shadow p-5">
        <div className="mb-5">
          <h2 className="text-base font-medium">Relatórios</h2>
          <p className="text-xs text-muted-foreground">Baseado no período selecionado + filtros globais.</p>
        </div>

        {/* Ranking de Indicações */}
        <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-5">
          <h3 className="text-sm font-medium mb-3">Ranking de Indicações</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Top Indicador</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Leads Indicados</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Indicações</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Fechados</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">MRR</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Comissão</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {reportData.byReferrer.length === 0 && (
                  <tr><td colSpan={7} className="p-3 text-center text-muted-foreground">Sem indicações</td></tr>
                )}
                {reportData.byReferrer.sort((a, b) => b.mrr - a.mrr).map(ref => (
                  <tr key={ref.referrer} className="hover:bg-white/[0.02]">
                    <td className="p-3 border-b border-border font-medium">{ref.referrer}</td>
                    <td className="p-3 border-b border-border">-</td>
                    <td className="p-3 border-b border-border">{ref.count}</td>
                    <td className="p-3 border-b border-border text-success">{ref.won}</td>
                    <td className="p-3 border-b border-border text-primary">{fmtBRL(ref.mrr)}</td>
                    <td className="p-3 border-b border-border">{ref.isBarter ? 'Permuta' : fmtBRL(ref.commission)}</td>
                    <td className="p-3 border-b border-border">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${ref.isBarter ? 'text-info border-info/30 bg-info/10' : 'badge-gold'}`}>
                        {ref.isBarter ? '🤝 Permuta' : '💰 Dinheiro'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white/[0.02] font-semibold">
                  <td className="p-3">Total</td>
                  <td className="p-3">-</td>
                  <td className="p-3">{totalReferrals.count}</td>
                  <td className="p-3 text-success">{totalReferrals.won}</td>
                  <td className="p-3 text-primary">{fmtBRL(totalReferrals.mrr)}</td>
                  <td className="p-3">{fmtBRL(totalReferrals.commission)}</td>
                  <td className="p-3">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Por Origem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-secondary/50 border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Por origem</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Origem</th>
                    <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Leads</th>
                    <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Fechados</th>
                    <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.bySource.length === 0 && (
                    <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">Sem dados</td></tr>
                  )}
                  {reportData.bySource.sort((a, b) => b.mrr - a.mrr).map(src => (
                    <tr key={src.source} className="hover:bg-white/[0.02]">
                      <td className="p-3 border-b border-border">{src.source}</td>
                      <td className="p-3 border-b border-border">{src.count}</td>
                      <td className="p-3 border-b border-border text-success">{src.won}</td>
                      <td className="p-3 border-b border-border text-primary">{fmtBRL(src.mrr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
