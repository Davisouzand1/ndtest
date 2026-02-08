import { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { fmtBRL } from '@/lib/crm-types';
import { Target, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiltersPopover } from './FiltersPopover';

type ViewPeriod = 'daily' | 'weekly' | 'monthly';

export function GoalsView() {
  const { state, updateGoals } = useCRM();
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Calculate progress based on closed leads
  const closedLeads = state.leads.filter(l => l.stage === "Fechado");
  const totalMRR = closedLeads.reduce((sum, l) => sum + (Number(l.mrr) || 0), 0);

  // Get current period goal and calculate progress
  const periodConfig = {
    daily: {
      icon: '📅',
      label: 'Meta Diária',
      goal: state.goals?.daily || 0,
      value: totalMRR / 30, // approximate daily
    },
    weekly: {
      icon: '📆',
      label: 'Meta Semanal',
      goal: state.goals?.weekly || 0,
      value: totalMRR / 4, // approximate weekly
    },
    monthly: {
      icon: '🗓️',
      label: 'Meta Mensal',
      goal: state.goals?.monthly || 0,
      value: totalMRR,
    },
  };

  const currentData = periodConfig[viewPeriod];
  const progressPercent = currentData.goal > 0 ? Math.min((currentData.value / currentData.goal) * 100, 100) : 0;
  const isAchieved = progressPercent >= 100;

  const handleEdit = () => {
    setEditValue(String(currentData.goal));
    setIsEditing(true);
  };

  const handleSave = () => {
    const newValue = Number(editValue) || 0;
    updateGoals({ [viewPeriod]: newValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <div className="animate-fade-in">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Select value={viewPeriod} onValueChange={(v: ViewPeriod) => setViewPeriod(v)}>
            <SelectTrigger className="w-[130px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="daily">Dia</SelectItem>
              <SelectItem value="weekly">Semana</SelectItem>
              <SelectItem value="monthly">Mês</SelectItem>
            </SelectContent>
          </Select>
          <FiltersPopover />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Goal Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{currentData.label}</h2>
                <p className="text-sm text-muted-foreground">Acompanhe seu progresso</p>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave}>
                  <Check className="w-4 h-4 text-success" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          {/* Goal Value */}
          <div className="mb-6">
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Meta de MRR
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="text-2xl font-bold h-14"
                placeholder="0"
              />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {fmtBRL(currentData.goal)}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progresso atual</span>
              <span className={`font-bold ${isAchieved ? 'text-success' : 'text-primary'}`}>
                {progressPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-4 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAchieved 
                    ? 'bg-gradient-to-r from-success to-success/80' 
                    : 'bg-gradient-to-r from-primary to-primary/80'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Atingido</span>
              <span className="font-semibold text-foreground">{fmtBRL(currentData.value)}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`mt-6 p-4 rounded-xl border ${
            isAchieved 
              ? 'bg-success/10 border-success/30' 
              : 'bg-primary/10 border-primary/30'
          }`}>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isAchieved ? 'text-success' : 'text-primary'}`} />
              <span className={`font-medium ${isAchieved ? 'text-success' : 'text-primary'}`}>
                {isAchieved ? 'Meta atingida! 🎉' : `Faltam ${fmtBRL(Math.max(0, currentData.goal - currentData.value))}`}
              </span>
            </div>
          </div>
        </div>

        {/* All Goals Summary */}
        <div className="space-y-4">
          {(['daily', 'weekly', 'monthly'] as ViewPeriod[]).map(period => {
            const config = periodConfig[period];
            const percent = config.goal > 0 ? Math.min((config.value / config.goal) * 100, 100) : 0;
            const achieved = percent >= 100;

            return (
              <div
                key={period}
                onClick={() => setViewPeriod(period)}
                className={`glass-card p-4 cursor-pointer transition-all hover:border-primary/50 ${
                  viewPeriod === period ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <span className="font-medium text-foreground">{config.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${achieved ? 'text-success' : 'text-muted-foreground'}`}>
                    {percent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      achieved ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{fmtBRL(config.value)}</span>
                  <span>{fmtBRL(config.goal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
