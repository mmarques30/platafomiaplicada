import { useState } from "react";
import { Video, Trash2, Plus, Loader2, Edit2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
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

interface VideosInstrucaoManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

interface VideoInstrucao {
  id: string;
  contrato_id: string;
  titulo: string;
  descricao: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  ordem: number | null;
  created_at: string;
  updated_at: string;
}

export function VideosInstrucaoManager({ contratoId, userId, userName }: VideosInstrucaoManagerProps) {
  const queryClient = useQueryClient();
  const queryKey = ["videos-instrucao-admin", contratoId];

  const { data: videos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos_instrucao_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data as VideoInstrucao[];
    },
    enabled: !!contratoId,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VideoInstrucao | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", video_url: "" });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sanitizeFilename = (name: string) =>
    name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<VideoInstrucao>) => {
      const { error } = await supabase.from("videos_instrucao_business").insert([payload as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Vídeo criado");
    },
    onError: () => toast.error("Erro ao criar vídeo"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<VideoInstrucao> & { id: string }) => {
      const { error } = await supabase.from("videos_instrucao_business").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Vídeo atualizado");
    },
    onError: () => toast.error("Erro ao atualizar vídeo"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos_instrucao_business").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Vídeo excluído");
    },
    onError: () => toast.error("Erro ao excluir vídeo"),
  });

  const handleOpenDialog = (video?: VideoInstrucao) => {
    if (video) {
      setEditing(video);
      setForm({
        titulo: video.titulo,
        descricao: video.descricao || "",
        video_url: video.video_url || "",
      });
    } else {
      setEditing(null);
      setForm({ titulo: "", descricao: "", video_url: "" });
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
      let thumbnail_url: string | null = editing?.thumbnail_url || null;

      if (selectedFile) {
        const safeName = sanitizeFilename(selectedFile.name);
        const path = `${contratoId}/videos-thumbnails/${Date.now()}_${safeName}`;
        const { error } = await supabase.storage.from("contratos-business").upload(path, selectedFile);
        if (error) throw error;
        const { data: signedData } = await supabase.storage.from("contratos-business").createSignedUrl(path, 31536000);
        thumbnail_url = signedData?.signedUrl || null;
      }

      const nextOrdem = videos.length > 0 ? Math.max(...videos.map(v => v.ordem || 0)) + 1 : 1;

      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          video_url: form.video_url.trim() || null,
          thumbnail_url,
        });
      } else {
        await createMutation.mutateAsync({
          contrato_id: contratoId,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          video_url: form.video_url.trim() || null,
          thumbnail_url,
          ordem: nextOrdem,
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar vídeo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= videos.length) return;

    const a = videos[index];
    const b = videos[swapIndex];

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
          <Video className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Vídeos de Instrução</h2>
          <Badge variant="secondary" className="text-xs">{videos.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {userName && <Badge variant="outline" className="text-xs">{userName}</Badge>}
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Vídeo
          </Button>
        </div>
      </div>

      {videos.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo cadastrado</h3>
            <p className="text-muted-foreground text-sm">Adicione vídeos de instrução hospedados no Google Drive</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {videos.map((video, idx) => (
            <Card key={video.id} className="border-border/50 hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => handleReorder(idx, "up")}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === videos.length - 1} onClick={() => handleReorder(idx, "down")}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.titulo} className="h-12 w-20 object-cover rounded border border-border/50 flex-shrink-0" />
                    ) : (
                      <div className="h-12 w-20 rounded border border-border/50 bg-muted flex items-center justify-center flex-shrink-0">
                        <Video className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{video.titulo}</h4>
                      {video.descricao && <p className="text-xs text-muted-foreground truncate mt-0.5">{video.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {video.video_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(video.video_url!, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(video)}>
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
                          <AlertDialogTitle>Excluir vídeo?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(video.id)}>Excluir</AlertDialogAction>
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
            <DialogTitle>{editing ? "Editar Vídeo" : "Novo Vídeo de Instrução"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Como usar o módulo de vendas"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Breve descrição do vídeo"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Vídeo (Google Drive)</Label>
              <Input
                value={form.video_url}
                onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                placeholder="https://drive.google.com/file/d/.../view"
              />
              <p className="text-xs text-muted-foreground">Cole o link de compartilhamento do Google Drive</p>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail (opcional)</Label>
              {editing?.thumbnail_url && !selectedFile && (
                <img src={editing.thumbnail_url} alt="Preview" className="w-full h-32 object-cover rounded border border-border/50" />
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
