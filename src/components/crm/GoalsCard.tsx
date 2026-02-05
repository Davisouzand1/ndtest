import { useMemo, useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { fmtBRL } from '@/lib/crm-types';
import { Target, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function GoalsCard() {
  const { state, updateGoals } = useCRM();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(state.goals);

  // Calculate current progress based on closed leads
  const progress = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    
    // Start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStart = startOfWeek.toISOString().slice(0, 10);
    
    // Start of month
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const closedLeads = state.leads.filter(l => l.stage === 'Fechado');

    const dailyMRR = closedLeads
      .filter(l => l.updatedAt === today)
      .reduce((sum, l) => sum + (Number(l.mrr) || 0), 0);

    const weeklyMRR = closedLeads
      .filter(l => l.updatedAt >= weekStart)
      .reduce((sum, l) => sum + (Number(l.mrr) || 0), 0);

    const monthlyMRR = closedLeads
      .filter(l => l.updatedAt >= monthStart)
      .reduce((sum, l) => sum + (Number(l.mrr) || 0), 0);

    return {
      daily: { current: dailyMRR, goal: state.goals.daily, percent: Math.min(100, (dailyMRR / state.goals.daily) * 100) },
      weekly: { current: weeklyMRR, goal: state.goals.weekly, percent: Math.min(100, (weeklyMRR / state.goals.weekly) * 100) },
      monthly: { current: monthlyMRR, goal: state.goals.monthly, percent: Math.min(100, (monthlyMRR / state.goals.monthly) * 100) },
    };
  }, [state.leads, state.goals]);

  const handleSave = () => {
    updateGoals(editValues);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValues(state.goals);
    setEditing(false);
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-success';
    if (percent >= 70) return 'bg-primary';
    if (percent >= 40) return 'bg-warning';
    return 'bg-destructive/70';
  };

  const goals = [
    { key: 'daily' as const, label: 'Meta do Dia', icon: '📅', data: progress.daily },
    { key: 'weekly' as const, label: 'Meta da Semana', icon: '📆', data: progress.weekly },
    { key: 'monthly' as const, label: 'Meta do Mês', icon: '🗓️', data: progress.monthly },
  ];

  return (
    <div className="kpi-card gold mb-4 md:mb-6">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 md:pb-3 mb-3 md:mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
          <Target className="w-4 h-4" />
          <span className="tracking-wider">Metas de Vendas</span>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Editar metas"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
              title="Salvar"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {goals.map(({ key, label, icon, data }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            
            {editing ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">R$</span>
                <input
                  type="number"
                  className="input-crm py-1.5 text-sm"
                  value={editValues[key]}
                  onChange={(e) => setEditValues(prev => ({ ...prev, [key]: Number(e.target.value) || 0 }))}
                  min={0}
                  step={100}
                />
              </div>
            ) : (
              <>
                <div className="relative">
                  <Progress 
                    value={data.percent} 
                    className="h-2.5 bg-muted/50"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressColor(data.percent)}`}
                    style={{ width: `${data.percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{fmtBRL(data.current)}</span>
                  <span className="text-muted-foreground">/ {fmtBRL(data.goal)}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <TrendingUp className={`w-3 h-3 ${data.percent >= 100 ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className={`font-bold ${data.percent >= 100 ? 'text-success' : data.percent >= 70 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {data.percent.toFixed(0)}%
                  </span>
                  {data.percent >= 100 && <span className="text-success">✓ Atingida!</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
