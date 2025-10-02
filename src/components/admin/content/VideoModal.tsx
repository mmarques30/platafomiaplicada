import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateVideo, useUpdateVideo, useModulos } from "@/hooks/admin/useContent";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: any;
}

export function VideoModal({ open, onOpenChange, video }: VideoModalProps) {
  const { data: modulos } = useModulos();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (video) {
      reset(video);
    } else {
      reset({ titulo: "", descricao: "", youtube_url: "", modulo_id: "", duracao: 0, ordem: 0, ativo: true });
    }
  }, [video, reset, open]);

  const onSubmit = (data: any) => {
    if (video) {
      updateVideo.mutate({ id: video.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createVideo.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{video ? "Editar Vídeo" : "Novo Vídeo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...register("titulo")} required />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("descricao")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>URL do YouTube</Label>
            <Input {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." required />
          </div>
          <div className="space-y-2">
            <Label>Módulo</Label>
            <Select onValueChange={(value) => setValue("modulo_id", value)} defaultValue={watch("modulo_id")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um módulo" />
              </SelectTrigger>
              <SelectContent>
                {modulos?.map((modulo: any) => (
                  <SelectItem key={modulo.id} value={modulo.id}>{modulo.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duração (minutos)</Label>
            <Input type="number" {...register("duracao", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input type="number" {...register("ordem", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{video ? "Atualizar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
