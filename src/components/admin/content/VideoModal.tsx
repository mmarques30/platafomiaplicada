import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateVideo, useUpdateVideo, useTrilhas } from "@/hooks/admin/useContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: any;
  defaultTrilhaId?: string | null;
}

export function VideoModal({ open, onOpenChange, video, defaultTrilhaId }: VideoModalProps) {
  const { data: trilhas } = useTrilhas();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (video) {
      reset(video);
      setThumbnailPreview(video.thumbnail_customizado_url || "");
      setThumbnailFile(null);
    } else {
      reset({ 
        titulo: "", 
        descricao: "", 
        youtube_url: "", 
        trilha_id: defaultTrilhaId || "", 
        duracao: 0, 
        ordem: 0, 
        ativo: true,
        thumbnail_customizado_url: ""
      });
      setThumbnailPreview("");
      setThumbnailFile(null);
    }
  }, [video, reset, open, defaultTrilhaId]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 2MB");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return null;

    setUploading(true);
    try {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('video-thumbnails')
        .upload(filePath, thumbnailFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('video-thumbnails')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error("Erro ao fazer upload do thumbnail");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    let thumbnailUrl = data.thumbnail_customizado_url;
    
    if (thumbnailFile) {
      const uploadedUrl = await uploadThumbnail();
      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
      }
    }

    const submitData = { ...data, thumbnail_customizado_url: thumbnailUrl };

    if (video) {
      updateVideo.mutate({ id: video.id, ...submitData }, { onSuccess: () => onOpenChange(false) });
    } else {
      createVideo.mutate(submitData, { onSuccess: () => onOpenChange(false) });
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
            <Label>Trilha</Label>
            <Select onValueChange={(value) => setValue("trilha_id", value)} defaultValue={watch("trilha_id")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {trilhas?.map((trilha: any) => (
                  <SelectItem key={trilha.id} value={trilha.id}>{trilha.titulo}</SelectItem>
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
          
          <div className="space-y-2">
            <Label>Thumbnail Customizado (Opcional)</Label>
            <div className="flex flex-col gap-2">
              {thumbnailPreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview("");
                      setValue("thumbnail_customizado_url", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Formato horizontal recomendado (16:9), máximo 2MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={uploading}>{uploading ? "Fazendo upload..." : video ? "Atualizar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
