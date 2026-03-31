import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useState } from "react";
import { NovaDuvidaModal } from "@/components/mentoria/NovaDuvidaModal";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AbaDuvidas() {
  const { duvidas } = useDuvidasMentoria();
  const [modalOpen, setModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "respondida":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "em_analise":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "respondida":
        return "Respondida";
      case "em_analise":
        return "Em Análise";
      default:
        return "Aguardando";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "destructive";
      case "alta":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <>
      {/* Lista de Dúvidas */}
      <div className="space-y-4">
        {duvidas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma dúvida registrada ainda.
              </p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Enviar Primeira Dúvida
              </Button>
            </CardContent>
          </Card>
        ) : (
          duvidas.map((duvida) => (
            <Card key={duvida.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(duvida.status)}
                      <CardTitle className="text-lg">{duvida.titulo}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge 
                        status={duvida.status === "respondida" ? "concluido" : duvida.status === "em_analise" ? "em_andamento" : "pendente"} 
                        label={getStatusLabel(duvida.status)} 
                      />
                      <Badge variant={getPrioridadeColor(duvida.prioridade)}>
                        {duvida.prioridade.charAt(0).toUpperCase() + duvida.prioridade.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(duvida.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Sua Dúvida:</h4>
                  <p className="text-sm text-muted-foreground">{duvida.duvida}</p>
                </div>

                {duvida.contexto && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Contexto:</h4>
                    <p className="text-sm text-muted-foreground">{duvida.contexto}</p>
                  </div>
                )}

                {duvida.resposta_mentor && (
                  <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Resposta do Mentor:
                    </h4>
                    <p className="text-sm text-foreground">{duvida.resposta_mentor}</p>
                    {duvida.respondida_em && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Respondida {formatDistanceToNow(new Date(duvida.respondida_em), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <NovaDuvidaModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
