import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AtividadeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    titulo: string;
    descricao?: string;
    prazo_entrega?: string;
    prioridade: string;
  }) => void;
  isLoading?: boolean;
}

export function AtividadeModal({ open, onOpenChange, onSave, isLoading }: AtividadeModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [prioridade, setPrioridade] = useState("media");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    
    onSave({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      prazo_entrega: prazo || undefined,
      prioridade,
    });
    
    // Reset form
    setTitulo("");
    setDescricao("");
    setPrazo("");
    setPrioridade("media");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-white/10 text-muted-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-muted-foreground">Nova Atividade</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Adicione uma nova atividade para este projeto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-muted-foreground">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Configurar integração com API"
              className="bg-white/5 border-white/10 text-muted-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-muted-foreground">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes da atividade..."
              className="bg-white/5 border-white/10 text-muted-foreground placeholder:text-muted-foreground min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo" className="text-muted-foreground">Prazo</Label>
              <Input
                id="prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="bg-white/5 border-white/10 text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prioridade" className="text-muted-foreground">Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger className="bg-white/5 border-white/10 text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="baixa" className="text-muted-foreground">Baixa</SelectItem>
                  <SelectItem value="media" className="text-muted-foreground">Média</SelectItem>
                  <SelectItem value="alta" className="text-muted-foreground">Alta</SelectItem>
                  <SelectItem value="urgente" className="text-muted-foreground">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!titulo.trim() || isLoading}
              className="bg-secondary hover:bg-secondary text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Criar Atividade'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
