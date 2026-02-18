import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, FileText, Send, CheckCircle2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega: any | null;
  onSave: (dados: { status?: string; descricao?: string; prazo?: string | null; responsavel_id?: string | null }) => void;
  isSaving: boolean;
  isLider: boolean;
  membros?: { id: string; nome_completo: string }[];
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", icon: Clock },
  { value: "em_andamento", label: "Em Andamento", icon: FileText },
  { value: "aguardando_validacao", label: "Aguardando Validação", icon: Send },
  { value: "aprovada", label: "Aprovada", icon: CheckCircle2 },
];

export function EntregaSkillsEditModal({ open, onOpenChange, entrega, onSave, isSaving, isLider, membros = [] }: Props) {
  const [status, setStatus] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState<Date | undefined>(undefined);
  const [responsavelId, setResponsavelId] = useState<string>("sem_responsavel");

  useEffect(() => {
    if (entrega) {
      setStatus(entrega.status || "pendente");
      setDescricao(entrega.descricao || "");
      setPrazo(entrega.prazo ? new Date(entrega.prazo) : undefined);
      setResponsavelId(entrega.responsavel_id || "sem_responsavel");
    }
  }, [entrega, open]);

  if (!entrega) return null;

  const originalPrazo = entrega.prazo ? new Date(entrega.prazo).toDateString() : undefined;
  const currentPrazo = prazo?.toDateString();
  const originalResponsavel = entrega.responsavel_id || "sem_responsavel";

  const hasChanges =
    status !== entrega.status ||
    descricao !== (entrega.descricao || "") ||
    currentPrazo !== originalPrazo ||
    responsavelId !== originalResponsavel;

  const handleSave = () => {
    const dados: any = {};
    if (status !== entrega.status) dados.status = status;
    if (descricao !== (entrega.descricao || "")) dados.descricao = descricao || null;
    if (currentPrazo !== originalPrazo) {
      dados.prazo = prazo ? format(prazo, "yyyy-MM-dd") : null;
    }
    if (responsavelId !== originalResponsavel) {
      dados.responsavel_id = responsavelId === "sem_responsavel" ? null : responsavelId;
    }
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

          <div>
            <Label>Responsável</Label>
            <Select value={responsavelId} onValueChange={setResponsavelId}>
              <SelectTrigger><SelectValue placeholder="Selecionar responsável" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_responsavel">Sem responsável</SelectItem>
                {membros.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.nome_completo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !prazo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {prazo ? format(prazo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar prazo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={prazo}
                  onSelect={setPrazo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

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
