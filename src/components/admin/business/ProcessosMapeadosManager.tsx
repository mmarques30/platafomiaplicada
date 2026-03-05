import { useState } from "react";
import { FileText, Trash2, Plus, Upload, ExternalLink, Loader2, Edit2, ArrowUp, ArrowDown, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProcessosMapeadosManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

interface Processo {
  id: string;
  contrato_id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  url: string | null;
  arquivo_path: string | null;
  ordem: number | null;
  created_at: string;
  updated_at: string;
}

export function ProcessosMapeadosManager({ contratoId, userId, userName }: ProcessosMapeadosManagerProps) {
  const queryClient = useQueryClient();
  const queryKey = ["processos-mapeados-admin", contratoId];

  const { data: processos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos_mapeados_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data as Processo[];
    },
    enabled: !!contratoId,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Processo | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", tipo: "link", url: "" });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sanitizeFilename = (name: string) =>
    name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Processo>) => {
      const { error } = await supabase.from("processos_mapeados_business").insert([payload as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Processo criado");
    },
    onError: () => toast.error("Erro ao criar processo"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Processo> & { id: string }) => {
      const { error } = await supabase.from("processos_mapeados_business").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Processo atualizado");
    },
    onError: () => toast.error("Erro ao atualizar processo"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("processos_mapeados_business").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Processo excluído");
    },
    onError: () => toast.error("Erro ao excluir processo"),
  });

  const handleOpenDialog = (processo?: Processo) => {
    if (processo) {
      setEditing(processo);
      setForm({
        titulo: processo.titulo,
        descricao: processo.descricao || "",
        tipo: processo.tipo,
        url: processo.url || "",
      });
    } else {
      setEditing(null);
      setForm({ titulo: "", descricao: "", tipo: "link", url: "" });
    }
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("Preencha o título");
      return;
    }

    setUploading(true);
    try {
      let arquivo_path: string | null = null;
      let url: string | null = form.tipo === "link" ? form.url : null;

      if (form.tipo === "documento" && selectedFile) {
        const safeName = sanitizeFilename(selectedFile.name);
        const path = `${contratoId}/processos/${Date.now()}_${safeName}`;
        const { error } = await supabase.storage.from("contratos-business").upload(path, selectedFile);
        if (error) throw error;
        arquivo_path = path;
      } else if (form.tipo === "documento" && editing?.arquivo_path) {
        arquivo_path = editing.arquivo_path;
      }

      const nextOrdem = processos.length > 0 ? Math.max(...processos.map(p => p.ordem || 0)) + 1 : 1;

      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          tipo: form.tipo,
          url,
          arquivo_path,
        });
      } else {
        await createMutation.mutateAsync({
          contrato_id: contratoId,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          tipo: form.tipo,
          url,
          arquivo_path,
          ordem: nextOrdem,
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= processos.length) return;

    const a = processos[index];
    const b = processos[swapIndex];

    await Promise.all([
      updateMutation.mutateAsync({ id: a.id, ordem: b.ordem || swapIndex + 1 }),
      updateMutation.mutateAsync({ id: b.id, ordem: a.ordem || index + 1 }),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Processos Mapeados</h2>
          <Badge variant="secondary" className="text-xs">{processos.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {userName && (
            <Badge variant="outline" className="text-xs">{userName}</Badge>
          )}
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Processo
          </Button>
        </div>
      </div>

      {processos.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum processo mapeado</h3>
            <p className="text-muted-foreground text-sm">
              Adicione instruções de trabalho e SOPs para o cliente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {processos.map((p, idx) => (
            <Card key={p.id} className="border-border/50 hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => handleReorder(idx, "up")}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === processos.length - 1} onClick={() => handleReorder(idx, "down")}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {p.tipo === "link" ? <Link2 className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{p.titulo}</h4>
                      {p.descricao && <p className="text-xs text-muted-foreground truncate mt-0.5">{p.descricao}</p>}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {p.tipo === "link" ? "Link" : "Documento"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.tipo === "link" && p.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(p.url!, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(p)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir processo?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(p.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Processo" : "Novo Processo Mapeado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: SOP de Atendimento ao Cliente"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Breve descrição do processo"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link externo</SelectItem>
                  <SelectItem value="documento">Documento (upload)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.tipo === "link" && (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            )}
            {form.tipo === "documento" && (
              <div className="space-y-2">
                <Label>Arquivo</Label>
                {editing?.arquivo_path && !selectedFile && (
                  <p className="text-xs text-muted-foreground">Arquivo atual: {editing.arquivo_path.split("/").pop()}</p>
                )}
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Salvando...</> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
