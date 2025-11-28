import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CursoClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curso?: any;
}

export function CursoClassroomModal({
  open,
  onOpenChange,
  curso,
}: CursoClassroomModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tipo, setTipo] = useState("video");
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (curso) {
      setTitulo(curso.titulo);
      setDescricao(curso.descricao || "");
      setThumbnailUrl(curso.thumbnail_url || "");
      setTipo(curso.tipo);
      setOrdem(curso.ordem);
      setAtivo(curso.ativo);
    } else {
      setTitulo("");
      setDescricao("");
      setThumbnailUrl("");
      setTipo("video");
      setOrdem(0);
      setAtivo(true);
    }
  }, [curso]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        titulo,
        descricao,
        thumbnail_url: thumbnailUrl,
        tipo,
        ordem,
        ativo,
        gratuito: true,
        conteudo: [],
      };

      if (curso) {
        const { error } = await supabase
          .from("classroom_courses")
          .update(data)
          .eq("id", curso.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("classroom_courses").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classroom-courses"] });
      toast.success(
        curso ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!"
      );
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao salvar curso");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle>{curso ? "Editar Curso" : "Novo Curso"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Introdução ao ChatGPT"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o conteúdo do curso..."
              className="bg-zinc-800 border-zinc-700 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>URL da Thumbnail</Label>
            <Input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="material">Material</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value))}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
            <Switch checked={ativo} onCheckedChange={setAtivo} />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!titulo || saveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
