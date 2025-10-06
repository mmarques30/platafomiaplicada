import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ExercicioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercicio?: any;
}

export function ExercicioModal({ open, onOpenChange, exercicio }: ExercicioModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    video_id: "",
    titulo: "",
    descricao: "",
    tipo_resposta: "texto",
    ativo: true,
  });

  const { data: videos } = useQuery({
    queryKey: ["videos-for-exercicios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, titulo, trilha_id")
        .eq("ativo", true)
        .order("titulo");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (exercicio) {
      setFormData({
        video_id: exercicio.video_id || "",
        titulo: exercicio.titulo || "",
        descricao: exercicio.descricao || "",
        tipo_resposta: exercicio.tipo_resposta || "texto",
        ativo: exercicio.ativo ?? true,
      });
    } else {
      setFormData({
        video_id: "",
        titulo: "",
        descricao: "",
        tipo_resposta: "texto",
        ativo: true,
      });
    }
  }, [exercicio, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (exercicio) {
        const { error } = await supabase
          .from("exercicios_praticos")
          .update(formData)
          .eq("id", exercicio.id);
        if (error) throw error;
        toast.success("Exercício atualizado!");
      } else {
        const { error } = await supabase
          .from("exercicios_praticos")
          .insert(formData);
        if (error) throw error;
        toast.success("Exercício criado!");
      }

      queryClient.invalidateQueries({ queryKey: ["exercicios"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exercicio ? "Editar Exercício" : "Novo Exercício"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="video_id">Vídeo</Label>
            <Select
              value={formData.video_id}
              onValueChange={(value) => setFormData({ ...formData, video_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vídeo" />
              </SelectTrigger>
              <SelectContent>
                {videos?.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo_resposta">Tipo de Resposta</Label>
            <Select
              value={formData.tipo_resposta}
              onValueChange={(value) => setFormData({ ...formData, tipo_resposta: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="texto">Texto</SelectItem>
                <SelectItem value="documento">Documento</SelectItem>
                <SelectItem value="imagem">Imagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Exercício ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
