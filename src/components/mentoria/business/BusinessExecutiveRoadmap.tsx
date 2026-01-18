import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Package,
  Timer,
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

  if (!contrato) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Contrato Não Encontrado</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Seu contrato Business ainda não foi configurado. Entre em contato com a equipe para iniciar sua jornada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const entregas = contrato.entregas_esperadas || [];
  const entregasConcluidas = entregas.filter(e => e.status === "concluida").length;

  return (
    <div className="space-y-6">
      {/* Header do Contrato */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Contrato Business</h2>
                <p className="text-muted-foreground text-sm">
                  {contrato.modulos_contratados} módulo{contrato.modulos_contratados > 1 ? 's' : ''} • 
                  {contrato.tempo_consultoria_meses} meses de consultoria
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {tempoRestante && !tempoRestante.expirado && (
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Timer className="h-4 w-4 mr-1.5" />
                  {tempoRestante.meses} mês{tempoRestante.meses > 1 ? 'es' : ''} restante{tempoRestante.meses > 1 ? 's' : ''}
                </Badge>
              )}
              {tempoRestante?.expirado && (
                <Badge variant="destructive" className="text-sm py-1.5 px-3">
                  Contrato Expirado
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm py-1.5 px-3 bg-primary/10 text-primary">
                {entregasConcluidas} de {entregas.length} entregas
              </Badge>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso Geral</span>
              <span className="font-semibold">{progresso.percentual}%</span>
            </div>
            <Progress value={progresso.percentual} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Entregas */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Entregas Esperadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entregas.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              Nenhuma entrega configurada ainda.
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {entregas.map((entrega, index) => {
                  const isConcluida = entrega.status === "concluida";
                  const isEmAndamento = entrega.status === "em_andamento";
                  
                  return (
                    <div key={index} className="relative pl-10">
                      {/* Status dot */}
                      <div className="absolute left-2 top-1">
                        {isConcluida ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : isEmAndamento ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        isConcluida 
                          ? 'bg-green-500/10 border border-green-500/20' 
                          : isEmAndamento 
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
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
          )}
        </CardContent>
      </Card>

      {/* Grid: Reuniões, Reports, Suporte */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Reuniões de Alinhamento */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Reuniões Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {reunioesAlinhamento.length === 0 ? (
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
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Reports Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {reports.length === 0 ? (
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
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-2">
                <Badge variant="secondary" className="text-sm py-1.5 px-4 bg-primary/10 text-primary">
                  {contrato.suporte_tipo === 'prioritario' 
                    ? '⚡ Prioritário' 
                    : contrato.suporte_tipo === 'whatsapp' 
                      ? '📱 WhatsApp' 
                      : '📧 E-mail'}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Frequência de reports: {contrato.reports_frequencia || 'Mensal'}
              </p>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // TODO: Configurar link de suporte
                  window.open("https://wa.me/5511999999999", "_blank");
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
