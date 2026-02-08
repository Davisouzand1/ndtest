import { useCRM } from '@/contexts/CRMContext';
import logo from '@/assets/logo.png';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'kanban', icon: '📌', label: 'CRM', showCount: true },
  { id: 'goals', icon: '🎯', label: 'Metas' },
  { id: 'agenda', icon: '📅', label: 'Agenda', showMeetingCount: true },
  { id: 'tasks', icon: '✅', label: 'Tarefas' },
  { id: 'financial', icon: '💰', label: 'Financeiro' },
  { id: 'contracts', icon: '📜', label: 'Contratos' },
  { id: 'reports', icon: '📊', label: 'Relatórios' },
  { id: 'config', icon: '⚙️', label: 'Configurações' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { state } = useCRM();

  return (
    <aside className="hidden md:flex sidebar-modern w-[220px]">
      <div className="flex justify-center items-center pb-6 border-b border-border/40 mb-6">
        <img src={logo} alt="ND Digital" className="h-16 w-auto object-contain drop-shadow-lg" />
      </div>

      <nav className="flex flex-col gap-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.showCount && (
              <span className="ml-auto text-[11px] text-primary border border-primary/40 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 font-semibold">
                {state.leads.length}
              </span>
            )}
            {tab.showMeetingCount && state.meetings.length > 0 && (
              <span className="ml-auto text-[11px] text-primary border border-primary/40 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 font-semibold">
                {state.meetings.length}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}