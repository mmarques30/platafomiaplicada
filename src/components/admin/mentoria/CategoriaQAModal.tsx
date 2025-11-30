import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCategoriasQA, CategoriaQA } from "@/hooks/useCategoriasQA";
import { useEffect, useState } from "react";

interface CategoriaQAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: CategoriaQA;
}

export function CategoriaQAModal({ open, onOpenChange, categoria }: CategoriaQAModalProps) {
  const { createCategoria, updateCategoria, isCriando, isAtualizando } = useCategoriasQA();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setDescricao(categoria.descricao || "");
      setOrdem(categoria.ordem);
      setAtivo(categoria.ativo);
    } else {
      setNome("");
      setDescricao("");
      setOrdem(0);
      setAtivo(true);
    }
  }, [categoria, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dados = { nome, descricao, ordem, ativo };

    if (categoria) {
      updateCategoria({ ...dados, id: categoria.id });
    } else {
      createCategoria(dados);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: IA Generativa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o tipo de perguntas desta categoria..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ordem">Ordem de Exibição</Label>
            <Input
              id="ordem"
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Define a ordem de exibição nos filtros (menor número aparece primeiro)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ativo">Categoria Ativa</Label>
              <p className="text-sm text-muted-foreground">
                Categorias inativas não aparecem nos filtros
              </p>
            </div>
            <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCriando || isAtualizando}>
              {isCriando || isAtualizando ? "Salvando..." : categoria ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
