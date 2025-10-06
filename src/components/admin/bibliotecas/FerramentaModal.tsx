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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Ferramenta</Label>
            <Input id="nome" {...register("nome", { required: true })} />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input id="categoria" {...register("categoria", { required: true })} />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo</Label>
            <Textarea id="objetivo" {...register("objetivo", { required: true })} />
          </div>

          <div>
            <Label htmlFor="o_que_entrega">O que Entrega</Label>
            <Textarea id="o_que_entrega" {...register("o_que_entrega", { required: true })} />
          </div>

          <div>
            <Label htmlFor="link_ferramenta">Link da Ferramenta</Label>
            <Input id="link_ferramenta" {...register("link_ferramenta")} type="url" />
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input id="logo_url" {...register("logo_url")} type="url" />
          </div>

          <div>
            <Label htmlFor="avaliacao">Avaliação</Label>
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
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="gratuito"
              onCheckedChange={(checked) => setValue("gratuito", checked)}
              defaultChecked={ferramenta?.gratuito}
            />
            <Label htmlFor="gratuito">Ferramenta Gratuita</Label>
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
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {valeAPena !== null && (
            <div>
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea id="justificativa" {...register("justificativa")} />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              onCheckedChange={(checked) => setValue("ativo", checked)}
              defaultChecked={ferramenta?.ativo ?? true}
            />
            <Label htmlFor="ativo">Ativo</Label>
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
