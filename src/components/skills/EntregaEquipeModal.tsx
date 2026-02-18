import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Upload, X, Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EntregaEquipe } from "@/hooks/useEntregasEquipe";

interface Subtarefa {
  id: string;
  entrega_equipe_id: string;
  titulo: string;
  responsavel_id: string | null;
  concluida: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega: EntregaEquipe | null;
  membros: { id: string; nome_completo: string }[];
  projetos?: { id: string; titulo: string }[];
  onSave: (values: any) => void;
  onUploadFile: (file: File) => Promise<{ nome: string; url: string; tipo: string; uploaded_at: string }>;
  isSaving: boolean;
}

export function EntregaEquipeModal({ open, onOpenChange, entrega, membros, projetos = [], onSave, onUploadFile, isSaving }: Props) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("pendente");
  const [prioridade, setPrioridade] = useState("P2");
  const [responsavelId, setResponsavelId] = useState<string | null>(null);
  const [projetoId, setProjetoId] = useState<string | null>(null);
  const [prazo, setPrazo] = useState<Date | undefined>();
  const [progresso, setProgresso] = useState(0);
  const [notas, setNotas] = useState("");
  const [arquivos, setArquivos] = useState<{ nome: string; url: string; tipo: string; uploaded_at: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Subtarefa inline form
  const [novaSub, setNovaSub] = useState("");
  const [novaSubResp, setNovaSubResp] = useState<string | null>(null);

  const entregaId = entrega?.id;

  // Fetch subtarefas
  const { data: subtarefas = [] } = useQuery({
    queryKey: ["subtarefas-entrega", entregaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtarefas_entregas_skills")
        .select("*")
        .eq("entrega_equipe_id", entregaId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Subtarefa[];
    },
    enabled: !!entregaId && open,
  });

  // Computed progress from subtarefas
  const hasSubtarefas = subtarefas.length > 0;
  const computedProgress = hasSubtarefas
    ? Math.round((subtarefas.filter(s => s.concluida).length / subtarefas.length) * 100)
    : progresso;

  useEffect(() => {
    if (entrega) {
      setTitulo(entrega.titulo_equipe);
      setDescricao(entrega.descricao_equipe || "");
      setStatus(entrega.status_equipe);
      setPrioridade(entrega.prioridade_equipe || "P2");
      setResponsavelId(entrega.responsavel_id);
      setProjetoId(entrega.projeto_id);
      setPrazo(entrega.prazo_equipe ? new Date(entrega.prazo_equipe) : undefined);
      setProgresso(entrega.progresso);
      setNotas(entrega.notas || "");
      setArquivos(entrega.arquivos || []);
    } else {
      setTitulo(""); setDescricao(""); setStatus("pendente"); setPrioridade("P2");
      setResponsavelId(null); setProjetoId(null); setPrazo(undefined); setProgresso(0); setNotas(""); setArquivos([]);
    }
    setNovaSub(""); setNovaSubResp(null);
  }, [entrega, open]);

  // Mutations for subtarefas
  const addSubMutation = useMutation({
    mutationFn: async ({ titulo, responsavel_id }: { titulo: string; responsavel_id: string | null }) => {
      const { error } = await supabase.from("subtarefas_entregas_skills").insert({
        entrega_equipe_id: entregaId!,
        titulo,
        responsavel_id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtarefas-entrega", entregaId] });
      setNovaSub(""); setNovaSubResp(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleSubMutation = useMutation({
    mutationFn: async ({ id, concluida }: { id: string; concluida: boolean }) => {
      const { error } = await supabase.from("subtarefas_entregas_skills").update({ concluida } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subtarefas-entrega", entregaId] }),
    onError: (err: any) => toast.error(err.message),
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subtarefas_entregas_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subtarefas-entrega", entregaId] }),
    onError: (err: any) => toast.error(err.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await onUploadFile(file);
        setArquivos(prev => [...prev, result]);
      }
    } catch { /* handled in hook */ }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = () => {
    onSave({
      ...(entrega?.id ? { id: entrega.id } : {}),
      titulo_equipe: titulo,
      descricao_equipe: descricao || null,
      status_equipe: status,
      prioridade_equipe: prioridade,
      responsavel_id: responsavelId,
      projeto_id: projetoId,
      prazo_equipe: prazo ? format(prazo, "yyyy-MM-dd") : null,
      progresso: hasSubtarefas ? computedProgress : progresso,
      notas: notas || null,
      arquivos,
      entrega_id: entrega?.entrega_id || null,
    });
  };

  const getMembroNome = (id: string | null) => membros.find(m => m.id === id)?.nome_completo || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entrega?.id ? "Editar Entrega" : "Nova Entrega"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {projetos.length > 0 && (
            <div>
              <Label>Projeto Vinculado</Label>
              <Select value={projetoId || "none"} onValueChange={v => setProjetoId(v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.titulo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Título *</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Nome da entrega" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1 - Alta</SelectItem>
                  <SelectItem value="P2">P2 - Média</SelectItem>
                  <SelectItem value="P3">P3 - Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Responsável</Label>
            <Select value={responsavelId || "none"} onValueChange={v => setResponsavelId(v === "none" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar membro" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {membros.map(m => <SelectItem key={m.id} value={m.id}>{m.nome_completo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left", !prazo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {prazo ? format(prazo, "dd/MM/yyyy") : "Selecionar prazo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={prazo} onSelect={setPrazo} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Progresso */}
          <div>
            <Label>Progresso: {hasSubtarefas ? computedProgress : progresso}%</Label>
            {hasSubtarefas ? (
              <div className="mt-2 space-y-1">
                <Progress value={computedProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {subtarefas.filter(s => s.concluida).length} de {subtarefas.length} subtarefas concluídas
                </p>
              </div>
            ) : (
              <Slider value={[progresso]} onValueChange={v => setProgresso(v[0])} max={100} step={5} className="mt-2" />
            )}
          </div>

          {/* Subtarefas - só aparece ao editar */}
          {entregaId && (
            <div className="space-y-2">
              <Label>Subtarefas</Label>
              <div className="space-y-1">
                {subtarefas.map(sub => (
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

          <div>
            <Label>Notas</Label>
            <Textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} placeholder="Anotações livres..." />
          </div>
          <div>
            <Label>Arquivos</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {arquivos.map((a, i) => (
                <div key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                  <a href={a.url} target="_blank" rel="noreferrer" className="hover:underline">{a.nome}</a>
                  <button onClick={() => setArquivos(prev => prev.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <label className="mt-2 inline-flex items-center gap-1 text-sm cursor-pointer text-primary hover:underline">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
              <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
          <Button onClick={handleSave} disabled={!titulo.trim() || isSaving} className="w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
