import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DiagnosticoSkills } from "@/hooks/useSkillsDiagnostico";

interface Props {
  data: DiagnosticoSkills;
  onChange: (updates: Partial<DiagnosticoSkills>) => void;
}

const INTERESSE_IA = [
  { value: "muito_alto", label: "Muito alto - Quero aplicar IA em tudo que puder" },
  { value: "alto", label: "Alto - Tenho interesse em aprender e aplicar" },
  { value: "moderado", label: "Moderado - Estou curioso, mas tenho dúvidas" },
  { value: "baixo", label: "Baixo - Prefiro métodos tradicionais" },
];

const JA_USOU_IA = [
  { value: "sim_frequente", label: "Sim, uso frequentemente (ChatGPT, Claude, etc.)" },
  { value: "sim_as_vezes", label: "Sim, uso às vezes" },
  { value: "sim_experimentei", label: "Já experimentei, mas não uso regularmente" },
  { value: "nao", label: "Não, nunca usei" },
];

export function SkillsDiagnosticoStep4({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="processos_repetitivos">
          Quais processos você considera repetitivos e poderiam ser automatizados?
        </Label>
        <Textarea
          id="processos_repetitivos"
          value={data.processos_repetitivos || ""}
          onChange={(e) => onChange({ processos_repetitivos: e.target.value })}
          placeholder="Preencher relatórios, enviar e-mails padrão, copiar dados entre sistemas..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="onde_poderia_ser_mais_produtivo">
          Onde você acredita que poderia ser mais produtivo?
        </Label>
        <Textarea
          id="onde_poderia_ser_mais_produtivo"
          value={data.onde_poderia_ser_mais_produtivo || ""}
          onChange={(e) => onChange({ onde_poderia_ser_mais_produtivo: e.target.value })}
          placeholder="Se tivesse mais tempo ou ferramentas melhores, o que você faria diferente?"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <Label>Qual seu nível de interesse em usar Inteligência Artificial?</Label>
        <RadioGroup
          value={data.interesse_em_ia || ""}
          onValueChange={(value) => onChange({ interesse_em_ia: value })}
          className="space-y-2"
        >
          {INTERESSE_IA.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`interesse-${option.value}`} />
              <Label htmlFor={`interesse-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Você já usou ferramentas de IA no trabalho?</Label>
        <RadioGroup
          value={data.ja_usou_ia || ""}
          onValueChange={(value) => onChange({ ja_usou_ia: value })}
          className="space-y-2"
        >
          {JA_USOU_IA.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`usou-${option.value}`} />
              <Label htmlFor={`usou-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
