import { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Contract, fmtBRL, todayISO } from '@/lib/crm-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ContractsView() {
  const { state, addContract, updateContract, deleteContract } = useCRM();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const [formData, setFormData] = useState({
    leadId: '',
    service: '',
    val: '',
    start: todayISO(),
    end: '',
    status: 'active' as 'active' | 'suspended' | 'cancelled',
  });

  const filteredContracts = useMemo(() => {
    if (!search) return state.contracts;
    return state.contracts.filter(c => {
      const lead = state.leads.find(l => l.id === c.leadId);
      return (lead?.name.toLowerCase() || '').includes(search.toLowerCase()) ||
        c.service.toLowerCase().includes(search.toLowerCase());
    });
  }, [state.contracts, state.leads, search]);

  const totals = useMemo(() => {
    const activeContracts = state.contracts.filter(c => c.status === 'active');
    const activeValue = activeContracts.reduce((a, b) => a + Number(b.val), 0);
    const suspended = state.contracts.filter(c => c.status === 'suspended').length;
    return { total: state.contracts.length, activeValue, suspended };
  }, [state.contracts]);

  const openModal = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        leadId: contract.leadId,
        service: contract.service,
        val: String(contract.val),
        start: contract.start,
        end: contract.end,
        status: contract.status,
      });
    } else {
      setEditingContract(null);
      setFormData({
        leadId: state.leads[0]?.id || '',
        service: '',
        val: '',
        start: todayISO(),
        end: '',
        status: 'active',
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.leadId || !formData.service) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const contract: Omit<Contract, 'id'> = {
      leadId: formData.leadId,
      service: formData.service,
      val: Number(formData.val),
      start: formData.start,
      end: formData.end,
      status: formData.status,
    };

    if (editingContract) {
      updateContract(editingContract.id, contract);
    } else {
      addContract(contract);
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (editingContract && confirm('Excluir este contrato?')) {
      deleteContract(editingContract.id);
      setModalOpen(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="kpi-card success">
          <div className="text-2xl mb-1">📄</div>
          <div className="text-xl font-bold">{totals.total}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Contratos</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xl font-bold text-success">{fmtBRL(totals.activeValue)}/mês</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Receita Recorrente</div>
        </div>
        <div className="kpi-card danger">
          <div className="text-2xl mb-1">⏸️</div>
          <div className="text-xl font-bold">{totals.suspended}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Suspensos</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl panel-shadow overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <input
            className="input-crm w-[200px]"
            placeholder="Buscar contrato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={() => openModal()} className="btn-gold ml-auto">
            + Novo Contrato
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Cliente</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Serviço</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Valor Mensal</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Início</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Fim</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">Nenhum contrato encontrado</td>
                </tr>
              )}
              {filteredContracts.map(contract => {
                const lead = state.leads.find(l => l.id === contract.leadId);
                return (
                  <tr key={contract.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 border-b border-border">{lead?.name || 'Cliente Deletado'}</td>
                    <td className="p-4 border-b border-border">{contract.service}</td>
                    <td className="p-4 border-b border-border">{fmtBRL(contract.val)}</td>
                    <td className="p-4 border-b border-border">{contract.start}</td>
                    <td className="p-4 border-b border-border">{contract.end || '-'}</td>
                    <td className="p-4 border-b border-border">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        contract.status === 'active' ? 'badge-success' :
                        contract.status === 'suspended' ? 'text-warning border-warning/30 bg-warning/10' :
                        'text-destructive border-destructive/30 bg-destructive/10'
                      }`}>
                        {contract.status === 'active' ? 'Ativo' : contract.status === 'suspended' ? 'Suspenso' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-border">
                      <button
                        onClick={() => openModal(contract)}
                        className="px-2 py-1 text-xs rounded bg-white/5 border border-border hover:bg-white/10"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-popover border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContract ? 'Editar' : 'Novo'} Contrato</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cliente (Lead)*</label>
                <select
                  className="input-crm"
                  value={formData.leadId}
                  onChange={e => setFormData(f => ({ ...f, leadId: e.target.value }))}
                >
                  {state.leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Serviço/Objeto*</label>
                <input
                  className="input-crm"
                  value={formData.service}
                  onChange={e => setFormData(f => ({ ...f, service: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-crm"
                  value={formData.val}
                  onChange={e => setFormData(f => ({ ...f, val: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Início</label>
                <input
                  type="date"
                  className="input-crm"
                  value={formData.start}
                  onChange={e => setFormData(f => ({ ...f, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fim (Opcional)</label>
                <input
                  type="date"
                  className="input-crm"
                  value={formData.end}
                  onChange={e => setFormData(f => ({ ...f, end: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <select
                className="input-crm"
                value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value as 'active' | 'suspended' | 'cancelled' }))}
              >
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingContract && (
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 text-sm font-semibold">
                Excluir
              </button>
            )}
            <button onClick={handleSave} className="btn-gold">Salvar Contrato</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
