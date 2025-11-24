import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TarefaMentoria } from "@/hooks/useMentoriaTarefas";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatProjetoTitulo } from "@/lib/utils";

interface TarefaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tarefa: Partial<TarefaMentoria>) => void;
  tarefa?: TarefaMentoria | null;
  userId: string;
}

export const TarefaModal = ({ open, onOpenChange, onSave, tarefa, userId }: TarefaModalProps) => {
  const { projetos } = useMentoriaProjetos();
  const { sessoes } = useMentoriaSessoes();
  
  const [formData, setFormData] = useState<Partial<TarefaMentoria>>({
    titulo: tarefa?.titulo || "",
    descricao: tarefa?.descricao || "",
    tipo: tarefa?.tipo || "entrega",
    prioridade: tarefa?.prioridade || "media",
    prazo_entrega: tarefa?.prazo_entrega || "",
    projeto_id: tarefa?.projeto_id || undefined,
    sessao_id: tarefa?.sessao_id || undefined,
    link_externo: tarefa?.link_externo || "",
    user_id: userId
  });

  useEffect(() => {
    if (open && tarefa) {
      setFormData({
        titulo: tarefa.titulo || "",
        descricao: tarefa.descricao || "",
        tipo: tarefa.tipo || "entrega",
        prioridade: tarefa.prioridade || "media",
        prazo_entrega: tarefa.prazo_entrega || "",
        projeto_id: tarefa.projeto_id || undefined,
        sessao_id: tarefa.sessao_id || undefined,
        link_externo: tarefa.link_externo || "",
        user_id: userId
      });
    } else if (open && !tarefa) {
      setFormData({
        titulo: "",
        descricao: "",
        tipo: "entrega",
        prioridade: "media",
        prazo_entrega: "",
        projeto_id: undefined,
        sessao_id: undefined,
        link_externo: "",
        user_id: userId
      });
    }
  }, [open, tarefa, userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tarefa ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="leitura">Leitura</SelectItem>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                  <SelectItem value="revisao">Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade *</Label>
              <Select value={formData.prioridade} onValueChange={(value: any) => setFormData({ ...formData, prioridade: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Prazo de Entrega *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.prazo_entrega ? format(new Date(formData.prazo_entrega), "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.prazo_entrega ? new Date(formData.prazo_entrega) : undefined}
                  onSelect={(date) => setFormData({ ...formData, prazo_entrega: date?.toISOString().split('T')[0] || "" })}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projeto">Projeto (opcional)</Label>
              <Select 
                value={formData.projeto_id || "none"} 
                onValueChange={(value) => setFormData({ ...formData, projeto_id: value === "none" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem projeto vinculado</SelectItem>
                  {projetos.filter(p => p.user_id === userId).map(projeto => (
                    <SelectItem key={projeto.id} value={projeto.id}>{formatProjetoTitulo(projeto.titulo)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sessao">Sessão (opcional)</Label>
              <Select 
                value={formData.sessao_id || "none"} 
                onValueChange={(value) => setFormData({ ...formData, sessao_id: value === "none" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma sessão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem sessão vinculada</SelectItem>
                  {sessoes.filter(s => s.user_id === userId).map(sessao => (
                    <SelectItem key={sessao.id} value={sessao.id}>
                      {sessao.titulo} - {format(new Date(sessao.data_sessao), "dd/MM/yyyy", { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="link_externo">Link Externo (opcional)</Label>
            <Input
              id="link_externo"
              type="url"
              placeholder="https://..."
              value={formData.link_externo}
              onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {tarefa ? "Salvar Alterações" : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
