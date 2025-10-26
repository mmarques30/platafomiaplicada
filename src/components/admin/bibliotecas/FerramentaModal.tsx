import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateFerramenta, useUpdateFerramenta } from "@/hooks/admin/useBibliotecas";
import { Star } from "lucide-react";

interface FerramentaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ferramenta?: any;
}

export function FerramentaModal({ open, onOpenChange, ferramenta }: FerramentaModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const createFerramenta = useCreateFerramenta();
  const updateFerramenta = useUpdateFerramenta();
  const [rating, setRating] = useState(5);

  const valeAPena = watch("vale_a_pena");

  useEffect(() => {
    if (ferramenta) {
      reset(ferramenta);
      setRating(ferramenta.avaliacao || 5);
    } else {
      reset({
        nome: "",
        categoria: "",
        objetivo: "",
        o_que_entrega: "",
        link_ferramenta: "",
        logo_url: "",
        avaliacao: 5,
        gratuito: false,
        vale_a_pena: null,
        justificativa: "",
        ativo: true,
      });
      setRating(5);
    }
  }, [ferramenta, reset]);

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
              <Label htmlFor="logo_url">Logo da Ferramenta (URL)</Label>
              <Input id="logo_url" {...register("logo_url")} type="url" placeholder="https://exemplo.com/logo.png" />
              {watch("logo_url") && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl bg-background border overflow-hidden flex items-center justify-center">
                    <img src={watch("logo_url")} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-muted-foreground">Preview da logo</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Cole a URL da logo da ferramenta
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
              <Label htmlFor="avaliacao">Avaliação (1-5 estrelas)</Label>
              <div className="flex gap-1 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setValue("avaliacao", star);
                    }}
                    className="transition-all hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              </div>
            </div>

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
