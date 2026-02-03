import { useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { fmtBRL } from '@/lib/crm-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#c8a24a', '#00E676', '#5b9bd5', '#ff5a5f', '#9b59b6', '#e67e22'];

export function ReportsView() {
  const { state } = useCRM();

  const reportData = useMemo(() => {
    const leads = state.leads;
    
    // General KPIs
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.stage === 'Fechado');
    const lostLeads = leads.filter(l => l.stage === 'Perdeu');
    const activeLeads = leads.filter(l => l.stage !== 'Fechado' && l.stage !== 'Perdeu');
    const totalMRR = wonLeads.reduce((a, b) => a + (Number(b.mrr) || 0), 0);
    const pipelineMRR = activeLeads.reduce((a, b) => a + (Number(b.mrr) || 0), 0);
    const avgTicket = wonLeads.length > 0 ? totalMRR / wonLeads.length : 0;
    const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;
    const winRate = (wonLeads.length + lostLeads.length) > 0 
      ? (wonLeads.length / (wonLeads.length + lostLeads.length)) * 100 : 0;
    
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

    // By Owner (Vendedor)
    const ownerMap = new Map<string, { count: number; won: number; mrr: number }>();
    leads.forEach(l => {
      const owner = l.owner || 'Sem vendedor';
      const curr = ownerMap.get(owner) || { count: 0, won: 0, mrr: 0 };
      curr.count++;
      if (l.stage === 'Fechado') {
        curr.won++;
        curr.mrr += Number(l.mrr) || 0;
      }
      ownerMap.set(owner, curr);
    });

    // By Service
    const serviceMap = new Map<string, { count: number; won: number; mrr: number }>();
    leads.forEach(l => {
      const service = l.service || 'Sem serviço';
      const curr = serviceMap.get(service) || { count: 0, won: 0, mrr: 0 };
      curr.count++;
      if (l.stage === 'Fechado') {
        curr.won++;
        curr.mrr += Number(l.mrr) || 0;
      }
      serviceMap.set(service, curr);
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

    // Monthly data for line chart
    const monthlyData: { month: string; leads: number; won: number; mrr: number }[] = [];
    const monthMap = new Map<string, { leads: number; won: number; mrr: number }>();
    leads.forEach(l => {
      const month = l.createdAt?.slice(0, 7) || '';
      if (month) {
        const curr = monthMap.get(month) || { leads: 0, won: 0, mrr: 0 };
        curr.leads++;
        if (l.stage === 'Fechado') {
          curr.won++;
          curr.mrr += Number(l.mrr) || 0;
        }
        monthMap.set(month, curr);
      }
    });
    Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .forEach(([month, data]) => {
        const [year, m] = month.split('-');
        monthlyData.push({
          month: `${m}/${year.slice(2)}`,
          ...data
        });
      });

    return {
      kpis: { totalLeads, wonLeads: wonLeads.length, lostLeads: lostLeads.length, activeLeads: activeLeads.length, totalMRR, pipelineMRR, avgTicket, conversionRate, winRate },
      bySource: Array.from(sourceMap.entries()).map(([source, data]) => ({ name: source || 'N/A', ...data })),
      byOwner: Array.from(ownerMap.entries()).map(([name, data]) => ({ name, ...data })),
      byService: Array.from(serviceMap.entries()).map(([name, data]) => ({ name, value: data.mrr, count: data.count, won: data.won })),
      byReferrer: Array.from(referrerMap.entries()).map(([referrer, data]) => ({ referrer, ...data })),
      monthlyData,
    };
  }, [state.leads]);

  const totalReferrals = reportData.byReferrer.reduce((a, b) => ({
    count: a.count + b.count,
    won: a.won + b.won,
    mrr: a.mrr + b.mrr,
    commission: a.commission + b.commission,
  }), { count: 0, won: 0, mrr: 0, commission: 0 });

  return (
    <div className="animate-fade-in space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Leads</p>
          <p className="text-2xl font-bold text-foreground">{reportData.kpis.totalLeads}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Fechados</p>
          <p className="text-2xl font-bold text-success">{reportData.kpis.wonLeads}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Perdidos</p>
          <p className="text-2xl font-bold text-destructive">{reportData.kpis.lostLeads}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">MRR Total</p>
          <p className="text-2xl font-bold text-primary">{fmtBRL(reportData.kpis.totalMRR)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pipeline</p>
          <p className="text-2xl font-bold text-primary">{fmtBRL(reportData.kpis.pipelineMRR)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Ticket Médio</p>
          <p className="text-2xl font-bold text-foreground">{fmtBRL(reportData.kpis.avgTicket)}</p>
        </div>
      </div>

      {/* Conversion KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{reportData.kpis.conversionRate.toFixed(1)}%</span>
          </div>
          <div>
            <p className="text-sm font-medium">Taxa de Conversão</p>
            <p className="text-xs text-muted-foreground">Leads → Fechados</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-success">{reportData.kpis.winRate.toFixed(1)}%</span>
          </div>
          <div>
            <p className="text-sm font-medium">Win Rate</p>
            <p className="text-xs text-muted-foreground">Fechados vs Perdidos</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-info/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-info">{reportData.kpis.activeLeads}</span>
          </div>
          <div>
            <p className="text-sm font-medium">Em Negociação</p>
            <p className="text-xs text-muted-foreground">Leads ativos no funil</p>
          </div>
        </div>
      </div>

      {/* Ranking de Indicações */}
      <div className="bg-card border border-border rounded-[22px] panel-shadow p-5">
        <h3 className="text-sm font-medium mb-3">📊 Ranking de Indicações</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Top Indicador</th>
                <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Indicações</th>
                <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Fechados</th>
                <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">MRR</th>
                <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Comissão</th>
                <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {reportData.byReferrer.length === 0 && (
                <tr><td colSpan={6} className="p-3 text-center text-muted-foreground">Sem indicações registradas</td></tr>
              )}
              {reportData.byReferrer.sort((a, b) => b.mrr - a.mrr).map(ref => (
                <tr key={ref.referrer} className="hover:bg-white/[0.02]">
                  <td className="p-3 border-b border-border font-medium">{ref.referrer}</td>
                  <td className="p-3 border-b border-border">{ref.count}</td>
                  <td className="p-3 border-b border-border text-success">{ref.won}</td>
                  <td className="p-3 border-b border-border text-primary">{fmtBRL(ref.mrr)}</td>
                  <td className="p-3 border-b border-border">{ref.isBarter ? 'Permuta' : fmtBRL(ref.commission)}</td>
                  <td className="p-3 border-b border-border">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${ref.isBarter ? 'text-info border-info/30 bg-info/10' : 'text-primary border-primary/30 bg-primary/10'}`}>
                      {ref.isBarter ? '🤝 Permuta' : '💰 Dinheiro'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {reportData.byReferrer.length > 0 && (
              <tfoot>
                <tr className="bg-white/[0.02] font-semibold">
                  <td className="p-3">Total</td>
                  <td className="p-3">{totalReferrals.count}</td>
                  <td className="p-3 text-success">{totalReferrals.won}</td>
                  <td className="p-3 text-primary">{fmtBRL(totalReferrals.mrr)}</td>
                  <td className="p-3">{fmtBRL(totalReferrals.commission)}</td>
                  <td className="p-3">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MRR por Origem - Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium mb-4">📈 MRR por Origem</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.bySource} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [fmtBRL(value), 'MRR']}
                />
                <Bar dataKey="mrr" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads por Vendedor - Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium mb-4">👥 Performance por Vendedor</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.byOwner} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="count" name="Total" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="won" name="Fechados" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Serviço - Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium mb-4">🎯 MRR por Serviço</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.byService.filter(s => s.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  {reportData.byService.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(value: number) => [fmtBRL(value), 'MRR']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolução Mensal - Line Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium mb-4">📅 Evolução Mensal</h3>
          <div className="h-[280px]">
            {reportData.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="leads" name="Leads" stroke="hsl(var(--info))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="won" name="Fechados" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Sem dados mensais suficientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Por Origem */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">🎯 Por Origem</h3>
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
                  <tr key={src.name} className="hover:bg-white/[0.02]">
                    <td className="p-3 border-b border-border">{src.name}</td>
                    <td className="p-3 border-b border-border">{src.count}</td>
                    <td className="p-3 border-b border-border text-success">{src.won}</td>
                    <td className="p-3 border-b border-border text-primary">{fmtBRL(src.mrr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Por Vendedor */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">👤 Por Vendedor</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Vendedor</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Leads</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">Fechados</th>
                  <th className="text-left p-3 text-muted-foreground font-medium border-b border-border">MRR</th>
                </tr>
              </thead>
              <tbody>
                {reportData.byOwner.length === 0 && (
                  <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">Sem dados</td></tr>
                )}
                {reportData.byOwner.sort((a, b) => b.mrr - a.mrr).map(owner => (
                  <tr key={owner.name} className="hover:bg-white/[0.02]">
                    <td className="p-3 border-b border-border">{owner.name}</td>
                    <td className="p-3 border-b border-border">{owner.count}</td>
                    <td className="p-3 border-b border-border text-success">{owner.won}</td>
                    <td className="p-3 border-b border-border text-primary">{fmtBRL(owner.mrr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
