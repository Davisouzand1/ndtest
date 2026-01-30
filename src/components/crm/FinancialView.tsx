import { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { FinanceItem, fmtBRL, todayISO } from '@/lib/crm-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function FinancialView() {
  const { state, addFinanceItem, updateFinanceItem, deleteFinanceItem } = useCRM();
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);

  const [formData, setFormData] = useState({
    desc: '',
    val: '',
    type: 'in' as 'in' | 'out',
    cat: '',
    date: todayISO(),
    status: 'paid' as 'paid' | 'pending',
    leadId: '',
  });

  const filteredItems = useMemo(() => {
    const items = state.finance[activeTab] || [];
    if (!search) return items;
    return items.filter(i => i.desc.toLowerCase().includes(search.toLowerCase()));
  }, [state.finance, activeTab, search]);

  const totals = useMemo(() => {
    const inItems = state.finance.in || [];
    const outItems = state.finance.out || [];
    const income = inItems.filter(i => i.status === 'paid').reduce((a, b) => a + b.val, 0);
    const expense = outItems.filter(i => i.status === 'paid').reduce((a, b) => a + b.val, 0);
    return { income, expense, balance: income - expense };
  }, [state.finance]);

  const openModal = (type: 'in' | 'out', item?: FinanceItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        desc: item.desc,
        val: String(item.val),
        type: item.type,
        cat: item.cat,
        date: item.date,
        status: item.status,
        leadId: item.leadId,
      });
    } else {
      setEditingItem(null);
      setFormData({
        desc: '',
        val: '',
        type,
        cat: '',
        date: todayISO(),
        status: 'paid',
        leadId: '',
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.desc || !formData.val) {
      alert('Preencha descrição e valor');
      return;
    }

    const item: Omit<FinanceItem, 'id'> = {
      desc: formData.desc,
      val: Number(formData.val),
      type: formData.type,
      cat: formData.cat,
      date: formData.date,
      status: formData.status,
      leadId: formData.leadId,
    };

    if (editingItem) {
      updateFinanceItem(editingItem.id, editingItem.type, item);
    } else {
      addFinanceItem(item);
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (editingItem && confirm('Excluir esta movimentação?')) {
      deleteFinanceItem(editingItem.id, editingItem.type);
      setModalOpen(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="kpi-card success">
          <div className="text-xs font-bold text-success uppercase mb-2">Entradas (Mês)</div>
          <div className="text-2xl font-bold text-success">{fmtBRL(totals.income)}</div>
        </div>
        <div className="kpi-card danger">
          <div className="text-xs font-bold text-destructive uppercase mb-2">Saídas (Mês)</div>
          <div className="text-2xl font-bold text-destructive">{fmtBRL(totals.expense)}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Saldo</div>
          <div className="text-2xl font-bold text-primary">{fmtBRL(totals.balance)}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl panel-shadow overflow-hidden">
        {/* Tab Switcher */}
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setActiveTab('in')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'in' ? 'bg-white/5 text-foreground shadow' : 'text-muted-foreground'}`}
            >
              Entradas
            </button>
            <button
              onClick={() => setActiveTab('out')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'out' ? 'bg-white/5 text-foreground shadow' : 'text-muted-foreground'}`}
            >
              Saídas
            </button>
          </div>

          <input
            className="input-crm w-[200px]"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <button
            onClick={() => openModal(activeTab)}
            className={`ml-auto btn-gold ${activeTab === 'out' ? 'bg-destructive/20 text-destructive border border-destructive/30 shadow-none' : ''}`}
          >
            + {activeTab === 'in' ? 'Nova Entrada' : 'Nova Despesa'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Descrição</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">{activeTab === 'in' ? 'Cliente' : 'Categoria'}</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Valor</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Data</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium border-b border-border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum item encontrado</td>
                </tr>
              )}
              {filteredItems.map(item => {
                const lead = state.leads.find(l => l.id === item.leadId);
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 border-b border-border">{item.desc}</td>
                    <td className="p-4 border-b border-border">{activeTab === 'in' ? (lead?.name || '-') : (item.cat || '-')}</td>
                    <td className="p-4 border-b border-border">{fmtBRL(item.val)}</td>
                    <td className="p-4 border-b border-border">{item.date?.split('-').reverse().join('/') || '-'}</td>
                    <td className="p-4 border-b border-border">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.status === 'paid' ? 'badge-success' : 'text-destructive border-destructive/30 bg-destructive/10'}`}>
                        {item.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-border">
                      <button
                        onClick={() => openModal(activeTab, item)}
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
        <DialogContent className="bg-popover border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar' : 'Nova'} Movimentação</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Descrição*</label>
              <input
                className="input-crm"
                placeholder="Ex: Pagamento Mensalidade"
                value={formData.desc}
                onChange={e => setFormData(f => ({ ...f, desc: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)*</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-crm"
                  value={formData.val}
                  onChange={e => setFormData(f => ({ ...f, val: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                <select
                  className="input-crm"
                  value={formData.type}
                  onChange={e => setFormData(f => ({ ...f, type: e.target.value as 'in' | 'out' }))}
                >
                  <option value="in">Entrada (Receita)</option>
                  <option value="out">Saída (Despesa)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                <input
                  className="input-crm"
                  placeholder="Ex: Marketing"
                  value={formData.cat}
                  onChange={e => setFormData(f => ({ ...f, cat: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Data</label>
                <input
                  type="date"
                  className="input-crm"
                  value={formData.date}
                  onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cliente</label>
                <select
                  className="input-crm"
                  value={formData.leadId}
                  onChange={e => setFormData(f => ({ ...f, leadId: e.target.value }))}
                >
                  <option value="">Avulso</option>
                  {state.leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <select
                  className="input-crm"
                  value={formData.status}
                  onChange={e => setFormData(f => ({ ...f, status: e.target.value as 'paid' | 'pending' }))}
                >
                  <option value="paid">Pago / Recebido</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingItem && (
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 text-sm font-semibold">
                Excluir
              </button>
            )}
            <button onClick={handleSave} className="btn-gold">Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
