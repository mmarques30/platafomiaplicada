import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, CheckCircle2, Plus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useState } from "react";
import { NovaDuvidaModal } from "@/components/mentoria/NovaDuvidaModal";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MentoriaDuvidas() {
  const navigate = useNavigate();
  const { duvidas, isLoading } = useDuvidasMentoria();
  const [modalOpen, setModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "respondida":
        return "bg-status-success/15 text-status-success";
      case "em_analise":
        return "bg-status-info/15 text-status-info";
      case "pendente":
        return "bg-status-warning/15 text-status-warning";
      case "fechada":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "bg-status-danger/15 text-status-danger";
      case "alta":
        return "bg-status-warning/15 text-status-warning";
      case "normal":
        return "bg-status-info/15 text-status-info";
      case "baixa":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getSLAInfo = (prazo_sla: string, status: string) => {
    if (status === "respondida" || status === "fechada") return null;
    
    const horasRestantes = differenceInHours(new Date(prazo_sla), new Date());
    
    if (horasRestantes < 0) {
      return { text: `Atrasada ${Math.abs(horasRestantes)}h`, color: "text-status-danger", icon: AlertCircle };
    } else if (horasRestantes < 6) {
      return { text: `${horasRestantes}h restantes`, color: "text-status-warning", icon: Clock };
    } else {
      return { text: `SLA: ${horasRestantes}h`, color: "text-muted-foreground", icon: Clock };
    }
  };

  if (isLoading) {
    return (
      <PageContainer size="narrow">
        <p>Carregando...</p>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer size="narrow">
        <Button
          variant="ghost"
          onClick={() => navigate("/mentoria")}
          className="-ml-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Mentoria
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minhas Dúvidas</h1>
            <p className="text-muted-foreground">
              Tire suas dúvidas com seu mentor e acompanhe as respostas
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Dúvida
          </Button>
        </div>

        <div className="space-y-4">
          {duvidas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem dúvidas registradas
                </p>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Enviar Primeira Dúvida
                </Button>
              </CardContent>
            </Card>
          ) : (
            duvidas.map((duvida) => {
              const slaInfo = getSLAInfo(duvida.prazo_sla, duvida.status);
              const SLAIcon = slaInfo?.icon;

              return (
                <Card key={duvida.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{duvida.titulo}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(duvida.status)}>
                            {duvida.status === "respondida" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {duvida.status === "pendente" ? "Aguardando" : duvida.status.replace("_", " ")}
                          </Badge>
                          <Badge className={getPrioridadeColor(duvida.prioridade)}>
                            Prioridade {duvida.prioridade}
                          </Badge>
                          {slaInfo && SLAIcon && (
                            <span className={`text-sm flex items-center gap-1 ${slaInfo.color}`}>
                              <SLAIcon className="h-3 w-3" />
                              {slaInfo.text}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        {formatDistanceToNow(new Date(duvida.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Sua Dúvida:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {duvida.duvida}
                      </p>
                    </div>

                    {duvida.contexto && (
                      <div>
                        <h4 className="font-medium mb-2">Contexto:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {duvida.contexto}
                        </p>
                      </div>
                    )}

                    {duvida.resposta_mentor && (
                      <>
                        <Separator />
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-status-success" />
                            Resposta do Mentor:
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">{duvida.resposta_mentor}</p>
                          {duvida.respondida_em && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Respondida em {format(new Date(duvida.respondida_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </PageContainer>

      <NovaDuvidaModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
