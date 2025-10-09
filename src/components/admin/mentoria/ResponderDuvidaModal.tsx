import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ResponderDuvidaModalProps {
  duvida: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResponderDuvidaModal({ duvida, open, onOpenChange }: ResponderDuvidaModalProps) {
  const { responderDuvida, isRespondendo } = useDuvidasMentoria(duvida.user_id);
  const [resposta, setResposta] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    responderDuvida(
      { id: duvida.id, resposta },
      {
        onSuccess: () => {
          setResposta("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Responder Dúvida</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{duvida.titulo}</h3>
              <Badge variant={duvida.prioridade === "urgente" ? "destructive" : "secondary"}>
                {duvida.prioridade}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Dúvida:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {duvida.duvida}
              </p>
            </div>

            {duvida.contexto && (
              <div>
                <p className="text-sm font-medium mb-1">Contexto:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {duvida.contexto}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Enviada em {format(new Date(duvida.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resposta">Sua Resposta</Label>
              <Textarea
                id="resposta"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite sua resposta detalhada para ajudar o mentorado..."
                rows={8}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isRespondendo}>
                {isRespondendo ? "Enviando..." : "Enviar Resposta"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
