import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { DiagnosticoSkills } from "@/hooks/useSkillsDiagnostico";

interface Props {
  data: DiagnosticoSkills;
  onChange: (updates: Partial<DiagnosticoSkills>) => void;
}

const FREQUENCIAS = [
  "Várias vezes ao dia",
  "Diariamente",
  "Algumas vezes por semana",
  "Semanalmente",
  "Quinzenalmente",
  "Mensalmente",
];

export function SkillsDiagnosticoStep2({ data, onChange }: Props) {
  const tarefas = data.tarefas_manuais || [];
  const ferramentas = data.ferramentas_atuais || [];

  const addTarefa = () => {
    onChange({
      tarefas_manuais: [...tarefas, { tarefa: "", frequencia: "", tempo_gasto_horas: 0 }],
    });
  };

  const updateTarefa = (index: number, field: string, value: any) => {
    const updated = [...tarefas];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ tarefas_manuais: updated });
  };

  const removeTarefa = (index: number) => {
    onChange({ tarefas_manuais: tarefas.filter((_, i) => i !== index) });
  };

  const addFerramenta = () => {
    onChange({
      ferramentas_atuais: [...ferramentas, { nome: "", uso: "" }],
    });
  };

  const updateFerramenta = (index: number, field: string, value: string) => {
    const updated = [...ferramentas];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ferramentas_atuais: updated });
  };

  const removeFerramenta = (index: number) => {
    onChange({ ferramentas_atuais: ferramentas.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      {/* Tarefas Manuais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Tarefas manuais que você executa</Label>
            <p className="text-sm text-muted-foreground">
              Liste as tarefas repetitivas que consomem seu tempo
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTarefa}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {tarefas.map((tarefa, index) => (
          <div key={index} className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="Descreva a tarefa..."
                  value={tarefa.tarefa}
                  onChange={(e) => updateTarefa(index, "tarefa", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={tarefa.frequencia}
                    onValueChange={(value) => updateTarefa(index, "frequencia", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIAS.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="0"
                      value={tarefa.tempo_gasto_horas || ""}
                      onChange={(e) => updateTarefa(index, "tempo_gasto_horas", parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">h/semana</span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTarefa(index)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {tarefas.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            Clique em "Adicionar" para listar suas tarefas manuais
          </div>
        )}
      </div>

      {/* Ferramentas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Ferramentas que você usa</Label>
            <p className="text-sm text-muted-foreground">
              Softwares, planilhas, sistemas que você utiliza no dia a dia
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addFerramenta}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {ferramentas.map((ferramenta, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Nome da ferramenta"
              value={ferramenta.nome}
              onChange={(e) => updateFerramenta(index, "nome", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Para que você usa?"
              value={ferramenta.uso}
              onChange={(e) => updateFerramenta(index, "uso", e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFerramenta(index)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {ferramentas.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            Clique em "Adicionar" para listar suas ferramentas
          </div>
        )}
      </div>
    </div>
  );
}
