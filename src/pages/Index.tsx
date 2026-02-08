import { useState } from 'react';
import { CRMProvider } from '@/contexts/CRMContext';
import { Sidebar } from '@/components/crm/Sidebar';
import { Topbar } from '@/components/crm/Topbar';
import { KanbanView } from '@/components/crm/KanbanView';
import { GoalsView } from '@/components/crm/GoalsView';
import { AgendaView } from '@/components/crm/AgendaView';
import { TasksView } from '@/components/crm/TasksView';
import { FinancialView } from '@/components/crm/FinancialView';
import { ContractsView } from '@/components/crm/ContractsView';
import { ReportsView } from '@/components/crm/ReportsView';
import { ConfigView } from '@/components/crm/ConfigView';
import { LeadModal } from '@/components/crm/LeadModal';

const tabTitles: Record<string, string> = {
  kanban: 'CRM • Funis de Agência',
  goals: 'Metas de Vendas',
  agenda: 'Agenda de Reuniões',
  tasks: 'Gerenciador de Tarefas',
  financial: 'Gestão Financeira',
  contracts: 'Contratos',
  reports: 'Relatórios',
  config: 'Configurações',
};

function CRMApp() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const openNewLead = () => {
    setEditingLeadId(null);
    setLeadModalOpen(true);
  };

  const openEditLead = (id: string) => {
    setEditingLeadId(id);
    setLeadModalOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-3 md:p-6 overflow-auto pb-20 md:pb-6">
        <Topbar
          title={tabTitles[activeTab] || 'CRM'}
          onNewLead={openNewLead}
        />

        <div className="animate-fade-in">
          {activeTab === 'kanban' && <KanbanView onEditLead={openEditLead} />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'agenda' && <AgendaView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'financial' && <FinancialView />}
          {activeTab === 'contracts' && <ContractsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'config' && <ConfigView />}
        </div>

        <LeadModal
          open={leadModalOpen}
          onOpenChange={setLeadModalOpen}
          leadId={editingLeadId}
        />
      </main>

      <nav className="mobile-nav md:hidden">
        {[
          { id: 'kanban', icon: '📌' },
          { id: 'goals', icon: '🎯' },
          { id: 'agenda', icon: '📅' },
          { id: 'tasks', icon: '✅' },
          { id: 'financial', icon: '💰' },
          { id: 'contracts', icon: '📜' },
          { id: 'reports', icon: '📊' },
          { id: 'config', icon: '⚙️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-2.5 rounded-xl text-lg transition-all duration-200 ${
              activeTab === tab.id 
                ? 'text-primary bg-primary/10 scale-110' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function Index() {
  return (
    <CRMProvider>
      <CRMApp />
    </CRMProvider>
  );
}
