import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Cpu, Loader2, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
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
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length === 0 ? (
              <span className="text-muted-foreground">Selecionar ferramentas...</span>
            ) : (
              <span>
                {value.length} ferramenta{value.length > 1 ? 's' : ''} selecionada{value.length > 1 ? 's' : ''}
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar ferramenta..." />
            <CommandEmpty>Nenhuma ferramenta encontrada.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {ferramentas.map((ferramenta) => {
                  const isSelected = value.includes(ferramenta.nome);
                  return (
                    <CommandItem
                      key={ferramenta.id}
                      value={ferramenta.nome}
                      onSelect={() => handleToggle(ferramenta.nome)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{ferramenta.nome}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
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
      )}
    </div>
  );
}
