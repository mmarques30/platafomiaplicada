import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateIACopieUse, useUpdateIACopieUse } from "@/hooks/admin/useBibliotecas";
import { FerramentasSelector } from "./FerramentasSelector";

interface IACopieUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
}

export function IACopieUseModal({ open, onOpenChange, item }: IACopieUseModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [ferramentasRecomendadas, setFerramentasRecomendadas] = useState<string[]>([]);
  const createItem = useCreateIACopieUse();
  const updateItem = useUpdateIACopieUse();

  useEffect(() => {
    if (item) {
      reset(item);
      setFerramentasRecomendadas(item.ferramentas_recomendadas || []);
    } else {
      reset({
        titulo: "",
        descricao: "",
        categoria: "",
        ia_recomendada: "",
        conteudo: "",
        ferramentas_recomendadas: [],
        ativo: true,
      });
      setFerramentasRecomendadas([]);
    }
  }, [item, reset]);

  const onSubmit = (data: any) => {
    const itemData = {
      ...data,
      ferramentas_recomendadas: ferramentasRecomendadas,
    };
    
    if (item) {
      updateItem.mutate(
        { id: item.id, values: itemData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createItem.mutate(itemData, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Editar" : "Novo"} Item IA Copie e Use</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" {...register("titulo", { required: true })} />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register("descricao", { required: true })} />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input id="categoria" {...register("categoria", { required: true })} />
          </div>

          <div>
            <Label htmlFor="ia_recomendada">IA Recomendada (opcional)</Label>
            <Input id="ia_recomendada" {...register("ia_recomendada")} />
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo (código/texto para copiar)</Label>
            <Textarea id="conteudo" {...register("conteudo", { required: true })} rows={10} />
          </div>

          <FerramentasSelector
            value={ferramentasRecomendadas}
            onChange={setFerramentasRecomendadas}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              onCheckedChange={(checked) => setValue("ativo", checked)}
              defaultChecked={item?.ativo ?? true}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
