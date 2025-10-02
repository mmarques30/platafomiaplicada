import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateTrilha, useUpdateTrilha } from "@/hooks/admin/useContent";

interface TrilhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trilha?: any;
}

export function TrilhaModal({ open, onOpenChange, trilha }: TrilhaModalProps) {
  const createTrilha = useCreateTrilha();
  const updateTrilha = useUpdateTrilha();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      titulo: "",
      descricao: "",
      nivel: "Iniciante",
      ordem: 0,
      ativo: true,
    },
  });

  useEffect(() => {
    if (trilha) {
      reset(trilha);
    } else {
      reset({
        titulo: "",
        descricao: "",
        nivel: "Iniciante",
        ordem: 0,
        ativo: true,
      });
    }
  }, [trilha, reset]);

  const onSubmit = (data: any) => {
    if (trilha) {
      updateTrilha.mutate({ id: trilha.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createTrilha.mutate(data, {
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
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={createTrilha.isPending || updateTrilha.isPending}>
              {trilha ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
