import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  BookOpen,
  Download,
  ChevronRight
} from "lucide-react";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
export function BusinessExecutiveRoadmap() {
  const { contrato, reports, progresso, isLoading } = useContratosBusiness();
  const { sessoes } = useMentoriaSessoes();
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const navigate = useNavigate();

  // Usar todas as sessões como reuniões recorrentes
  const reunioesRecorrentes = sessoes || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // Flag para modo preview (sem contrato ativo)
  const isPreview = !contrato;

  // Dados de exemplo para o modo preview
  const entregasExemplo = [
    { titulo: "Diagnóstico Inicial", tipo: "Análise", status: "pendente", prazo: null },
    { titulo: "Desenvolvimento de Solução", tipo: "Implementação", status: "pendente", prazo: null },
    { titulo: "Treinamento da Equipe", tipo: "Capacitação", status: "pendente", prazo: null },
    { titulo: "Go-Live e Acompanhamento", tipo: "Entrega", status: "pendente", prazo: null },
  ];

  const entregas = isPreview ? entregasExemplo : (contrato?.entregas_esperadas || []);
  const entregasConcluidas = isPreview ? 0 : entregas.filter(e => e.status === "concluida").length;
  const progressoAtual = isPreview ? 0 : progresso.percentual;

  // Dados de exemplo para guias de uso
  const guiasExemplo = [
    { titulo: "Como usar a plataforma", descricao: "Guia completo de navegação" },
    { titulo: "Boas práticas de IA", descricao: "Dicas para maximizar resultados" },
    { titulo: "FAQ - Perguntas frequentes", descricao: "Respostas às dúvidas comuns" },
  ];

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

      {/* Progresso Geral do Roadmap */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progresso do Roadmap</span>
          <span className="text-muted-foreground">
            {entregasConcluidas}/{entregas.length} entregas ({progressoAtual}%)
          </span>
        </div>
        <Progress value={progressoAtual} className="h-2" />
      </div>

      {/* Timeline de Entregas */}
      <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Entregas Esperadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
            
            <div className={`space-y-4 ${isPreview ? 'opacity-60' : ''}`}>
              {entregas.map((entrega, index) => {
                const isConcluida = entrega.status === "concluida";
                const isEmAndamento = entrega.status === "em_andamento";
                
                return (
                  <div 
                    key={index} 
                    className={`relative pl-8 ${!isPreview && etapas?.[index] ? 'cursor-pointer group' : ''}`}
                    onClick={() => {
                      if (!isPreview && etapas?.[index]) {
                        navigate(`/mentoria/etapa/${etapas[index].id}`);
                      }
                    }}
                  >
                    {/* Status dot - bullet simples */}
                    <div className="absolute left-0 top-3">
                      <div className={`h-4 w-4 rounded-full border-2 border-background ${
                        isConcluida 
                          ? 'bg-emerald-500' 
                          : isEmAndamento 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-900 dark:bg-zinc-100'
                      }`} />
                    </div>
                    
                    <div className={`p-3 rounded-lg transition-colors ${
                      isConcluida 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : isEmAndamento 
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : isPreview
                            ? 'bg-muted/30 border border-dashed border-border'
                            : 'bg-muted/50 group-hover:bg-muted/70'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isConcluida ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          {entrega.titulo}
                        </span>
                        <div className="flex items-center gap-2">
                          {entrega.tipo && (
                            <Badge variant="outline" className="text-xs">
                              {entrega.tipo}
                            </Badge>
                          )}
                          {entrega.prazo && (
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(entrega.prazo), "dd MMM", { locale: ptBR })}
                            </span>
                          )}
                          {!isPreview && etapas?.[index] && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Reuniões, Documentos, Guias */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Reuniões Recorrentes - Formato Tabela */}
        <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reuniões Recorrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {isPreview ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-60">
                  <p className="text-muted-foreground text-sm">
                    As reuniões aparecerão aqui após o início do contrato
                  </p>
                </div>
              ) : reunioesRecorrentes.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhuma reunião agendada
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reunioesRecorrentes.map((reuniao) => {
                      const data = parseISO(reuniao.data_sessao);
                      const passada = isPast(data);
                      
                      return (
                        <TableRow key={reuniao.id}>
                          <TableCell className="text-sm py-2">
                            {format(data, "dd MMM yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right py-2">
                            {passada ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Realizada
                              </span>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Agendada
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Documentos Suporte */}
        <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Documentos Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {isPreview ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-60">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Os documentos de suporte aparecerão aqui
                  </p>
                </div>
              ) : reports.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhum documento disponível
                </p>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div 
                      key={report.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{report.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(report.data_envio), "dd MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      {report.arquivo_url && (
                        <button 
                          className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-md hover:bg-muted"
                          onClick={() => window.open(report.arquivo_url!, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Guias de Uso */}
        <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Guias de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {isPreview ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-60">
                  <BookOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Os guias de uso aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guiasExemplo.map((guia, index) => (
                    <div 
                      key={index}
                      className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium">{guia.titulo}</p>
                      <p className="text-xs text-muted-foreground">{guia.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
