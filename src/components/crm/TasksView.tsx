import { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { todayISO } from '@/lib/crm-types';

export function TasksView() {
  const { state, addTask, toggleTask, deleteTask } = useCRM();
  const [taskInput, setTaskInput] = useState('');
  const [taskDate, setTaskDate] = useState(todayISO());
  const [taskLeadId, setTaskLeadId] = useState('');

  const today = todayISO();

  const todayTasks = useMemo(() => {
    return state.tasks.filter(t => t.date === today);
  }, [state.tasks, today]);

  const allTasks = useMemo(() => {
    return state.tasks.filter(t => t.date !== today);
  }, [state.tasks, today]);

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    addTask({
      text: taskInput.trim(),
      date: taskDate,
      leadId: taskLeadId,
      done: false,
    });
    setTaskInput('');
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-[22px] panel-shadow p-5">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-base text-foreground">Gerenciador de Tarefas</h2>
            <p className="text-xs text-muted-foreground">Organize suas atividades.</p>
          </div>
          <span className="text-xs border border-primary/45 text-primary px-3 py-1.5 rounded-full bg-primary/10">
            Pendentes Hoje: <b>{todayTasks.filter(t => !t.done).length}</b>
          </span>
        </div>

        <div className="bg-white/[0.02] border border-border rounded-xl p-4 mb-5">
          <div className="flex flex-wrap gap-3">
            <input
              className="input-crm flex-[3] min-w-[200px]"
              placeholder="Descrição da tarefa..."
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            />
            <select
              className="input-crm flex-[2] min-w-[150px]"
              value={taskLeadId}
              onChange={e => setTaskLeadId(e.target.value)}
            >
              <option value="">(Sem Lead vinculado)</option>
              {state.leads.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <input
              type="date"
              className="input-crm flex-1 min-w-[130px]"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
            />
            <button onClick={handleAddTask} className="btn-gold whitespace-nowrap">
              + Adicionar
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1">
            <div className="text-sm font-medium text-primary border-b border-border pb-2 mb-3">📅 Vence Hoje</div>
            <div className="flex flex-col gap-2">
              {todayTasks.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma tarefa para hoje</p>
              )}
              {todayTasks.map(task => (
                <TaskItem key={task.id} task={task} leads={state.leads} onToggle={toggleTask} onDelete={deleteTask} isToday />
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium border-b border-border pb-2 mb-3">📋 Lista Geral</div>
            <div className="flex flex-col gap-2">
              {allTasks.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma outra tarefa</p>
              )}
              {allTasks.map(task => (
                <TaskItem key={task.id} task={task} leads={state.leads} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: { id: string; text: string; date: string; leadId: string; done: boolean };
  leads: { id: string; name: string }[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToday?: boolean;
}

function TaskItem({ task, leads, onToggle, onDelete, isToday }: TaskItemProps) {
  const lead = leads.find(l => l.id === task.leadId);

  return (
    <div className={`flex gap-3 items-center bg-white/[0.02] border border-border p-3 rounded-xl transition-all ${task.done ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 accent-primary cursor-pointer"
      />
      <span className={`flex-1 text-sm ${task.done ? 'line-through text-muted-foreground' : ''}`}>
        {task.text}
        {lead && <span className="text-xs text-muted-foreground ml-2">({lead.name})</span>}
      </span>
      <span className={`text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] ${isToday ? 'text-primary border border-primary/30' : 'text-muted-foreground'}`}>
        {task.date.split('-').reverse().join('/')}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="text-destructive hover:text-destructive/80 text-sm"
      >
        ✕
      </button>
    </div>
  );
}
