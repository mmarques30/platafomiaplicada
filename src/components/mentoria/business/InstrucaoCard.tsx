import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, Code, Users, CheckSquare, ChevronDown, Lightbulb, ExternalLink, FileText, Image, Video, File, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InstrucaoEtapa } from "@/hooks/useEtapasBusiness";
import type { RecursosInstrucao, RecursoItem } from "@/hooks/useInstrucaoRecursos";

interface InstrucaoCardProps {
  instrucao: InstrucaoEtapa;
  onToggleStatus: (id: string, novoStatus: 'pendente' | 'concluida') => void;
  isUpdating?: boolean;
}

const ferramentaConfig = {
  claude: {
    icon: Bot,
    label: "Claude",
    className: "bg-primary/10 text-primary border-primary/20",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
  },
  lovable: {
    icon: Code,
    label: "Lovable",
    className: "bg-secondary/50 text-secondary-foreground border-secondary",
    badgeClass: "bg-secondary/50 text-secondary-foreground border-secondary",
  },
  reuniao: {
    icon: Users,
    label: "Reunião",
    className: "bg-accent/50 text-accent-foreground border-accent",
    badgeClass: "bg-accent/50 text-accent-foreground border-accent",
  },
  outro: {
    icon: CheckSquare,
    label: "Tarefa",
    className: "bg-muted text-muted-foreground border-border",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

const getRecursoIcon = (tipo: RecursoItem['tipo']) => {
  switch (tipo) {
    case 'pdf': return <FileText className="h-3 w-3 text-destructive" />;
    case 'imagem': return <Image className="h-3 w-3 text-primary" />;
    case 'video': return <Video className="h-3 w-3 text-accent-foreground" />;
    case 'documento': return <File className="h-3 w-3 text-secondary-foreground" />;
    case 'link': return <Link2 className="h-3 w-3 text-primary" />;
    default: return <File className="h-3 w-3 text-muted-foreground" />;
  }
};

export function InstrucaoCard({ instrucao, onToggleStatus, isUpdating }: InstrucaoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ferramentaKey = instrucao.ferramenta && instrucao.ferramenta in ferramentaConfig 
    ? instrucao.ferramenta 
    : 'outro';
  const config = ferramentaConfig[ferramentaKey as keyof typeof ferramentaConfig];
  const Icon = config.icon;
  const isConcluida = instrucao.status === 'concluida';

  // Parse recursos JSONB
  const recursos = instrucao.recursos as unknown as RecursosInstrucao | null;
  const passos = recursos?.passos || [];
  const temPassos = passos.length > 0;
  const temDetalhes = temPassos || instrucao.dicas || instrucao.prompt_sugerido;

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
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
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

            {temDetalhes && (
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
                
                <CollapsibleContent className="mt-3 space-y-4">
                  {/* Prompt Sugerido - igual ao admin */}
                  {instrucao.prompt_sugerido && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary uppercase">
                          Prompt Sugerido
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground/80">
                        {instrucao.prompt_sugerido}
                      </p>
                    </div>
                  )}

                  {/* Passos com recursos */}
                  {temPassos && (
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Passos
                      </span>
                      <div className="space-y-2">
                        {passos.map((passo, index) => (
                          <div key={index} className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
                                {passo.numero}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{passo.titulo}</p>
                                {passo.descricao && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {passo.descricao}
                                  </p>
                                )}
                                
                                {/* Recursos do passo */}
                                {passo.recursos && passo.recursos.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {passo.recursos.map((recurso) => (
                                      <a
                                        key={recurso.id}
                                        href={recurso.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-background/80 hover:bg-background border rounded-md px-2 py-1 text-xs transition-colors"
                                      >
                                        {getRecursoIcon(recurso.tipo)}
                                        <span className="max-w-[120px] truncate">{recurso.titulo}</span>
                                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {instrucao.dicas && (
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-accent-foreground uppercase block mb-1">
                            Dicas
                          </span>
                          <span className="text-sm text-foreground/80">{instrucao.dicas}</span>
                        </div>
                      </div>
                    </div>
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
