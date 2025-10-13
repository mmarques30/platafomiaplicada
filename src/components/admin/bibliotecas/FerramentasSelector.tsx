import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Cpu, Loader2 } from "lucide-react";

interface FerramentasSelectorProps {
  value: string[];
  onChange: (ferramentas: string[]) => void;
  label?: string;
}

export function FerramentasSelector({ 
  value, 
  onChange, 
  label = "Ferramentas Recomendadas" 
}: FerramentasSelectorProps) {
  const { data: ferramentas, isLoading } = useFerramentasIA();

  const handleToggle = (ferramentaNome: string) => {
    const newValue = value.includes(ferramentaNome)
      ? value.filter(f => f !== ferramentaNome)
      : [...value, ferramentaNome];
    onChange(newValue);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Carregando ferramentas...</span>
      </div>
    );
  }

  if (!ferramentas || ferramentas.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhuma ferramenta cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Cpu className="w-4 h-4" />
        {label}
      </Label>
      <p className="text-sm text-muted-foreground">
        Selecione em quais ferramentas de IA este conteúdo pode ser aplicado
      </p>
      
      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
        {ferramentas.map((ferramenta) => (
          <div key={ferramenta.id} className="flex items-center space-x-2">
            <Checkbox
              id={`ferramenta-${ferramenta.id}`}
              checked={value.includes(ferramenta.nome)}
              onCheckedChange={() => handleToggle(ferramenta.nome)}
            />
            <label
              htmlFor={`ferramenta-${ferramenta.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {ferramenta.nome}
            </label>
          </div>
        ))}
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {value.length} ferramenta{value.length > 1 ? 's' : ''} selecionada{value.length > 1 ? 's' : ''}:
          </p>
          <div className="flex gap-2 flex-wrap">
            {value.map((ferramenta) => (
              <Badge 
                key={ferramenta} 
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => handleToggle(ferramenta)}
              >
                {ferramenta} ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
