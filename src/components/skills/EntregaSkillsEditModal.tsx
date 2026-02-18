import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, FileText, Send, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega: any | null;
  onSave: (dados: { status?: string; descricao?: string }) => void;
  isSaving: boolean;
  isLider: boolean;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", icon: Clock },
  { value: "em_andamento", label: "Em Andamento", icon: FileText },
  { value: "aguardando_validacao", label: "Aguardando Validação", icon: Send },
  { value: "aprovada", label: "Aprovada", icon: CheckCircle2 },
];

export function EntregaSkillsEditModal({ open, onOpenChange, entrega, onSave, isSaving, isLider }: Props) {
  const [status, setStatus] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (entrega) {
      setStatus(entrega.status || "pendente");
      setDescricao(entrega.descricao || "");
    }
  }, [entrega, open]);

  if (!entrega) return null;

  const hasChanges = status !== entrega.status || descricao !== (entrega.descricao || "");

  const handleSave = () => {
    const dados: any = {};
    if (status !== entrega.status) dados.status = status;
    if (descricao !== (entrega.descricao || "")) dados.descricao = descricao || null;
    onSave(dados);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Entrega
            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">IA</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Título</Label>
            <p className="font-medium">{entrega.titulo}</p>
          </div>

          {entrega.responsavel && (
            <div>
              <Label className="text-muted-foreground text-xs">Responsável</Label>
              <p className="text-sm">{entrega.responsavel.nome_completo}</p>
            </div>
          )}

          {entrega.prazo && (
            <div>
              <Label className="text-muted-foreground text-xs">Prazo</Label>
              <p className="text-sm">{format(new Date(entrega.prazo), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          )}

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} placeholder="Adicionar descrição..." />
          </div>

          {entrega.instrucoes && (
            <div>
              <Label className="text-muted-foreground text-xs">Instruções</Label>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{entrega.instrucoes}</p>
            </div>
          )}

          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
