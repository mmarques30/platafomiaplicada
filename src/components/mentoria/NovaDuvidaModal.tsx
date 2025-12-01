import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { useCategoriasQA } from "@/hooks/useCategoriasQA";
import { useState } from "react";

interface NovaDuvidaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaDuvidaModal({ open, onOpenChange }: NovaDuvidaModalProps) {
  const { criarDuvida, isCriando } = useDuvidasMentoria();
  const { categorias } = useCategoriasQA();
  const [titulo, setTitulo] = useState("");
  const [duvida, setDuvida] = useState("");
  const [contexto, setContexto] = useState("");
  const [categoriaQAId, setCategoriaQAId] = useState<string>("");
  const [prioridade, setPrioridade] = useState<"baixa" | "normal" | "alta" | "urgente">("normal");
  const [querQA, setQuerQA] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    criarDuvida(
      { 
        titulo, 
        duvida, 
        contexto, 
        prioridade, 
        publicar_qa: querQA,
        categoria_qa_id: querQA ? categoriaQAId : null 
      },
      {
        onSuccess: () => {
          setTitulo("");
          setDuvida("");
          setContexto("");
          setCategoriaQAId("");
          setPrioridade("normal");
          setQuerQA(false);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Dúvida</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Dúvida</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Como integrar ChatGPT no meu projeto?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duvida">Sua Dúvida</Label>
            <Textarea
              id="duvida"
              value={duvida}
              onChange={(e) => setDuvida(e.target.value)}
              placeholder="Descreva sua dúvida em detalhes..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contexto">Contexto (Opcional)</Label>
            <Textarea
              id="contexto"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Ex: Ao tentar implementar X, encontrei o erro Y..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-1">
              <Label htmlFor="quer-qa" className="text-base">Quero discutir no Q&A</Label>
              <p className="text-sm text-muted-foreground">
                Marque se quiser que essa dúvida seja discutida na reunião semanal de Q&A
              </p>
            </div>
            <Switch
              id="quer-qa"
              checked={querQA}
              onCheckedChange={setQuerQA}
            />
          </div>

          {querQA && (
            <div className="space-y-2 pl-4 border-l-2">
              <Label htmlFor="categoria">Categoria Q&A *</Label>
              <Select value={categoriaQAId} onValueChange={setCategoriaQAId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.filter(c => c.ativo).map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select value={prioridade} onValueChange={(v: any) => setPrioridade(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCriando || (querQA && !categoriaQAId)}>
              {isCriando ? "Enviando..." : "Enviar Dúvida"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
