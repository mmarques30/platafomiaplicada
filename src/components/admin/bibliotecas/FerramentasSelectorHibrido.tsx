import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFerramentasIA } from "@/hooks/useFerramentas";

interface FerramentasSelectorHibridoProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export function FerramentasSelectorHibrido({
  value,
  onChange,
  label = "Ferramentas Recomendadas",
}: FerramentasSelectorHibridoProps) {
  const [open, setOpen] = useState(false);
  const [customTool, setCustomTool] = useState("");
  const { data: ferramentas, isLoading } = useFerramentasIA();

  const handleToggle = (ferramenta: string) => {
    if (value.includes(ferramenta)) {
      onChange(value.filter((f) => f !== ferramenta));
    } else {
      onChange([...value, ferramenta]);
    }
  };

  const handleRemove = (ferramenta: string) => {
    onChange(value.filter((f) => f !== ferramenta));
  };

  const handleAddCustom = () => {
    const trimmed = customTool.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomTool("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  // Ferramentas cadastradas no sistema
  const ferramentasCadastradas = ferramentas?.map((f) => f.nome) || [];
  
  // Ferramentas selecionadas que não estão cadastradas (customizadas)
  const ferramentasCustomizadas = value.filter(
    (f) => !ferramentasCadastradas.includes(f)
  );

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Seletor de ferramentas cadastradas */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading
              ? "Carregando..."
              : value.length > 0
              ? `${value.length} ferramenta(s) selecionada(s)`
              : "Selecionar ferramentas cadastradas"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar ferramenta cadastrada..." />
            <CommandList>
              <CommandEmpty>Nenhuma ferramenta encontrada.</CommandEmpty>
              <CommandGroup>
                {ferramentas?.map((ferramenta) => (
                  <CommandItem
                    key={ferramenta.id}
                    value={ferramenta.nome}
                    onSelect={() => handleToggle(ferramenta.nome)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(ferramenta.nome) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {ferramenta.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Input para ferramentas customizadas */}
      <div className="flex gap-2">
        <Input
          placeholder="Adicionar ferramenta não cadastrada..."
          value={customTool}
          onChange={(e) => setCustomTool(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleAddCustom}
          disabled={!customTool.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Digite o nome de uma ferramenta e pressione Enter ou clique em + para adicionar
      </p>

      {/* Badges das ferramentas selecionadas */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((ferramenta) => {
            const isCadastrada = ferramentasCadastradas.includes(ferramenta);
            return (
              <Badge
                key={ferramenta}
                variant={isCadastrada ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {ferramenta}
                {!isCadastrada && (
                  <span className="text-xs opacity-70">(custom)</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(ferramenta)}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
