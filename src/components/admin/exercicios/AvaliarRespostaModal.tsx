import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAvaliarResposta } from "@/hooks/useExercicios";

interface AvaliarRespostaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resposta?: any;
}

export function AvaliarRespostaModal({ open, onOpenChange, resposta }: AvaliarRespostaModalProps) {
  const avaliarMutation = useAvaliarResposta();
  const [nota, setNota] = useState<number>(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (resposta) {
      setNota(resposta.nota || 0);
      setFeedback(resposta.feedback_mentor || "");
    }
  }, [resposta, open]);

  const handleAprovar = async () => {
    if (!resposta) return;
    
    await avaliarMutation.mutateAsync({
      id: resposta.id,
      nota,
      feedback_mentor: feedback,
      status: 'aprovado',
    });
    onOpenChange(false);
  };

  const handleReprovar = async () => {
    if (!resposta) return;
    
    await avaliarMutation.mutateAsync({
      id: resposta.id,
      nota,
      feedback_mentor: feedback,
      status: 'reprovado',
    });
    onOpenChange(false);
  };

  if (!resposta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Avaliar Resposta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Exercício</Label>
            <p className="font-medium">{resposta.exercicios_praticos?.titulo}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Data de envio</Label>
            <p className="font-medium">{new Date(resposta.created_at).toLocaleDateString('pt-BR')}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Resposta</Label>
            {resposta.resposta_texto ? (
              <div className="p-3 bg-muted rounded-lg mt-1">
                <p className="whitespace-pre-wrap">{resposta.resposta_texto}</p>
              </div>
            ) : resposta.arquivo_url ? (
              <div className="mt-1">
                <a 
                  href={resposta.arquivo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ver arquivo enviado
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma resposta fornecida</p>
            )}
          </div>

          <div>
            <Label htmlFor="nota">Nota (0-100)</Label>
            <Input
              id="nota"
              type="number"
              min="0"
              max="100"
              value={nota}
              onChange={(e) => setNota(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="feedback">Feedback para o aluno</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Escreva um feedback construtivo..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleReprovar}
              disabled={avaliarMutation.isPending}
            >
              Reprovar
            </Button>
            <Button 
              type="button" 
              onClick={handleAprovar}
              disabled={avaliarMutation.isPending}
            >
              Aprovar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
