import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CRMState, Lead, Task, FinanceItem, Contract, Pipeline, uid, todayISO } from '@/lib/crm-types';
import { loadState, saveState } from '@/lib/crm-store';

interface Filters {
  search: string;
  owner: string;
  source: string;
  service: string;
  pipeline: string;
  month: string;
  period: string; // '7', '14', '30' or ''
}

interface CRMContextType {
  state: CRMState;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
  
  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLead: (id: string, pipeline: string, stage: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Finance actions
  addFinanceItem: (item: Omit<FinanceItem, 'id'>) => void;
  updateFinanceItem: (id: string, type: 'in' | 'out', item: Partial<FinanceItem>) => void;
  deleteFinanceItem: (id: string, type: 'in' | 'out') => void;
  
  // Contract actions
  addContract: (contract: Omit<Contract, 'id'>) => void;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  
  // Config actions
  addConfigItem: (key: 'owners' | 'sources' | 'services', value: string) => void;
  removeConfigItem: (key: 'owners' | 'sources' | 'services', value: string) => void;
  
  // Pipeline actions
  addPipeline: (pipeline: Pipeline) => void;
  addStage: (pipelineId: string, stage: string) => void;
  removeStage: (pipelineId: string, stage: string) => void;
  
  // Backup
  restoreBackup: (data: CRMState) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CRMState>(loadState);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    owner: '',
    source: '',
    service: '',
    pipeline: '',
    month: '',
    period: '',
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const clearFilters = useCallback(() => {
    setFilters({ search: '', owner: '', source: '', service: '', pipeline: '', month: '', period: '' });
  }, []);

  // Lead actions
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: uid(),
      createdAt: todayISO(),
      updatedAt: todayISO(),
    };
    setState(s => ({ ...s, leads: [newLead, ...s.leads] }));
  }, []);

  const updateLead = useCallback((id: string, lead: Partial<Lead>) => {
    setState(s => ({
      ...s,
      leads: s.leads.map(l => l.id === id ? { ...l, ...lead, updatedAt: todayISO() } : l)
    }));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setState(s => ({ ...s, leads: s.leads.filter(l => l.id !== id) }));
  }, []);

  const moveLead = useCallback((id: string, pipeline: string, stage: string) => {
    setState(s => ({
      ...s,
      leads: s.leads.map(l => l.id === id ? { ...l, pipeline, stage, updatedAt: todayISO() } : l)
    }));
  }, []);

  // Task actions
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...task, id: uid(), createdAt: todayISO() };
    setState(s => ({ ...s, tasks: [newTask, ...s.tasks] }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, []);

  // Finance actions
  const addFinanceItem = useCallback((item: Omit<FinanceItem, 'id'>) => {
    const newItem: FinanceItem = { ...item, id: uid() };
    setState(s => ({
      ...s,
      finance: {
        ...s.finance,
        [item.type]: [newItem, ...s.finance[item.type]]
      }
    }));
  }, []);

  const updateFinanceItem = useCallback((id: string, type: 'in' | 'out', item: Partial<FinanceItem>) => {
    setState(s => ({
      ...s,
      finance: {
        ...s.finance,
        [type]: s.finance[type].map(i => i.id === id ? { ...i, ...item } : i)
      }
    }));
  }, []);

  const deleteFinanceItem = useCallback((id: string, type: 'in' | 'out') => {
    setState(s => ({
      ...s,
      finance: {
        ...s.finance,
        [type]: s.finance[type].filter(i => i.id !== id)
      }
    }));
  }, []);

  // Contract actions
  const addContract = useCallback((contract: Omit<Contract, 'id'>) => {
    const newContract: Contract = { ...contract, id: uid() };
    setState(s => ({ ...s, contracts: [newContract, ...s.contracts] }));
  }, []);

  const updateContract = useCallback((id: string, contract: Partial<Contract>) => {
    setState(s => ({
      ...s,
      contracts: s.contracts.map(c => c.id === id ? { ...c, ...contract } : c)
    }));
  }, []);

  const deleteContract = useCallback((id: string) => {
    setState(s => ({ ...s, contracts: s.contracts.filter(c => c.id !== id) }));
  }, []);

  // Config actions
  const addConfigItem = useCallback((key: 'owners' | 'sources' | 'services', value: string) => {
    if (!value.trim()) return;
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        [key]: [...s.config[key], value.trim()]
      }
    }));
  }, []);

  const removeConfigItem = useCallback((key: 'owners' | 'sources' | 'services', value: string) => {
    setState(s => ({
      ...s,
      config: {
        ...s.config,
        [key]: s.config[key].filter(v => v !== value)
      }
    }));
  }, []);

  // Pipeline actions
  const addPipeline = useCallback((pipeline: Pipeline) => {
    setState(s => ({ ...s, pipelines: [...s.pipelines, pipeline] }));
  }, []);

  const addStage = useCallback((pipelineId: string, stage: string) => {
    if (!stage.trim()) return;
    setState(s => ({
      ...s,
      pipelines: s.pipelines.map(p =>
        p.id === pipelineId ? { ...p, stages: [...p.stages, stage.trim()] } : p
      )
    }));
  }, []);

  const removeStage = useCallback((pipelineId: string, stage: string) => {
    setState(s => ({
      ...s,
      pipelines: s.pipelines.map(p =>
        p.id === pipelineId ? { ...p, stages: p.stages.filter(st => st !== stage) } : p
      )
    }));
  }, []);

  const restoreBackup = useCallback((data: CRMState) => {
    setState(data);
  }, []);

  return (
    <CRMContext.Provider value={{
      state,
      filters,
      setFilters,
      clearFilters,
      addLead,
      updateLead,
      deleteLead,
      moveLead,
      addTask,
      toggleTask,
      deleteTask,
      addFinanceItem,
      updateFinanceItem,
      deleteFinanceItem,
      addContract,
      updateContract,
      deleteContract,
      addConfigItem,
      removeConfigItem,
      addPipeline,
      addStage,
      removeStage,
      restoreBackup,
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
}
