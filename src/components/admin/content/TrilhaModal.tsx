import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateTrilha, useUpdateTrilha } from "@/hooks/admin/useContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface TrilhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trilha?: any;
}

export function TrilhaModal({ open, onOpenChange, trilha }: TrilhaModalProps) {
  const createTrilha = useCreateTrilha();
  const updateTrilha = useUpdateTrilha();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("núcleo");
  
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      titulo: "",
      descricao: "",
      nivel: "iniciante",
      categoria: "núcleo",
      ordem: 0,
      ativo: true,
      imagem_url: "",
    },
  });

  useEffect(() => {
    if (trilha) {
      reset(trilha);
      setSelectedCategoria(trilha.categoria || "núcleo");
      setImagePreview(trilha.imagem_url || "");
      setImageFile(null);
    } else {
      reset({
        titulo: "",
        descricao: "",
        nivel: "iniciante",
        categoria: "núcleo",
        ordem: 0,
        ativo: true,
        imagem_url: "",
      });
      setSelectedCategoria("núcleo");
      setImagePreview("");
      setImageFile(null);
    }
  }, [trilha, reset, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trilhas-imagens')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('trilhas-imagens')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao fazer upload da imagem");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    let imagemUrl = data.imagem_url;
    
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imagemUrl = uploadedUrl;
      }
    }

    const submitData = { ...data, imagem_url: imagemUrl };

    if (trilha) {
      updateTrilha.mutate({ id: trilha.id, ...submitData }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createTrilha.mutate(submitData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const ativo = watch("ativo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{trilha ? "Editar Trilha" : "Nova Trilha"}</DialogTitle>
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
            <Label>Nível</Label>
            <Select onValueChange={(value) => setValue("nivel", value)} defaultValue={watch("nivel")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria da Trilha</Label>
            <Select 
              value={selectedCategoria} 
              onValueChange={(value) => {
                setSelectedCategoria(value);
                setValue("categoria", value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aulas semanais">Aulas Semanais</SelectItem>
                <SelectItem value="núcleo">NÚCLEO</SelectItem>
                <SelectItem value="ferramentas">FERRAMENTAS</SelectItem>
                <SelectItem value="profissão">PROFISSÃO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Imagem da Trilha</Label>
            <div className="flex flex-col gap-2">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setValue("imagem_url", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 1920x1080px, máximo 2MB
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input type="number" {...register("ordem", { valueAsNumber: true })} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={ativo} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTrilha.isPending || updateTrilha.isPending || uploading}>
              {uploading ? "Fazendo upload..." : trilha ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
