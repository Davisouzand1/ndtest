export interface Lead {
  id: string;
  name: string;
  company: string;
  contact: string;
  pipeline: string;
  stage: string;
  source: string;
  service: string;
  owner: string;
  mrr: number;
  setup: number;
  commission: number;
  barterDesc: string;
  commissionType: 'money' | 'barter';
  nextAction: string;
  isReferral: boolean;
  referrer: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  text: string;
  date: string;
  leadId: string;
  done: boolean;
  createdAt: string;
}

export interface FinanceItem {
  id: string;
  desc: string;
  val: number;
  type: 'in' | 'out';
  cat: string;
  date: string;
  status: 'paid' | 'pending';
  leadId: string;
}

export interface Contract {
  id: string;
  leadId: string;
  service: string;
  val: number;
  start: string;
  end: string;
  status: 'active' | 'suspended' | 'cancelled';
}

export interface Pipeline {
  id: string;
  name: string;
  stages: string[];
}

export interface CRMConfig {
  sources: string[];
  services: string[];
  owners: string[];
}

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface CRMState {
  leads: Lead[];
  tasks: Task[];
  finance: {
    in: FinanceItem[];
    out: FinanceItem[];
  };
  contracts: Contract[];
  pipelines: Pipeline[];
  config: CRMConfig;
  goals: Goals;
  ui: {
    presetDays?: number;
    month?: string;
  };
}

export const DEFAULT_PIPELINES: Pipeline[] = [
  { id: "prospeccao", name: "Prospecção Ativa", stages: ["Lista / Target", "Contato realizado", "Respondeu", "Reunião", "Desqualificado"] },
  { id: "vendas", name: "Vendas", stages: ["Diagnóstico", "Proposta", "Negociação", "Fechado", "Perdeu"] }
];

export const DEFAULT_CONFIG: CRMConfig = {
  sources: ["Meta Ads", "Google Ads", "Indicação", "Outbound", "Orgânico"],
  services: ["Tráfego Pago", "Gestão Redes Sociais", "Web Design", "Full Service"],
  owners: ["Comercial 1", "Comercial 2"]
};

export const uid = () => "ID" + Math.random().toString(16).slice(2) + Date.now().toString(16);
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const fmtBRL = (n: number) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const cleanPhone = (str: string) => {
  const num = str.replace(/\D/g, '');
  if (num.length < 10) return null;
  if (num.length === 10 || num.length === 11) return '55' + num;
  return num;
};
