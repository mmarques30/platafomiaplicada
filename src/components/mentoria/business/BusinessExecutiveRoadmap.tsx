import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  ExternalLink,
  Download
} from "lucide-react";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessExecutiveRoadmap() {
  const { contrato, reports, progresso, tempoRestante, isLoading } = useContratosBusiness();
  const { sessoes } = useMentoriaSessoes();

  // Usar todas as sessões como reuniões de alinhamento
  const reunioesAlinhamento = sessoes || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
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


      {/* Timeline de Entregas */}
      <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Entregas Esperadas</span>
            <span className="text-sm font-normal text-muted-foreground">
              {entregasConcluidas}/{entregas.length} ({progressoAtual}%)
            </span>
          </CardTitle>
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
                  <div key={index} className="relative pl-8">
                    {/* Status dot - bullet simples */}
                    <div className="absolute left-0 top-3">
                      <div className={`h-4 w-4 rounded-full border-2 border-background ${
                        isConcluida 
                          ? 'bg-green-500' 
                          : isEmAndamento 
                            ? 'bg-yellow-500' 
                            : 'bg-zinc-900 dark:bg-zinc-100'
                      }`} />
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      isConcluida 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : isEmAndamento 
                          ? 'bg-yellow-500/10 border border-yellow-500/20'
                          : isPreview
                            ? 'bg-muted/30 border border-dashed border-border'
                            : 'bg-muted/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isConcluida ? 'text-green-600 dark:text-green-400' : ''}`}>
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

      {/* Grid: Reuniões, Reports, Suporte */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Reuniões de Alinhamento */}
        <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Reuniões Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {isPreview ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-60">
                  <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    As reuniões aparecerão aqui após o início do contrato
                  </p>
                </div>
              ) : reunioesAlinhamento.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhuma reunião agendada
                </p>
              ) : (
                <div className="space-y-2">
                  {reunioesAlinhamento.map((reuniao) => {
                    const data = parseISO(reuniao.data_sessao);
                    const passada = isPast(data);
                    
                    return (
                      <div 
                        key={reuniao.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          passada 
                            ? 'bg-muted/30' 
                            : 'bg-primary/10 border border-primary/20'
                        }`}
                      >
                        <span className={`text-sm ${passada ? 'text-muted-foreground' : 'font-medium'}`}>
                          {format(data, "dd MMM", { locale: ptBR })}
                        </span>
                        {passada ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Próxima
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Reports Enviados */}
        <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Reports Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {isPreview ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-60">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Os reports serão listados aqui
                  </p>
                </div>
              ) : reports.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhum report enviado
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => window.open(report.arquivo_url!, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-2">
                {isPreview ? (
                  <Badge variant="outline" className="text-sm py-1.5 px-4 border-dashed">
                    Tipo a definir
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-sm py-1.5 px-4 bg-primary/10 text-primary">
                    {contrato?.suporte_tipo === 'prioritario' 
                      ? '⚡ Prioritário' 
                      : contrato?.suporte_tipo === 'whatsapp' 
                        ? '📱 WhatsApp' 
                        : '📧 E-mail'}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Frequência de reports: {isPreview ? '—' : (contrato?.reports_frequencia || 'Mensal')}
              </p>
              
              <Button 
                variant="outline" 
                className="w-full"
                disabled={isPreview}
                onClick={() => {
                  if (!isPreview) {
                    window.open("https://wa.me/5511999999999", "_blank");
                  }
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Abrir Chat
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
