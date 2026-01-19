import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, Code, Users, CheckSquare, ChevronDown, Copy, Lightbulb, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { InstrucaoEtapa } from "@/hooks/useEtapasBusiness";

interface InstrucaoCardProps {
  instrucao: InstrucaoEtapa;
  onToggleStatus: (id: string, novoStatus: 'pendente' | 'concluida') => void;
  isUpdating?: boolean;
}

const ferramentaConfig = {
  claude: {
    icon: Bot,
    label: "Claude",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  lovable: {
    icon: Code,
    label: "Lovable",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
  reuniao: {
    icon: Users,
    label: "Reunião",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  outro: {
    icon: CheckSquare,
    label: "Tarefa",
    className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
    badgeClass: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  },
};

export function InstrucaoCard({ instrucao, onToggleStatus, isUpdating }: InstrucaoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = ferramentaConfig[instrucao.ferramenta || 'outro'];
  const Icon = config.icon;
  const isConcluida = instrucao.status === 'concluida';

  const handleCopyPrompt = () => {
    if (instrucao.prompt_sugerido) {
      navigator.clipboard.writeText(instrucao.prompt_sugerido);
      toast.success("Prompt copiado para a área de transferência");
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 border",
      config.className,
      isConcluida && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isConcluida}
            disabled={isUpdating}
            onCheckedChange={(checked) => {
              onToggleStatus(instrucao.id, checked ? 'concluida' : 'pendente');
            }}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs font-medium", config.badgeClass)}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              {instrucao.gerado_por_ia && (
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                  IA
                </Badge>
              )}
            </div>
            
            <h4 className={cn(
              "font-medium text-foreground",
              isConcluida && "line-through"
            )}>
              {instrucao.titulo}
            </h4>
            
            {instrucao.descricao && (
              <p className="text-sm text-muted-foreground mt-1">
                {instrucao.descricao}
              </p>
            )}

            {(instrucao.prompt_sugerido || instrucao.dicas || instrucao.recursos_url) && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                    <ChevronDown className={cn(
                      "h-3 w-3 mr-1 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                    {isExpanded ? "Menos detalhes" : "Mais detalhes"}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  {instrucao.prompt_sugerido && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Prompt Sugerido
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPrompt}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-mono bg-background/50 p-2 rounded border">
                        {instrucao.prompt_sugerido}
                      </pre>
                    </div>
                  )}
                  
                  {instrucao.dicas && (
                    <div className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{instrucao.dicas}</span>
                    </div>
                  )}
                  
                  {instrucao.recursos_url && (
                    <a
                      href={instrucao.recursos_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Material de apoio
                    </a>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
