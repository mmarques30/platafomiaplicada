import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCreateVideo, useUpdateVideo, useModulos } from "@/hooks/admin/useContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Plus, History, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Material } from "@/types/video";
import { MaterialUpload } from "./MaterialUpload";
import { MaterialList } from "./MaterialList";
import { HistoricoDrawer } from "./HistoricoDrawer";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: any;
  defaultModuloId?: string | null;
}

export function VideoModal({ open, onOpenChange, video, defaultModuloId }: VideoModalProps) {
  const { data: modulos } = useModulos();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [adicionandoMaterial, setAdicionandoMaterial] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (video) {
      reset(video);
      setThumbnailPreview(video.thumbnail_customizado_url || "");
      setThumbnailFile(null);
      setValue("visivel_mentorados", video.visivel_mentorados ?? false);
      setValue("thumbnail_customizado_url", video.thumbnail_customizado_url || "");
      
      // Carregar materiais existentes
      try {
        const materiaisExistentes = typeof video.materiais === 'string' 
          ? JSON.parse(video.materiais) 
          : video.materiais || [];
        setMateriais(Array.isArray(materiaisExistentes) ? materiaisExistentes : []);
      } catch {
        setMateriais([]);
      }
    } else {
      reset({ 
        titulo: "", 
        descricao: "", 
        youtube_url: "", 
        modulo_id: defaultModuloId || null,
        trilha_id: null,
        duracao: 0, 
        ordem: 0, 
        ativo: true,
        visivel_mentorados: false,
        thumbnail_customizado_url: "",
        data_aula: null
      });
      setThumbnailPreview("");
      setThumbnailFile(null);
      setMateriais([]);
    }
    setAdicionandoMaterial(false);
  }, [video, reset, open, defaultModuloId]);

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
      const ext = thumbnailFile.name.split('.').pop()?.toLowerCase() || 'png';
      const basePath = video?.id ? `videos/${video.id}` : `temp/${Date.now()}`;
      const filePath = `${basePath}/thumbnail-${Date.now()}.${ext}`;

      console.info("[VideoModal] Uploading thumbnail to:", filePath);

      const { error: uploadError } = await supabase.storage
        .from('video-thumbnails')
        .upload(filePath, thumbnailFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: thumbnailFile.type || 'image/*',
        });

      if (uploadError) throw uploadError;

      // Tenta URL pública
      const { data: publicData } = supabase.storage
        .from('video-thumbnails')
        .getPublicUrl(filePath);

      let finalUrl = publicData?.publicUrl;

      // Fallback para URL assinada caso bucket não seja público
      if (!finalUrl) {
        const { data: signed, error: signedErr } = await supabase.storage
          .from('video-thumbnails')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 ano
        if (signedErr) throw signedErr;
        finalUrl = signed?.signedUrl || null;
      }

      console.info("[VideoModal] Thumbnail URL:", finalUrl);
      
      if (finalUrl) {
        setThumbnailPreview(finalUrl);
        setValue("thumbnail_customizado_url", finalUrl, { shouldDirty: true });
      }

      return finalUrl || null;
    } catch (error) {
      console.error("[VideoModal] Error uploading thumbnail:", error);
      toast.error("Erro ao enviar o thumbnail. Tente novamente.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAdicionarMaterial = (material: Material) => {
    setMateriais([...materiais, material]);
    setAdicionandoMaterial(false);
  };

  const handleRemoverMaterial = (index: number) => {
    setMateriais(materiais.filter((_, i) => i !== index));
    toast.success("Material removido");
  };

  const onSubmit = async (data: any) => {
    if (uploading) {
      toast.info("Aguarde o upload do thumbnail finalizar");
      return;
    }

    // Validar se módulo foi selecionado
    if (!data.modulo_id) {
      toast.error("Selecione um módulo");
      return;
    }

    // Se houver novo upload, fazer upload primeiro
    if (thumbnailFile) {
      const uploadedUrl = await uploadThumbnail();
      if (!uploadedUrl) {
        // Upload falhou, não continuar
        return;
      }
    }

    // Obter thumbnail do form (já foi setado pelo uploadThumbnail)
    const formThumb = watch("thumbnail_customizado_url")?.trim();
    const thumbnailUrl = formThumb || video?.thumbnail_customizado_url || null;

    const submitData = { 
      ...data, 
      thumbnail_customizado_url: thumbnailUrl,
      materiais: materiais
    };

    console.info("[VideoModal] Submitting video data:", submitData);

    if (video) {
      updateVideo.mutate({ id: video.id, ...submitData }, { onSuccess: () => onOpenChange(false) });
    } else {
      createVideo.mutate(submitData, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{video ? "Editar Vídeo" : "Novo Vídeo"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          <div className="space-y-4 pr-4">
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
            <Select 
              value={watch("modulo_id") || undefined}
              onValueChange={(value) => {
                setValue("modulo_id", value, { shouldValidate: true });
                // Popular trilha_id automaticamente baseado no módulo selecionado
                const modulo = modulos?.find((m: any) => m.id === value);
                if (modulo) {
                  setValue("trilha_id", modulo.trilha_id);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um módulo" />
              </SelectTrigger>
              <SelectContent>
                {modulos?.map((modulo: any) => (
                  <SelectItem key={modulo.id} value={modulo.id}>
                    {modulo.trilha?.titulo} — {modulo.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duração (minutos)</Label>
            <Input type="number" {...register("duracao", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Data da Aula</Label>
            <Input
              type="date"
              value={watch("data_aula") ?? ""}
              onChange={(e) => setValue("data_aula", e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Quando esta aula aconteceu (para orientação em revisões)
            </p>
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

          <div className="space-y-2">
            <Label>Materiais de Suporte</Label>
            <div className="space-y-2">
              <MaterialList materiais={materiais} onRemove={handleRemoverMaterial} />

              {!adicionandoMaterial ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAdicionandoMaterial(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Material
                </Button>
              ) : (
                <MaterialUpload
                  onAdd={handleAdicionarMaterial}
                  onCancel={() => setAdicionandoMaterial(false)}
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={watch("visivel_mentorados")} 
              onCheckedChange={(checked) => setValue("visivel_mentorados", checked)} 
            />
            <Label>Visível para Mentorados</Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Deixe desmarcado para preparar a aula antes de liberá-la
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="visivel_apenas_pro"
              checked={watch("visivel_apenas_pro")}
              onCheckedChange={(checked) => setValue("visivel_apenas_pro", !!checked)}
            />
            <Label htmlFor="visivel_apenas_pro">
              🔒 Conteúdo Exclusivo PRO
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Apenas mentorados com plano PRO terão acesso a este vídeo
          </p>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {video && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHistoricoOpen(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Ver Histórico
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={uploading}>
              {uploading ? "Enviando thumbnail..." : video ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      
      {video && (
        <HistoricoDrawer
          open={historicoOpen}
          onOpenChange={setHistoricoOpen}
          tabela="videos"
          registroId={video.id}
          titulo={video.titulo}
        />
      )}
    </Dialog>
  );
}
