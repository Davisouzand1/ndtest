import { useState, useRef } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { downloadBackup, uploadBackup } from '@/lib/crm-store';
import { uid } from '@/lib/crm-types';
import { toast } from 'sonner';

export function ConfigView() {
  const { state, addConfigItem, removeConfigItem, addPipeline, addStage, removeStage, restoreBackup } = useCRM();
  const [selectedPipeline, setSelectedPipeline] = useState(state.pipelines[0]?.id || '');
  const [newStage, setNewStage] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newService, setNewService] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPipeline = state.pipelines.find(p => p.id === selectedPipeline);

  const handleDownloadBackup = () => {
    downloadBackup(state);
    toast.success('Backup baixado com sucesso!');
  };

  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadBackup(file);
      restoreBackup(data);
      toast.success('Backup restaurado com sucesso!');
    } catch (error) {
      toast.error('Erro ao restaurar backup');
    }
  };

  const handleAddPipeline = () => {
    const name = prompt('Nome do novo funil:');
    if (name?.trim()) {
      const newPipeline = { id: uid(), name: name.trim(), stages: ['Nova Etapa'] };
      addPipeline(newPipeline);
      setSelectedPipeline(newPipeline.id);
    }
  };

  const handleAddStage = () => {
    if (newStage.trim() && selectedPipeline) {
      addStage(selectedPipeline, newStage.trim());
      setNewStage('');
    }
  };

  const handleAddConfig = (key: 'owners' | 'sources' | 'services', inputValue: string, setInput: (v: string) => void) => {
    if (inputValue.trim()) {
      addConfigItem(key, inputValue.trim());
      setInput('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-[22px] panel-shadow p-5">
        <h2 className="text-base font-medium mb-5">Configurações Gerais</h2>

        {/* Backup */}
        <div className="bg-success/5 border border-success/30 rounded-xl p-4 mb-5">
          <h3 className="text-sm font-medium text-success mb-3">💾 Backup Completo (Dados + Financeiro)</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadBackup} className="btn-gold">
              ⬇️ Baixar Backup (JSON)
            </button>
            <div className="relative overflow-hidden">
              <button className="px-4 py-2.5 rounded-[10px] text-sm font-semibold bg-white/5 border border-border text-foreground hover:bg-white/10">
                ⬆️ Restaurar Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleUploadBackup}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Funis */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
          <h3 className="text-sm font-medium text-primary mb-3">📂 Gerenciar Funis</h3>
          <div className="flex gap-3 mb-3">
            <select
              className="input-crm flex-1"
              value={selectedPipeline}
              onChange={e => setSelectedPipeline(e.target.value)}
            >
              {state.pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button onClick={handleAddPipeline} className="px-4 py-2 rounded-lg bg-white/5 border border-border text-sm font-medium hover:bg-white/10">
              + Novo Funil
            </button>
          </div>

          {currentPipeline && (
            <>
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 mb-3">
                {currentPipeline.stages.map(stage => (
                  <div key={stage} className="flex justify-between items-center bg-white/[0.03] px-3 py-2 rounded-lg border border-border text-sm">
                    <span>{stage}</span>
                    <button
                      onClick={() => removeStage(selectedPipeline, stage)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  className="input-crm flex-1"
                  placeholder="Nova etapa..."
                  value={newStage}
                  onChange={e => setNewStage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddStage()}
                />
                <button onClick={handleAddStage} className="btn-gold">+ Adicionar</button>
              </div>
            </>
          )}
        </div>

        {/* Config Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-secondary/30 border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Vendedores</h3>
            <div className="flex gap-2 mb-3">
              <input
                className="input-crm flex-1"
                placeholder="Nome"
                value={newOwner}
                onChange={e => setNewOwner(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddConfig('owners', newOwner, setNewOwner)}
              />
              <button onClick={() => handleAddConfig('owners', newOwner, setNewOwner)} className="btn-gold px-3">+</button>
            </div>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {state.config.owners.map(item => (
                <div key={item} className="flex justify-between items-center bg-white/[0.03] px-3 py-2 rounded-lg border border-border text-sm">
                  <span>{item}</span>
                  <button onClick={() => removeConfigItem('owners', item)} className="text-destructive">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/30 border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Origens</h3>
            <div className="flex gap-2 mb-3">
              <input
                className="input-crm flex-1"
                placeholder="Origem"
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddConfig('sources', newSource, setNewSource)}
              />
              <button onClick={() => handleAddConfig('sources', newSource, setNewSource)} className="btn-gold px-3">+</button>
            </div>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {state.config.sources.map(item => (
                <div key={item} className="flex justify-between items-center bg-white/[0.03] px-3 py-2 rounded-lg border border-border text-sm">
                  <span>{item}</span>
                  <button onClick={() => removeConfigItem('sources', item)} className="text-destructive">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/30 border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Serviços</h3>
            <div className="flex gap-2 mb-3">
              <input
                className="input-crm flex-1"
                placeholder="Serviço"
                value={newService}
                onChange={e => setNewService(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddConfig('services', newService, setNewService)}
              />
              <button onClick={() => handleAddConfig('services', newService, setNewService)} className="btn-gold px-3">+</button>
            </div>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {state.config.services.map(item => (
                <div key={item} className="flex justify-between items-center bg-white/[0.03] px-3 py-2 rounded-lg border border-border text-sm">
                  <span>{item}</span>
                  <button onClick={() => removeConfigItem('services', item)} className="text-destructive">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
