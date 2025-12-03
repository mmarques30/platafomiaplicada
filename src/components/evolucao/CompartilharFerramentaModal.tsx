import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useFerramentasCompartilhadas } from "@/hooks/useFerramentasCompartilhadas";

interface CompartilharFerramentaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompartilharFerramentaModal({ open, onOpenChange }: CompartilharFerramentaModalProps) {
  const { createFerramenta, isCreating } = useFerramentasCompartilhadas();
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    link: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFerramenta(formData, {
      onSuccess: () => {
        setFormData({
          nome: "",
          descricao: "",
          categoria: "",
          link: "",
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compartilhar Ferramenta com a Comunidade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Ferramenta *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Prompt para criar posts no LinkedIn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Explique para que serve e como usar"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="produtividade">Produtividade</SelectItem>
                <SelectItem value="conteudo">Criação de Conteúdo</SelectItem>
                <SelectItem value="analise">Análise de Dados</SelectItem>
                <SelectItem value="automacao">Automação</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (opcional)</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://notion.so/minha-ferramenta"
            />
            <p className="text-xs text-muted-foreground">
              Google Docs, Notion, GitHub, ou qualquer link público
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Compartilhando..." : "Compartilhar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
