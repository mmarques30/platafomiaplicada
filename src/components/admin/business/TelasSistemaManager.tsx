import { useState } from "react";
import { Monitor, Trash2, Plus, Loader2, Edit2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TelasSistemaManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

interface Tela {
  id: string;
  contrato_id: string;
  titulo: string;
  descricao: string | null;
  screenshot_url: string | null;
  link_sistema: string | null;
  ordem: number | null;
  created_at: string;
  updated_at: string;
}

export function TelasSistemaManager({ contratoId, userId, userName }: TelasSistemaManagerProps) {
  const queryClient = useQueryClient();
  const queryKey = ["telas-sistema-admin", contratoId];

  const { data: telas = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telas_sistema_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data as Tela[];
    },
    enabled: !!contratoId,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tela | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", link_sistema: "" });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sanitizeFilename = (name: string) =>
    name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Tela>) => {
      const { error } = await supabase.from("telas_sistema_business").insert([payload as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Tela criada");
    },
    onError: () => toast.error("Erro ao criar tela"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Tela> & { id: string }) => {
      const { error } = await supabase.from("telas_sistema_business").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Tela atualizada");
    },
    onError: () => toast.error("Erro ao atualizar tela"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("telas_sistema_business").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Tela excluída");
    },
    onError: () => toast.error("Erro ao excluir tela"),
  });

  const handleOpenDialog = (tela?: Tela) => {
    if (tela) {
      setEditing(tela);
      setForm({
        titulo: tela.titulo,
        descricao: tela.descricao || "",
        link_sistema: tela.link_sistema || "",
      });
    } else {
      setEditing(null);
      setForm({ titulo: "", descricao: "", link_sistema: "" });
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
      let screenshot_url: string | null = editing?.screenshot_url || null;

      if (selectedFile) {
        const safeName = sanitizeFilename(selectedFile.name);
        const path = `${contratoId}/telas/${Date.now()}_${safeName}`;
        const { error } = await supabase.storage.from("contratos-business").upload(path, selectedFile);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("contratos-business").getPublicUrl(path);
        // Since bucket is private, generate a long-lived signed URL
        const { data: signedData } = await supabase.storage.from("contratos-business").createSignedUrl(path, 31536000);
        screenshot_url = signedData?.signedUrl || urlData.publicUrl;
      }

      const nextOrdem = telas.length > 0 ? Math.max(...telas.map(t => t.ordem || 0)) + 1 : 1;

      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          link_sistema: form.link_sistema.trim() || null,
          screenshot_url,
        });
      } else {
        await createMutation.mutateAsync({
          contrato_id: contratoId,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          link_sistema: form.link_sistema.trim() || null,
          screenshot_url,
          ordem: nextOrdem,
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar tela:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= telas.length) return;

    const a = telas[index];
    const b = telas[swapIndex];

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
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Telas do Sistema</h2>
          <Badge variant="secondary" className="text-xs">{telas.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {userName && <Badge variant="outline" className="text-xs">{userName}</Badge>}
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Tela
          </Button>
        </div>
      </div>

      {telas.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Monitor className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma tela cadastrada</h3>
            <p className="text-muted-foreground text-sm">Adicione screenshots das telas do sistema do cliente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {telas.map((tela, idx) => (
            <Card key={tela.id} className="border-border/50 hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => handleReorder(idx, "up")}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === telas.length - 1} onClick={() => handleReorder(idx, "down")}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    {tela.screenshot_url ? (
                      <img src={tela.screenshot_url} alt={tela.titulo} className="h-12 w-20 object-cover rounded border border-border/50 flex-shrink-0" />
                    ) : (
                      <div className="h-12 w-20 rounded border border-border/50 bg-muted flex items-center justify-center flex-shrink-0">
                        <Monitor className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{tela.titulo}</h4>
                      {tela.descricao && <p className="text-xs text-muted-foreground truncate mt-0.5">{tela.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {tela.link_sistema && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(tela.link_sistema!, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(tela)}>
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
                          <AlertDialogTitle>Excluir tela?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(tela.id)}>Excluir</AlertDialogAction>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Tela" : "Nova Tela do Sistema"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Dashboard Principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Breve descrição da tela"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Link do Sistema (opcional)</Label>
              <Input
                value={form.link_sistema}
                onChange={e => setForm(f => ({ ...f, link_sistema: e.target.value }))}
                placeholder="https://app.exemplo.com/dashboard"
              />
            </div>
            <div className="space-y-2">
              <Label>Screenshot</Label>
              {editing?.screenshot_url && !selectedFile && (
                <img src={editing.screenshot_url} alt="Preview" className="w-full h-32 object-cover rounded border border-border/50" />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
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
