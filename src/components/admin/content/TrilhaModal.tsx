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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCreateTrilha, useUpdateTrilha } from "@/hooks/admin/useContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [openCategoria, setOpenCategoria] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      titulo: "",
      descricao: "",
      nivel: "iniciante",
      categoria: "núcleo",
      ordem: 0,
      ativo: true,
      visivel_mentorados: false,
      visivel_apenas_pro: false,
      nivel_minimo_acesso: "academy",
      imagem_url: "",
      duracao_estimada: 0,
    },
  });

  useEffect(() => {
    if (open) {
      fetchCategorias();
    }
    
    if (trilha) {
      reset(trilha);
      setSelectedCategoria(trilha.categoria || "núcleo");
      setImagePreview(trilha.imagem_url || "");
      setImageFile(null);
      setValue("visivel_mentorados", trilha.visivel_mentorados ?? false);
      setValue("visivel_apenas_pro", trilha.visivel_apenas_pro ?? false);
      setValue("nivel_minimo_acesso", trilha.nivel_minimo_acesso || "academy");
    } else {
      reset({
        titulo: "",
        descricao: "",
        nivel: "iniciante",
        categoria: "núcleo",
        ordem: 0,
        ativo: true,
        visivel_mentorados: false,
        visivel_apenas_pro: false,
        nivel_minimo_acesso: "academy",
        imagem_url: "",
        duracao_estimada: 0,
      });
      setSelectedCategoria("núcleo");
      setImagePreview("");
      setImageFile(null);
    }
  }, [trilha, reset, open]);

  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const { data, error } = await supabase
        .from("trilhas")
        .select("categoria")
        .order("categoria");

      if (error) throw error;

      const uniqueCategorias = Array.from(
        new Set(data?.map((t) => t.categoria.trim()) || [])
      ).sort();
      
      setCategorias(uniqueCategorias);
    } catch (error) {
      console.error("Error fetching categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoadingCategorias(false);
    }
  };

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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trilha ? "Editar Trilha" : "Nova Trilha"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...register("titulo")} required />
          </div>

          <div className="space-y-2">
            <Label>Descrição / Objetivo</Label>
            <Textarea {...register("descricao")} rows={3} placeholder="Ex: Aprenda os fundamentos de IA do zero" />
            <p className="text-xs text-muted-foreground">
              Objetivo curto da trilha (será exibido junto com a duração)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Duração Estimada (minutos)</Label>
            <Input 
              type="number" 
              {...register("duracao_estimada", { valueAsNumber: true })} 
              placeholder="Ex: 195 (será exibido como 3h15min)"
            />
            <p className="text-xs text-muted-foreground">
              Duração total estimada em minutos
            </p>
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
            <Popover open={openCategoria} onOpenChange={setOpenCategoria}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCategoria}
                  className="w-full justify-between"
                >
                  {selectedCategoria || "Selecione ou digite uma categoria..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Buscar ou criar categoria..." 
                    value={selectedCategoria}
                    onValueChange={(value) => {
                      setSelectedCategoria(value);
                      setValue("categoria", value);
                    }}
                  />
                  <CommandEmpty>
                    <div className="p-2 text-sm">
                      Pressione Enter para criar "{selectedCategoria}"
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {loadingCategorias ? (
                      <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                    ) : (
                      categorias.map((categoria) => (
                        <CommandItem
                          key={categoria}
                          value={categoria}
                          onSelect={(currentValue) => {
                            setSelectedCategoria(currentValue);
                            setValue("categoria", currentValue);
                            setOpenCategoria(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategoria === categoria ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {categoria}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Selecione uma categoria existente ou digite uma nova
            </p>
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

          <div className="flex items-center space-x-2">
            <Switch 
              checked={watch("visivel_mentorados")} 
              onCheckedChange={(checked) => setValue("visivel_mentorados", checked)} 
            />
            <Label>Visível para Mentorados</Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Marque para publicar este conteúdo. Deixe desmarcado para preparar como rascunho.
          </p>

          {watch("visivel_mentorados") && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Esta trilha está visível para mentorados. Certifique-se de que os módulos 
                internos também estejam marcados como visíveis, caso contrário aparecerá 
                como "trilha vazia" para os usuários.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Nível Mínimo de Acesso</Label>
            <Select 
              value={watch("nivel_minimo_acesso") || "academy"}
              onValueChange={(value) => setValue("nivel_minimo_acesso", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academy">🎓 Academy (todos os planos)</SelectItem>
                <SelectItem value="lab">🔬 Lab (Lab + Club)</SelectItem>
                <SelectItem value="skills">🏢 Skills (Skills + Club)</SelectItem>
                <SelectItem value="club">⭐ Club (apenas Club)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define qual plano mínimo pode acessar esta trilha
            </p>
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
