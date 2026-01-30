import { CRMState, DEFAULT_PIPELINES, DEFAULT_CONFIG, Lead, Task, FinanceItem, Contract, Pipeline, CRMConfig } from './crm-types';

const STORAGE_KEY = "nd_crm_v6_fixed";

export function loadState(): CRMState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      leads: [],
      tasks: [],
      finance: { in: [], out: [] },
      contracts: [],
      pipelines: DEFAULT_PIPELINES,
      config: DEFAULT_CONFIG,
      ui: { presetDays: 30 }
    };
  }
  
  const s = JSON.parse(raw) as Partial<CRMState>;
  return {
    leads: s.leads || [],
    tasks: s.tasks || [],
    finance: s.finance || { in: [], out: [] },
    contracts: s.contracts || [],
    pipelines: s.pipelines || DEFAULT_PIPELINES,
    config: {
      owners: s.config?.owners || DEFAULT_CONFIG.owners,
      sources: s.config?.sources || DEFAULT_CONFIG.sources,
      services: s.config?.services || DEFAULT_CONFIG.services,
    },
    ui: s.ui || { presetDays: 30 }
  };
}

export function saveState(state: CRMState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function downloadBackup(state: CRMState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function uploadBackup(file: File): Promise<CRMState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as CRMState);
      } catch {
        reject(new Error('Arquivo inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}
