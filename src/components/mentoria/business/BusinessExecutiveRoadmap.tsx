import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Clock, 
  ChevronRight,
  ChevronDown,
  FileText,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FaseProjeto {
  nome: string;
  descricao?: string;
}

export function BusinessExecutiveRoadmap() {
  const businessUserId = useBusinessUserId();
  const { contrato, reports, isLoading } = useContratosBusiness(businessUserId);
  const navigate = useNavigate();
  const [reportsExpanded, setReportsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // Flag para modo preview (sem contrato ativo)
  const isPreview = !contrato;

  // Fases padrão definidas no contrato (fases_projeto)
  const fasesContrato: FaseProjeto[] = contrato?.fases_projeto || [];

  // Dados de exemplo para o modo preview
  const fasesExemplo: FaseProjeto[] = [
    { nome: "Diagnóstico Inicial", descricao: "Análise e mapeamento de necessidades" },
    { nome: "Desenvolvimento de Solução", descricao: "Implementação das automações" },
    { nome: "Treinamento da Equipe", descricao: "Capacitação e transferência de conhecimento" },
    { nome: "Go-Live e Acompanhamento", descricao: "Entrega final e suporte" },
  ];

  const fases = isPreview || fasesContrato.length === 0 ? fasesExemplo : fasesContrato;

  return (
    <div className="space-y-6">
      {/* Banner de Preview */}
      {isPreview && (
        <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 inline mr-2" />
              Pré-visualização do Roadmap — Os dados serão preenchidos após a configuração do seu contrato
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Fases do Contrato - Visual e Não-Clicável */}
      <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Fases do Projeto</CardTitle>
            <Badge variant="outline" className="text-xs">
              {fases.length} {fases.length === 1 ? 'fase' : 'fases'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Entregas esperadas conforme contrato
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-muted" />
            
            <div className={`space-y-3 ${isPreview ? 'opacity-60' : ''}`}>
              {fases.map((fase, index) => (
                <div 
                  key={index} 
                  className="relative pl-10"
                >
                  {/* Status dot - visual indicator */}
                  <div className="absolute left-0 top-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                      <Circle className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Fase {index + 1}
                          </Badge>
                          <span className="font-medium truncate">
                            {fase.nome}
                          </span>
                        </div>
                        {fase.descricao && (
                          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                            {fase.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Reports */}
      <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isPreview ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Seus reports executivos aparecerão aqui
            </p>
          ) : !reports || reports.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <FileText className="h-5 w-5 text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum report disponível ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* 2 Reports Visíveis */}
              {reports.slice(0, 2).map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/mentoria/reports#${report.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{report.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.data_envio && format(parseISO(report.data_envio), "dd MMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}

              {/* Dropdown para reports ocultos */}
              {reports.length > 2 && (
                <Collapsible open={reportsExpanded} onOpenChange={setReportsExpanded}>
                  <CollapsibleTrigger className="flex items-center justify-center w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${reportsExpanded ? 'rotate-180' : ''}`} />
                    {reportsExpanded 
                      ? 'Ocultar' 
                      : `Ver mais ${reports.length - 2} reports`}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {reports.slice(2).map((report) => (
                      <div
                        key={report.id}
                        onClick={() => navigate(`/mentoria/reports#${report.id}`)}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{report.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                              {report.data_envio && format(parseISO(report.data_envio), "dd MMM yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}