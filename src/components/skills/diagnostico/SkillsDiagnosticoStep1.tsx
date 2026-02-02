import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiagnosticoSkills } from "@/hooks/useSkillsDiagnostico";

interface Props {
  data: DiagnosticoSkills;
  onChange: (updates: Partial<DiagnosticoSkills>) => void;
}

const AREAS_ATUACAO = [
  "Marketing",
  "Vendas",
  "Atendimento ao Cliente",
  "Financeiro",
  "RH / Pessoas",
  "Operações",
  "TI / Tecnologia",
  "Jurídico",
  "Administrativo",
  "Produto",
  "Outro",
];

const TEMPO_EMPRESA = [
  "Menos de 6 meses",
  "6 meses a 1 ano",
  "1 a 2 anos",
  "2 a 5 anos",
  "Mais de 5 anos",
];

export function SkillsDiagnosticoStep1({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cargo">Qual é o seu cargo atual?</Label>
        <Input
          id="cargo"
          value={data.cargo || ""}
          onChange={(e) => onChange({ cargo: e.target.value })}
          placeholder="Ex: Analista de Marketing, Coordenador de Vendas..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="area_atuacao">Em qual área você atua?</Label>
        <Select
          value={data.area_atuacao || ""}
          onValueChange={(value) => onChange({ area_atuacao: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione sua área" />
          </SelectTrigger>
          <SelectContent>
            {AREAS_ATUACAO.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tempo_na_empresa">Há quanto tempo está na empresa?</Label>
        <Select
          value={data.tempo_na_empresa || ""}
          onValueChange={(value) => onChange({ tempo_na_empresa: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tempo" />
          </SelectTrigger>
          <SelectContent>
            {TEMPO_EMPRESA.map((tempo) => (
              <SelectItem key={tempo} value={tempo}>
                {tempo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
