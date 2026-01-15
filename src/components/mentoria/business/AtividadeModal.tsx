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
      <DialogContent className="bg-slate-900 border-white/10 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Nova Atividade</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione uma nova atividade para este projeto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-slate-300">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Configurar integração com API"
              className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-slate-300">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes da atividade..."
              className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo" className="text-slate-300">Prazo</Label>
              <Input
                id="prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="bg-white/5 border-white/10 text-slate-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prioridade" className="text-slate-300">Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger className="bg-white/5 border-white/10 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="baixa" className="text-slate-100">Baixa</SelectItem>
                  <SelectItem value="media" className="text-slate-100">Média</SelectItem>
                  <SelectItem value="alta" className="text-slate-100">Alta</SelectItem>
                  <SelectItem value="urgente" className="text-slate-100">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!titulo.trim() || isLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white"
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
