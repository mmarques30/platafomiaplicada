import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateFerramenta, useUpdateFerramenta } from "@/hooks/admin/useBibliotecas";
import { Star, Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FerramentaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ferramenta?: any;
}

export function FerramentaModal({ open, onOpenChange, ferramenta }: FerramentaModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const createFerramenta = useCreateFerramenta();
  const updateFerramenta = useUpdateFerramenta();
  const [ratingMari, setRatingMari] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const valeAPena = watch("vale_a_pena");

  useEffect(() => {
    if (ferramenta) {
      reset(ferramenta);
      setRatingMari(ferramenta.avaliacao_mari || ferramenta.avaliacao || 5);
      setPreviewUrl(ferramenta.logo_url || null);
    } else {
      reset({
        nome: "",
        categoria: "",
        objetivo: "",
        o_que_entrega: "",
        link_ferramenta: "",
        logo_url: "",
        avaliacao_mari: 5,
        gratuito: false,
        vale_a_pena: null,
        justificativa: "",
        ativo: true,
      });
      setRatingMari(5);
      setPreviewUrl(null);
    }
  }, [ferramenta, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PNG, JPG ou WEBP');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `ferramentas/${fileName}`;

      const { data, error } = await supabase.storage
        .from('ferramentas-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('ferramentas-logos')
        .getPublicUrl(filePath);

      setValue('logo_url', publicUrl);
      setPreviewUrl(publicUrl);
      toast.success('Logo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: any) => {
    if (ferramenta) {
      updateFerramenta.mutate(
        { id: ferramenta.id, values: data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createFerramenta.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ferramenta ? "Editar" : "Nova"} Ferramenta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ========== SEÇÃO 1: INFORMAÇÕES BÁSICAS ========== */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-base">Informações Básicas</h3>
            <div>
              <Label htmlFor="nome">Nome da Ferramenta</Label>
              <Input id="nome" {...register("nome", { required: true })} placeholder="Ex: ElevenLabs" />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input id="categoria" {...register("categoria", { required: true })} placeholder="Ex: Áudio & Vídeo" />
            </div>

            <div>
              <Label htmlFor="logo_url">Logo da Ferramenta</Label>
              
              {(watch("logo_url") || previewUrl) && (
                <div className="mt-3 mb-4 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-background border-2 overflow-hidden flex items-center justify-center">
                    <img 
                      src={previewUrl || watch("logo_url")} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain p-2" 
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setValue('logo_url', '');
                      setPreviewUrl(null);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload de Imagem
                    </>
                  )}
                </Button>
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url_manual" className="text-sm text-muted-foreground">
                  Cole uma URL externa (opcional)
                </Label>
                <Input 
                  id="logo_url_manual" 
                  {...register("logo_url")} 
                  type="url" 
                  placeholder="https://exemplo.com/logo.png"
                  disabled={uploading}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Formatos aceitos: PNG, JPG, WEBP • Tamanho máximo: 2MB
              </p>
            </div>
          </div>

          {/* ========== SEÇÃO 2: DESCRIÇÕES ========== */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-base">Descrições</h3>

            <div>
              <Label htmlFor="objetivo">Objetivo (resumo para o card)</Label>
              <Textarea 
                id="objetivo" 
                {...register("objetivo", { required: true })} 
                placeholder="Ex: Gerar vozes realistas com IA para locuções e vídeos"
                rows={2}
                maxLength={120}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 120 caracteres - será exibido no card compacto
              </p>
            </div>

            <div>
              <Label htmlFor="o_que_entrega">O que Entrega (detalhes completos)</Label>
              <Textarea 
                id="o_que_entrega" 
                {...register("o_que_entrega", { required: true })} 
                placeholder="Descreva em detalhes o que a ferramenta faz, seus recursos principais, casos de uso..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Será exibido no modal de detalhes quando o usuário clicar "Ver Detalhes"
              </p>
            </div>
          </div>

          {/* ========== SEÇÃO 3: AVALIAÇÃO ========== */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-base">Avaliação</h3>

            <div>
              <Label htmlFor="avaliacao_mari">⭐ Avaliação da Mari (1-5 estrelas)</Label>
              <div className="flex gap-1 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRatingMari(star);
                      setValue("avaliacao_mari", star);
                    }}
                    className="transition-all hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingMari
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-muted-foreground">
                  {ratingMari}/5
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Esta avaliação será usada no ranking Top 3 (peso 60%)
              </p>
            </div>

            {/* Avaliação da Comunidade (Read-Only) */}
            {ferramenta && (
              <div className="p-3 bg-muted rounded-lg border">
                <Label className="text-sm">👥 Avaliação da Comunidade (somente visualização)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {ferramenta.avaliacao_comunidade?.toFixed(2) || "0.00"}
                    </span>
                    <span className="text-sm text-muted-foreground">/5.00</span>
                  </div>
                  <Badge variant="secondary">
                    {ferramenta.total_avaliacoes_comunidade || 0} avaliações
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Esta avaliação é calculada automaticamente pelas avaliações dos usuários (peso 40% no ranking)
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="vale_a_pena">Vale a Pena?</Label>
              <Select
                value={valeAPena === null ? "nao_avaliado" : valeAPena ? "sim" : "nao"}
                onValueChange={(value) => {
                  if (value === "nao_avaliado") setValue("vale_a_pena", null);
                  else setValue("vale_a_pena", value === "sim");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_avaliado">Não Avaliado</SelectItem>
                  <SelectItem value="sim">✅ Sim - Recomendo</SelectItem>
                  <SelectItem value="nao">⚠️ Não - Não Recomendo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {valeAPena !== null && (
              <div>
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea 
                  id="justificativa" 
                  {...register("justificativa")} 
                  placeholder="Explique por que vale ou não vale a pena usar esta ferramenta..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Esta justificativa será destacada no modal de detalhes
                </p>
              </div>
            )}
          </div>

          {/* ========== SEÇÃO 4: CONFIGURAÇÕES ========== */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-base">Configurações</h3>

            <div>
              <Label htmlFor="link_ferramenta">Link da Ferramenta</Label>
              <Input 
                id="link_ferramenta" 
                {...register("link_ferramenta")} 
                type="url" 
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="gratuito"
                onCheckedChange={(checked) => setValue("gratuito", checked)}
                defaultChecked={ferramenta?.gratuito}
              />
              <Label htmlFor="gratuito">Ferramenta Gratuita</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                onCheckedChange={(checked) => setValue("ativo", checked)}
                defaultChecked={ferramenta?.ativo ?? true}
              />
              <Label htmlFor="ativo">Ativo (visível para usuários)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {ferramenta ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
