import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { MetaAcademy } from "@/hooks/useMetasAcademy";

interface MetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta?: MetaAcademy | null;
  onSave: (data: Partial<MetaAcademy>) => void;
  isSaving?: boolean;
}

export function MetaModal({ open, onOpenChange, meta, onSave, isSaving }: MetaModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("tarefa");
  const [prioridade, setPrioridade] = useState("media");
  const [prazo, setPrazo] = useState("");

  useEffect(() => {
    if (meta) {
      setTitulo(meta.titulo);
      setDescricao(meta.descricao || "");
      setTipo(meta.tipo);
      setPrioridade(meta.prioridade);
      setPrazo(meta.prazo || "");
    } else {
      setTitulo("");
      setDescricao("");
      setTipo("tarefa");
      setPrioridade("media");
      setPrazo("");
    }
  }, [meta, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(meta ? { id: meta.id } : {}),
      titulo,
      descricao: descricao || null,
      tipo,
      prioridade,
      prazo: prazo || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{meta ? "Editar" : "Nova"} Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Ex: Completar trilha de Claude" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes opcionais..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarefa">Tarefa</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                  <SelectItem value="projeto">Projeto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Prazo</Label>
            <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!titulo.trim() || isSaving}>
              {meta ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
