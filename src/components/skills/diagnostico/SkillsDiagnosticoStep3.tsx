import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DiagnosticoSkills } from "@/hooks/useSkillsDiagnostico";

interface Props {
  data: DiagnosticoSkills;
  onChange: (updates: Partial<DiagnosticoSkills>) => void;
}

export function SkillsDiagnosticoStep3({ data, onChange }: Props) {
  const gargalos = data.gargalos_identificados || [];

  const addGargalo = () => {
    onChange({ gargalos_identificados: [...gargalos, ""] });
  };

  const updateGargalo = (index: number, value: string) => {
    const updated = [...gargalos];
    updated[index] = value;
    onChange({ gargalos_identificados: updated });
  };

  const removeGargalo = (index: number) => {
    onChange({ gargalos_identificados: gargalos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="processos_mais_demorados">
          Quais processos mais consomem seu tempo?
        </Label>
        <Textarea
          id="processos_mais_demorados"
          value={data.processos_mais_demorados || ""}
          onChange={(e) => onChange({ processos_mais_demorados: e.target.value })}
          placeholder="Descreva os processos que mais demoram no seu dia a dia..."
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Gargalos identificados</Label>
            <p className="text-sm text-muted-foreground">
              O que trava ou atrasa seu trabalho?
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addGargalo}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {gargalos.map((gargalo, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Descreva o gargalo..."
              value={gargalo}
              onChange={(e) => updateGargalo(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeGargalo(index)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {gargalos.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            Clique em "Adicionar" para listar os gargalos
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="onde_perde_mais_tempo">
          Onde você sente que perde mais tempo?
        </Label>
        <Textarea
          id="onde_perde_mais_tempo"
          value={data.onde_perde_mais_tempo || ""}
          onChange={(e) => onChange({ onde_perde_mais_tempo: e.target.value })}
          placeholder="Reuniões desnecessárias, retrabalho, busca de informações..."
          rows={3}
        />
      </div>
    </div>
  );
}
