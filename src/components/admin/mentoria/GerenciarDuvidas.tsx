import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useState } from "react";
import { ResponderDuvidaModal } from "./ResponderDuvidaModal";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, AlertCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GerenciarDuvidasProps {
  userId: string;
}

export function GerenciarDuvidas({ userId }: GerenciarDuvidasProps) {
  const { duvidas, isLoading } = useDuvidasMentoria(userId);
  const [duvidaSelecionada, setDuvidaSelecionada] = useState<any>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nome_completo")
        .eq("id", userId)
        .single();
      return data;
    },
  });

  const getSLAInfo = (prazo_sla: string, status: string) => {
    if (status === "respondida" || status === "fechada") return null;
    
    const horasRestantes = differenceInHours(new Date(prazo_sla), new Date());
    
    if (horasRestantes < 0) {
      return { text: `ATRASADA ${Math.abs(horasRestantes)}h`, color: "text-red-600", icon: AlertCircle };
    } else if (horasRestantes < 6) {
      return { text: `${horasRestantes}h restantes`, color: "text-yellow-600", icon: Clock };
    } else {
      return { text: `${horasRestantes}h`, color: "text-muted-foreground", icon: Clock };
    }
  };

  if (isLoading) {
    return <p>Carregando dúvidas...</p>;
  }

  const duvidasPendentes = duvidas.filter(d => d.status === "pendente" || d.status === "em_analise");
  const duvidasRespondidas = duvidas.filter(d => d.status === "respondida");

  return (
    <>
      <div className="space-y-6">
        {duvidasPendentes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Dúvidas Pendentes ({duvidasPendentes.length})
            </h3>
            <div className="space-y-3">
              {duvidasPendentes.map((duvida) => {
                const slaInfo = getSLAInfo(duvida.prazo_sla, duvida.status);
                const SLAIcon = slaInfo?.icon;

                return (
                  <Card key={duvida.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">{duvida.titulo}</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={duvida.prioridade === "urgente" ? "destructive" : "secondary"}>
                              {duvida.prioridade}
                            </Badge>
                            {slaInfo && SLAIcon && (
                              <span className={`text-sm flex items-center gap-1 ${slaInfo.color} font-medium`}>
                                <SLAIcon className="h-3 w-3" />
                                SLA: {slaInfo.text}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(duvida.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {duvida.duvida}
                      </p>
                      {duvida.contexto && (
                        <div className="bg-muted p-3 rounded text-sm">
                          <strong>Contexto:</strong> {duvida.contexto}
                        </div>
                      )}
                      <Button size="sm" onClick={() => setDuvidaSelecionada(duvida)}>
                        Responder
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {duvidasRespondidas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Dúvidas Respondidas ({duvidasRespondidas.length})
            </h3>
            <div className="space-y-3">
              {duvidasRespondidas.map((duvida) => (
                <Card key={duvida.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{duvida.titulo}</CardTitle>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Respondida
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{duvida.duvida}</p>
                    <div className="bg-primary/5 p-3 rounded text-sm">
                      <strong>Sua resposta:</strong> {duvida.resposta_mentor}
                    </div>
                    {duvida.respondida_em && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(duvida.respondida_em), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {duvidas.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma dúvida registrada por {profile?.nome_completo || "este mentorado"}
            </CardContent>
          </Card>
        )}
      </div>

      {duvidaSelecionada && (
        <ResponderDuvidaModal
          duvida={duvidaSelecionada}
          open={!!duvidaSelecionada}
          onOpenChange={(open) => !open && setDuvidaSelecionada(null)}
        />
      )}
    </>
  );
}
