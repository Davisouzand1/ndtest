import { useMemo, useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { fmtBRL } from '@/lib/crm-types';
import { Target, TrendingUp, Edit2, Check, X, ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewPeriod = 'daily' | 'weekly' | 'monthly';

export function GoalsCard() {
  const { state, updateGoals } = useCRM();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(state.goals);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');

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

  const periodConfig = {
    daily: { label: 'Dia', icon: '📅', fullLabel: 'Meta do Dia' },
    weekly: { label: 'Semana', icon: '📆', fullLabel: 'Meta da Semana' },
    monthly: { label: 'Mês', icon: '🗓️', fullLabel: 'Meta do Mês' },
  };

  const currentPeriod = periodConfig[viewPeriod];
  const currentData = progress[viewPeriod];

  return (
    <div className="kpi-card gold mb-4 md:mb-6">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 md:pb-3 mb-3 md:mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
          <Target className="w-4 h-4" />
          <span className="tracking-wider">Metas de Vendas</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={viewPeriod} onValueChange={(val) => setViewPeriod(val as ViewPeriod)}>
            <SelectTrigger className="h-7 w-[100px] text-xs bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="daily" className="text-xs">Dia</SelectItem>
              <SelectItem value="weekly" className="text-xs">Semana</SelectItem>
              <SelectItem value="monthly" className="text-xs">Mês</SelectItem>
            </SelectContent>
          </Select>
          
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentPeriod.icon}</span>
          <span className="font-medium">{currentPeriod.fullLabel}</span>
        </div>
        
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">R$</span>
            <input
              type="number"
              className="input-crm py-1.5 text-sm max-w-[200px]"
              value={editValues[viewPeriod]}
              onChange={(e) => setEditValues(prev => ({ ...prev, [viewPeriod]: Number(e.target.value) || 0 }))}
              min={0}
              step={100}
            />
          </div>
        ) : (
          <>
            <div className="relative">
              <Progress 
                value={currentData.percent} 
                className="h-3 bg-muted/50"
              />
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressColor(currentData.percent)}`}
                style={{ width: `${currentData.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-foreground">{fmtBRL(currentData.current)}</span>
              <span className="text-sm text-muted-foreground">/ {fmtBRL(currentData.goal)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className={`w-4 h-4 ${currentData.percent >= 100 ? 'text-success' : 'text-muted-foreground'}`} />
              <span className={`font-bold text-base ${currentData.percent >= 100 ? 'text-success' : currentData.percent >= 70 ? 'text-primary' : 'text-muted-foreground'}`}>
                {currentData.percent.toFixed(0)}%
              </span>
              {currentData.percent >= 100 && <span className="text-success font-medium">✓ Meta Atingida!</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
