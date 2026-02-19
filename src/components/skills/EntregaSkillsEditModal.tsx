import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Clock, FileText, Send, CheckCircle2, CalendarIcon, Plus, Trash2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega: any | null;
  onSave: (dados: { titulo?: string; status?: string; descricao?: string; prazo?: string | null; responsavel_id?: string | null; instrucoes?: string | null }) => void;
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
  const queryClient = useQueryClient();
  const [tituloValue, setTituloValue] = useState("");
  const [status, setStatus] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState<Date | undefined>(undefined);
  const [responsavelId, setResponsavelId] = useState<string>("sem_responsavel");

  // Subtarefa inline form
  const [novaSub, setNovaSub] = useState("");
  const [novaSubResp, setNovaSubResp] = useState<string | null>(null);
  const [instrucoes, setInstrucoes] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const entregaId = entrega?.id;

  useEffect(() => {
    if (entrega) {
      setTituloValue(entrega.titulo || "");
      setStatus(entrega.status || "pendente");
      setDescricao(entrega.descricao || "");
      setPrazo(entrega.prazo ? new Date(entrega.prazo) : undefined);
      setResponsavelId(entrega.responsavel_id || "sem_responsavel");
      setInstrucoes(entrega.instrucoes || "");
    }
    setNovaSub("");
    setNovaSubResp(null);
  }, [entrega, open]);

  const handleRegenerarInstrucoes = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("regenerar-instrucoes-entrega", {
        body: {
          titulo: tituloValue,
          descricao,
          projeto_titulo: entrega?.backlog_item?.titulo || null,
        },
      });
      if (error) throw error;
      if (data?.instrucoes) {
        setInstrucoes(data.instrucoes);
        toast.success("Instruções regeneradas com IA!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao regenerar instruções");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Fetch subtarefas for this AI entrega
  const { data: subtarefas = [] } = useQuery({
    queryKey: ["subtarefas-entrega-ia", entregaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtarefas_entregas_skills")
        .select("*")
        .eq("entrega_skills_id", entregaId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!entregaId && open,
  });

  // Subtarefa mutations
  const addSubMutation = useMutation({
    mutationFn: async ({ titulo, responsavel_id }: { titulo: string; responsavel_id: string | null }) => {
      const { error } = await supabase.from("subtarefas_entregas_skills").insert({
        entrega_skills_id: entregaId!,
        titulo,
        responsavel_id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtarefas-entrega-ia", entregaId] });
      setNovaSub("");
      setNovaSubResp(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleSubMutation = useMutation({
    mutationFn: async ({ id, concluida }: { id: string; concluida: boolean }) => {
      const { error } = await supabase.from("subtarefas_entregas_skills").update({ concluida } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subtarefas-entrega-ia", entregaId] }),
    onError: (err: any) => toast.error(err.message),
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subtarefas_entregas_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subtarefas-entrega-ia", entregaId] }),
    onError: (err: any) => toast.error(err.message),
  });

  if (!entrega) return null;

  const originalPrazo = entrega.prazo ? new Date(entrega.prazo).toDateString() : undefined;
  const currentPrazo = prazo?.toDateString();
  const originalResponsavel = entrega.responsavel_id || "sem_responsavel";

  const hasChanges =
    tituloValue !== (entrega.titulo || "") ||
    status !== entrega.status ||
    descricao !== (entrega.descricao || "") ||
    currentPrazo !== originalPrazo ||
    responsavelId !== originalResponsavel ||
    instrucoes !== (entrega.instrucoes || "");

  const handleSave = () => {
    const dados: any = {};
    if (tituloValue.trim() && tituloValue !== (entrega.titulo || "")) dados.titulo = tituloValue.trim();
    if (status !== entrega.status) dados.status = status;
    if (descricao !== (entrega.descricao || "")) dados.descricao = descricao || null;
    if (currentPrazo !== originalPrazo) {
      dados.prazo = prazo ? format(prazo, "yyyy-MM-dd") : null;
    }
    if (responsavelId !== originalResponsavel) {
      dados.responsavel_id = responsavelId === "sem_responsavel" ? null : responsavelId;
    }
    if (instrucoes !== (entrega.instrucoes || "")) {
      dados.instrucoes = instrucoes || null;
    }
    onSave(dados);
  };

  const getMembroNome = (id: string | null) => membros.find(m => m.id === id)?.nome_completo || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Entrega</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Título</Label>
            <Input
              value={tituloValue}
              onChange={(e) => setTituloValue(e.target.value)}
              placeholder="Título da entrega"
              className="mt-0.5"
            />
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Instruções</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                disabled={isRegenerating}
                onClick={handleRegenerarInstrucoes}
              >
                {isRegenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Regenerar com IA
              </Button>
            </div>
            <Textarea
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              rows={4}
              placeholder="Instruções serão geradas pela IA..."
              className="text-sm"
            />
          </div>

          {/* Subtarefas */}
          {entregaId && (
            <div className="space-y-2">
              <Label>Subtarefas</Label>
              <div className="space-y-1">
                {subtarefas.map((sub: any) => (
                  <div key={sub.id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5">
                    <Checkbox
                      checked={sub.concluida}
                      onCheckedChange={(checked) => toggleSubMutation.mutate({ id: sub.id, concluida: !!checked })}
                    />
                    <span className={cn("flex-1 text-sm", sub.concluida && "line-through text-muted-foreground")}>
                      {sub.titulo}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {getMembroNome(sub.responsavel_id)}
                    </span>
                    <button onClick={() => deleteSubMutation.mutate(sub.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {/* Inline add */}
              <div className="flex items-center gap-2">
                <Input
                  value={novaSub}
                  onChange={e => setNovaSub(e.target.value)}
                  placeholder="Nova subtarefa..."
                  className="h-8 text-sm flex-1"
                  onKeyDown={e => {
                    if (e.key === "Enter" && novaSub.trim()) {
                      addSubMutation.mutate({ titulo: novaSub.trim(), responsavel_id: novaSubResp });
                    }
                  }}
                />
                <Select value={novaSubResp || "none"} onValueChange={v => setNovaSubResp(v === "none" ? null : v)}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="Resp." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {membros.map(m => <SelectItem key={m.id} value={m.id}>{m.nome_completo}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  disabled={!novaSub.trim() || addSubMutation.isPending}
                  onClick={() => addSubMutation.mutate({ titulo: novaSub.trim(), responsavel_id: novaSubResp })}
                >
                  {addSubMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                </Button>
              </div>
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
