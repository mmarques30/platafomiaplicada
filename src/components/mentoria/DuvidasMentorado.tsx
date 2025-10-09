import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, CheckCircle2, Clock } from "lucide-react";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useState } from "react";
import { NovaDuvidaModal } from "./NovaDuvidaModal";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function DuvidasMentorado() {
  const navigate = useNavigate();
  const { duvidas } = useDuvidasMentoria();
  const [modalOpen, setModalOpen] = useState(false);

  const duvidasRecentes = duvidas.slice(0, 3);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Suas Dúvidas
            </CardTitle>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Dúvida
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {duvidasRecentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma dúvida registrada. Clique em "Nova Dúvida" para enviar sua primeira pergunta.
            </p>
          ) : (
            <>
              {duvidasRecentes.map(duvida => (
                <div key={duvida.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {duvida.status === "respondida" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <h4 className="font-medium text-sm">{duvida.titulo}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {duvida.duvida}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={duvida.status === "respondida" ? "default" : "secondary"} className="text-xs">
                          {duvida.status === "respondida" ? "Respondida" : "Aguardando"}
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
                </div>
              ))}

              {duvidas.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => navigate("/mentoria/duvidas")}>
                  Ver todas as dúvidas ({duvidas.length})
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <NovaDuvidaModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
