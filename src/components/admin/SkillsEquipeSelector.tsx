import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Building2 } from "lucide-react";
import { useEquipesSkillsAdmin } from "@/hooks/admin/useEquipesSkillsAdmin";

export interface SkillsEquipeData {
  equipeId: string | null;
  novaEquipe: {
    nome: string;
    empresa: string;
  } | null;
  papelEquipe: "lider" | "membro";
}

interface SkillsEquipeSelectorProps {
  value: SkillsEquipeData;
  onChange: (data: SkillsEquipeData) => void;
  showLiderOption?: boolean;
  disabled?: boolean;
}

export function SkillsEquipeSelector({
  value,
  onChange,
  showLiderOption = true,
  disabled = false,
}: SkillsEquipeSelectorProps) {
  const [criarNovaEquipe, setCriarNovaEquipe] = useState(false);
  const { data: equipesSkills, isLoading } = useEquipesSkillsAdmin();

  const handleEquipeChange = (equipeId: string) => {
    onChange({
      equipeId,
      novaEquipe: null,
      papelEquipe: value.papelEquipe,
    });
    setCriarNovaEquipe(false);
  };

  const handleNovaEquipeToggle = () => {
    const newValue = !criarNovaEquipe;
    setCriarNovaEquipe(newValue);
    if (newValue) {
      onChange({
        equipeId: null,
        novaEquipe: { nome: "", empresa: "" },
        papelEquipe: value.papelEquipe,
      });
    } else {
      onChange({
        equipeId: null,
        novaEquipe: null,
        papelEquipe: value.papelEquipe,
      });
    }
  };

  const handleNovaEquipeChange = (field: "nome" | "empresa", val: string) => {
    onChange({
      equipeId: null,
      novaEquipe: {
        nome: field === "nome" ? val : (value.novaEquipe?.nome || ""),
        empresa: field === "empresa" ? val : (value.novaEquipe?.empresa || ""),
      },
      papelEquipe: value.papelEquipe,
    });
  };

  const handleLiderChange = (checked: boolean) => {
    onChange({
      ...value,
      papelEquipe: checked ? "lider" : "membro",
    });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Users className="h-4 w-4" />
        Equipe Skills
      </div>

      {!criarNovaEquipe ? (
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Selecionar equipe existente</Label>
            <Select
              value={value.equipeId || ""}
              onValueChange={handleEquipeChange}
              disabled={disabled || isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma equipe" />
              </SelectTrigger>
              <SelectContent>
                {equipesSkills?.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{eq.nome}</span>
                      {eq.empresa_nome && (
                        <span className="text-muted-foreground">
                          ({eq.empresa_nome})
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        • {eq.membros_count} membro(s)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNovaEquipeToggle}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar nova equipe
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nova-equipe-nome" className="text-sm">
                Nome da Equipe *
              </Label>
              <Input
                id="nova-equipe-nome"
                value={value.novaEquipe?.nome || ""}
                onChange={(e) => handleNovaEquipeChange("nome", e.target.value)}
                placeholder="Ex: Equipe Comercial"
                disabled={disabled}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="nova-equipe-empresa" className="text-sm">
                Empresa *
              </Label>
              <Input
                id="nova-equipe-empresa"
                value={value.novaEquipe?.empresa || ""}
                onChange={(e) => handleNovaEquipeChange("empresa", e.target.value)}
                placeholder="Ex: Empresa XYZ"
                disabled={disabled}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNovaEquipeToggle}
            disabled={disabled}
          >
            Cancelar e selecionar equipe existente
          </Button>
        </div>
      )}

      {showLiderOption && (
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Checkbox
            id="is-lider"
            checked={value.papelEquipe === "lider"}
            onCheckedChange={handleLiderChange}
            disabled={disabled}
          />
          <Label htmlFor="is-lider" className="cursor-pointer text-sm">
            Definir como Líder da equipe
          </Label>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Usuários Skills devem ser vinculados a uma equipe para compartilhar o progresso.
      </p>
    </div>
  );
}
