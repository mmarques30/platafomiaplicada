import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useCategoriasQA } from "@/hooks/useCategoriasQA";
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
  const { categorias } = useCategoriasQA();
  const [resposta, setResposta] = useState("");
  const [publicarQA, setPublicarQA] = useState(duvida.publicar_qa || false);
  const [categoriaQAId, setCategoriaQAId] = useState<string>(duvida.categoria_qa_id || "");
  const [videoQAUrl, setVideoQAUrl] = useState("");
  
  const mentoradoSolicitouQA = duvida.publicar_qa === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    responderDuvida(
      { 
        id: duvida.id, 
        resposta,
        publicar_qa: publicarQA,
        categoria_qa_id: publicarQA ? categoriaQAId : undefined,
        video_qa_url: publicarQA && videoQAUrl ? videoQAUrl : undefined,
      },
      {
        onSuccess: () => {
          setResposta("");
          setPublicarQA(false);
          setCategoriaQAId("");
          setVideoQAUrl("");
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

            <div className="border-t pt-4 space-y-4">
              {mentoradoSolicitouQA ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm font-medium">
                      Mentorado solicitou Q&A na categoria: {duvida.categorias_qa?.nome || "Sem categoria"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-qa">URL do Vídeo da Resposta (Opcional)</Label>
                    <Input
                      id="video-qa"
                      value={videoQAUrl}
                      onChange={(e) => setVideoQAUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Link do vídeo com a resposta gravada para o Q&A
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="publicar-qa" className="text-base">Publicar no Q&A</Label>
                      <p className="text-sm text-muted-foreground">
                        Esta resposta será visível no banco de perguntas frequentes
                      </p>
                    </div>
                    <Switch
                      id="publicar-qa"
                      checked={publicarQA}
                      onCheckedChange={setPublicarQA}
                    />
                  </div>

                  {publicarQA && (
                    <div className="space-y-4 pl-4 border-l-2">
                      <div className="space-y-2">
                        <Label htmlFor="categoria-qa">Categoria Q&A *</Label>
                        <Select value={categoriaQAId} onValueChange={setCategoriaQAId} required>
                          <SelectTrigger id="categoria-qa">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.filter(c => c.ativo).map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="video-qa">URL do Vídeo (Opcional)</Label>
                        <Input
                          id="video-qa"
                          value={videoQAUrl}
                          onChange={(e) => setVideoQAUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          type="url"
                        />
                        <p className="text-xs text-muted-foreground">
                          Link do vídeo com a resposta gravada (será gerenciado como trilha)
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isRespondendo || (publicarQA && !categoriaQAId)}>
                {isRespondendo ? "Enviando..." : "Enviar Resposta"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
