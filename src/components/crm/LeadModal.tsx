import { useState, useEffect } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Lead, todayISO } from '@/lib/crm-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
}

export function LeadModal({ open, onOpenChange, leadId }: LeadModalProps) {
  const { state, addLead, updateLead, deleteLead } = useCRM();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contact: '',
    pipeline: '',
    stage: '',
    source: '',
    service: '',
    owner: '',
    mrr: '',
    setup: '',
    commissionType: 'money' as 'money' | 'barter',
    commissionMoney: '',
    barterDesc: '',
    nextAction: '',
    isReferral: false,
    referrer: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      if (leadId) {
        const lead = state.leads.find(l => l.id === leadId);
        if (lead) {
          setFormData({
            name: lead.name,
            company: lead.company,
            contact: lead.contact,
            pipeline: lead.pipeline,
            stage: lead.stage,
            source: lead.source,
            service: lead.service,
            owner: lead.owner,
            mrr: String(lead.mrr || ''),
            setup: String(lead.setup || ''),
            commissionType: lead.commissionType || 'money',
            commissionMoney: String(lead.commission || ''),
            barterDesc: lead.barterDesc || '',
            nextAction: lead.nextAction,
            isReferral: lead.isReferral,
            referrer: lead.referrer,
            notes: lead.notes,
          });
        }
      } else {
        setFormData({
          name: '',
          company: '',
          contact: '',
          pipeline: state.pipelines[0]?.id || '',
          stage: state.pipelines[0]?.stages[0] || '',
          source: '',
          service: '',
          owner: '',
          mrr: '',
          setup: '',
          commissionType: 'money',
          commissionMoney: '',
          barterDesc: '',
          nextAction: '',
          isReferral: false,
          referrer: '',
          notes: '',
        });
      }
    }
  }, [open, leadId, state.leads, state.pipelines]);

  const currentPipeline = state.pipelines.find(p => p.id === formData.pipeline);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nome obrigatório');
      return;
    }

    const lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      contact: formData.contact.trim(),
      pipeline: formData.pipeline,
      stage: formData.stage,
      source: formData.source,
      service: formData.service,
      owner: formData.owner,
      mrr: Number(formData.mrr) || 0,
      setup: Number(formData.setup) || 0,
      commission: formData.commissionType === 'money' ? Number(formData.commissionMoney) || 0 : 0,
      barterDesc: formData.commissionType === 'barter' ? formData.barterDesc : '',
      commissionType: formData.commissionType,
      nextAction: formData.nextAction,
      isReferral: formData.isReferral,
      referrer: formData.referrer,
      notes: formData.notes,
    };

    if (leadId) {
      updateLead(leadId, lead);
    } else {
      addLead(lead);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (leadId && confirm('Excluir este lead?')) {
      deleteLead(leadId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-popover to-popover/95 border-border/60 max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-border/40 pb-4">
          <DialogTitle className="text-xl font-bold">{leadId ? '✏️ Editar Lead' : '✨ Novo Lead'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4">
          <div className="md:col-span-4">
            <label className="text-xs text-muted-foreground mb-1 block">Nome*</label>
            <input
              className="input-crm"
              placeholder="Ex: Ana Souza"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-xs text-muted-foreground mb-1 block">Empresa</label>
            <input
              className="input-crm"
              value={formData.company}
              onChange={e => setFormData(f => ({ ...f, company: e.target.value }))}
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-xs text-muted-foreground mb-1 block">Contato</label>
            <input
              className="input-crm"
              placeholder="11 99999-9999"
              value={formData.contact}
              onChange={e => setFormData(f => ({ ...f, contact: e.target.value }))}
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Pipeline</label>
            <select
              className="input-crm"
              value={formData.pipeline}
              onChange={e => {
                const newPipeline = state.pipelines.find(p => p.id === e.target.value);
                setFormData(f => ({
                  ...f,
                  pipeline: e.target.value,
                  stage: newPipeline?.stages[0] || ''
                }));
              }}
            >
              {state.pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Etapa</label>
            <select
              className="input-crm"
              value={formData.stage}
              onChange={e => setFormData(f => ({ ...f, stage: e.target.value }))}
            >
              {currentPipeline?.stages.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Origem</label>
            <select
              className="input-crm"
              value={formData.source}
              onChange={e => setFormData(f => ({ ...f, source: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {state.config.sources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Serviço</label>
            <select
              className="input-crm"
              value={formData.service}
              onChange={e => setFormData(f => ({ ...f, service: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {state.config.services.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Vendedor</label>
            <select
              className="input-crm"
              value={formData.owner}
              onChange={e => setFormData(f => ({ ...f, owner: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {state.config.owners.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">MRR (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input-crm"
              value={formData.mrr}
              onChange={e => setFormData(f => ({ ...f, mrr: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Setup (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input-crm"
              value={formData.setup}
              onChange={e => setFormData(f => ({ ...f, setup: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Próxima ação</label>
            <input
              type="date"
              className="input-crm"
              value={formData.nextAction}
              onChange={e => setFormData(f => ({ ...f, nextAction: e.target.value }))}
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-xs text-muted-foreground mb-1 block">Comissão / Permuta</label>
            <div className="flex gap-1">
              <select
                className="input-crm w-20"
                value={formData.commissionType}
                onChange={e => setFormData(f => ({ ...f, commissionType: e.target.value as 'money' | 'barter' }))}
              >
                <option value="money">💰 R$</option>
                <option value="barter">🤝 Item</option>
              </select>
              {formData.commissionType === 'money' ? (
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input-crm flex-1"
                  value={formData.commissionMoney}
                  onChange={e => setFormData(f => ({ ...f, commissionMoney: e.target.value }))}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Ex: Criação de Site"
                  className="input-crm flex-1"
                  value={formData.barterDesc}
                  onChange={e => setFormData(f => ({ ...f, barterDesc: e.target.value }))}
                />
              )}
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-xs text-muted-foreground mb-1 block">Indicação</label>
            <div className="flex gap-2">
              <select
                className="input-crm w-24"
                value={formData.isReferral ? 'yes' : 'no'}
                onChange={e => setFormData(f => ({ ...f, isReferral: e.target.value === 'yes' }))}
              >
                <option value="no">Não</option>
                <option value="yes">Sim</option>
              </select>
              <input
                className="input-crm flex-1"
                placeholder="Nome do indicador"
                value={formData.referrer}
                onChange={e => setFormData(f => ({ ...f, referrer: e.target.value }))}
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-xs text-muted-foreground mb-1 block">Obs</label>
            <textarea
              className="input-crm min-h-[80px] resize-y"
              value={formData.notes}
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-border/40">
          {leadId && (
            <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive border border-destructive/30 text-sm font-semibold hover:from-destructive/30 hover:to-destructive/20 transition-all duration-200">
              🗑️ Excluir
            </button>
          )}
          <button onClick={handleSave} className="btn-gold">💾 Salvar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
