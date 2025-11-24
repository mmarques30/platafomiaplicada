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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateModulo, useUpdateModulo, useTrilhas } from "@/hooks/admin/useContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ModuloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo?: any;
}

export function ModuloModal({ open, onOpenChange, modulo }: ModuloModalProps) {
  const { data: trilhas } = useTrilhas();
  const createModulo = useCreateModulo();
  const updateModulo = useUpdateModulo();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [customCategoria, setCustomCategoria] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Buscar trilha do módulo selecionado para validação
  const { data: trilha } = useQuery({
    queryKey: ["trilha-do-modulo", watch("trilha_id")],
    queryFn: async () => {
      if (!watch("trilha_id")) return null;
      const { data } = await supabase
        .from("trilhas")
        .select("visivel_mentorados")
        .eq("id", watch("trilha_id"))
        .single();
      return data;
    },
    enabled: !!watch("trilha_id")
  });

  useEffect(() => {
    if (modulo) {
      reset({
        titulo: modulo.titulo || "",
        descricao: modulo.descricao || "",
        trilha_id: modulo.trilha_id || "",
        categoria: modulo.categoria || "",
        ordem: modulo.ordem || 0,
        ativo: modulo.ativo !== undefined ? modulo.ativo : true,
        visivel_mentorados: modulo.visivel_mentorados ?? false,
        nivel_minimo_acesso: modulo.nivel_minimo_acesso || "club",
        data_inicio: modulo.data_inicio || null,
      });
      setCustomCategoria(modulo.categoria || "");
      setImagePreview(modulo.imagem_url || "");
      setImageFile(null);
    } else {
      reset({ 
        titulo: "", 
        descricao: "", 
        trilha_id: "", 
        categoria: "",
        ordem: 0, 
        ativo: true,
        visivel_mentorados: false,
        nivel_minimo_acesso: "club",
        data_inicio: null
      });
      setCustomCategoria("");
      setImagePreview("");
      setImageFile(null);
    }
  }, [modulo, reset, open, trilhas]);

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
        .from('modulos-imagens')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('modulos-imagens')
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
    let imagemUrl = imagePreview;
    
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imagemUrl = uploadedUrl;
      }
    }

    const submitData = { 
      ...data, 
      categoria: customCategoria,
      imagem_url: imagemUrl 
    };
    
    if (modulo) {
      updateModulo.mutate({ id: modulo.id, ...submitData }, { onSuccess: () => onOpenChange(false) });
    } else {
      createModulo.mutate(submitData, { onSuccess: () => onOpenChange(false) });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modulo ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-2 pb-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...register("titulo")} required />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("descricao")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Imagem do Módulo</Label>
            <div className="flex flex-col gap-2">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
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
                Imagem específica deste módulo. Recomendado: 1920x1080px, máximo 2MB
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch("data_inicio") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("data_inicio") 
                    ? format(new Date(watch("data_inicio")), "dd/MM/yyyy", { locale: ptBR })
                    : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={watch("data_inicio") ? new Date(watch("data_inicio")) : undefined}
                  onSelect={(date) => setValue("data_inicio", date?.toISOString().split('T')[0])}
                  disabled={false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Quando este módulo deve começar
            </p>
          </div>
          <div className="space-y-2">
            <Label>Trilha</Label>
            <Select 
              value={watch("trilha_id") || undefined} 
              onValueChange={(value) => setValue("trilha_id", value)}
            >
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
            <Label>Categoria do Módulo</Label>
            <Input
              value={customCategoria}
              onChange={(e) => {
                const value = e.target.value;
                setCustomCategoria(value);
                setValue("categoria", value);
              }}
              placeholder="Ex: Apresentações, Automação, Comunicação..."
            />
            <p className="text-xs text-muted-foreground">
              Defina uma categoria personalizada baseada no conteúdo deste módulo
            </p>
          </div>

          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input type="number" {...register("ordem", { valueAsNumber: true })} />
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
            Deixe desmarcado para preparar o módulo antes de publicá-lo
          </p>

          {trilha?.visivel_mentorados && !watch("visivel_mentorados") && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Inconsistência Detectada</AlertTitle>
              <AlertDescription>
                A trilha deste módulo está <strong>visível para mentorados</strong>, 
                mas este módulo está <strong>invisível</strong>. Isso fará com que a trilha 
                apareça vazia para os usuários. Marque como visível ou desative este módulo.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Nível Mínimo de Acesso</Label>
            <Select 
              value={watch("nivel_minimo_acesso") || "club"}
              onValueChange={(value) => setValue("nivel_minimo_acesso", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club">🌱 Club (todos)</SelectItem>
                <SelectItem value="boost">🚀 Boost (Boost + Legacy)</SelectItem>
                <SelectItem value="legacy">👑 Legacy (apenas Legacy)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define qual plano mínimo pode acessar este módulo
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              disabled={createModulo.isPending || updateModulo.isPending || uploading}
            >
              {uploading ? "Fazendo upload..." : modulo ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
