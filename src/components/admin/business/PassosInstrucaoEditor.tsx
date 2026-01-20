import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { PassoInstrucao } from '@/hooks/useInstrucaoRecursos';
import { RecursosPassoManager } from './RecursosPassoManager';

interface PassosInstrucaoEditorProps {
  passos: PassoInstrucao[];
  onChange: (passos: PassoInstrucao[]) => void;
  etapaId: string;
}

export function PassosInstrucaoEditor({ passos, onChange, etapaId }: PassosInstrucaoEditorProps) {
  const addPasso = () => {
    const novoPasso: PassoInstrucao = {
      numero: passos.length + 1,
      titulo: '',
      descricao: '',
      recursos: [],
    };
    onChange([...passos, novoPasso]);
  };

  const removePasso = (index: number) => {
    const novoPassos = passos.filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, numero: i + 1 }));
    onChange(novoPassos);
  };

  const movePasso = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === passos.length - 1) return;

    const novoPassos = [...passos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [novoPassos[index], novoPassos[targetIndex]] = [novoPassos[targetIndex], novoPassos[index]];
    
    // Renumerar
    onChange(novoPassos.map((p, i) => ({ ...p, numero: i + 1 })));
  };

  const updatePasso = (index: number, updates: Partial<PassoInstrucao>) => {
    const novoPassos = [...passos];
    novoPassos[index] = { ...novoPassos[index], ...updates };
    onChange(novoPassos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground">
          PASSOS DA INSTRUÇÃO
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPasso}
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Passo
        </Button>
      </div>

      {passos.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <p>Nenhum passo adicionado</p>
          <p className="text-sm">Clique em "Novo Passo" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {passos.map((passo, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                {/* Header do passo */}
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="font-semibold text-sm min-w-[60px]">
                      Passo {passo.numero}
                    </span>
                  </div>
                  
                  <Input
                    placeholder="Título do passo"
                    value={passo.titulo}
                    onChange={(e) => updatePasso(index, { titulo: e.target.value })}
                    className="flex-1"
                  />

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => movePasso(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => movePasso(index, 'down')}
                      disabled={index === passos.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePasso(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Descrição do passo */}
                <Textarea
                  placeholder="Descrição do passo (opcional)"
                  value={passo.descricao || ''}
                  onChange={(e) => updatePasso(index, { descricao: e.target.value })}
                  rows={2}
                  className="resize-none"
                />

                {/* Recursos do passo */}
                <RecursosPassoManager
                  recursos={passo.recursos}
                  onChange={(recursos) => updatePasso(index, { recursos })}
                  etapaId={etapaId}
                  passoNumero={passo.numero}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
