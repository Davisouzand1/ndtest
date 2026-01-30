import { useState } from 'react';
import { CRMProvider } from '@/contexts/CRMContext';
import { Sidebar } from '@/components/crm/Sidebar';
import { Topbar } from '@/components/crm/Topbar';
import { KanbanView } from '@/components/crm/KanbanView';
import { TasksView } from '@/components/crm/TasksView';
import { FinancialView } from '@/components/crm/FinancialView';
import { ContractsView } from '@/components/crm/ContractsView';
import { ReportsView } from '@/components/crm/ReportsView';
import { ConfigView } from '@/components/crm/ConfigView';
import { LeadModal } from '@/components/crm/LeadModal';

const tabTitles: Record<string, string> = {
  kanban: 'CRM • Funis de Agência',
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
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-5 overflow-auto">
        <Topbar
          title={tabTitles[activeTab] || 'CRM'}
          onNewLead={openNewLead}
        />

        {activeTab === 'kanban' && <KanbanView onEditLead={openEditLead} />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'financial' && <FinancialView />}
        {activeTab === 'contracts' && <ContractsView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'config' && <ConfigView />}

        <LeadModal
          open={leadModalOpen}
          onOpenChange={setLeadModalOpen}
          leadId={editingLeadId}
        />
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around z-50">
        <button onClick={() => setActiveTab('kanban')} className={`p-2 rounded-lg ${activeTab === 'kanban' ? 'text-primary' : 'text-muted-foreground'}`}>📌</button>
        <button onClick={() => setActiveTab('tasks')} className={`p-2 rounded-lg ${activeTab === 'tasks' ? 'text-primary' : 'text-muted-foreground'}`}>✅</button>
        <button onClick={() => setActiveTab('financial')} className={`p-2 rounded-lg ${activeTab === 'financial' ? 'text-primary' : 'text-muted-foreground'}`}>💰</button>
        <button onClick={() => setActiveTab('contracts')} className={`p-2 rounded-lg ${activeTab === 'contracts' ? 'text-primary' : 'text-muted-foreground'}`}>📜</button>
        <button onClick={() => setActiveTab('reports')} className={`p-2 rounded-lg ${activeTab === 'reports' ? 'text-primary' : 'text-muted-foreground'}`}>📊</button>
        <button onClick={() => setActiveTab('config')} className={`p-2 rounded-lg ${activeTab === 'config' ? 'text-primary' : 'text-muted-foreground'}`}>⚙️</button>
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
