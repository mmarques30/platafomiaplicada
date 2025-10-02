import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateCurso, useUpdateCurso, useTrilhas } from "@/hooks/admin/useContent";

interface CursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curso?: any;
}

export function CursoModal({ open, onOpenChange, curso }: CursoModalProps) {
  const { data: trilhas } = useTrilhas();
  const createCurso = useCreateCurso();
  const updateCurso = useUpdateCurso();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (curso) {
      reset(curso);
    } else {
      reset({ titulo: "", descricao: "", trilha_id: "", duracao_estimada: 0, ordem: 0, ativo: true });
    }
  }, [curso, reset, open]);

  const onSubmit = (data: any) => {
    if (curso) {
      updateCurso.mutate({ id: curso.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCurso.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{curso ? "Editar Curso" : "Novo Curso"}</DialogTitle>
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
            <Label>Trilha</Label>
            <Select onValueChange={(value) => setValue("trilha_id", value)} defaultValue={watch("trilha_id")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {trilhas?.map((trilha) => (
                  <SelectItem key={trilha.id} value={trilha.id}>{trilha.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duração Estimada (minutos)</Label>
            <Input type="number" {...register("duracao_estimada", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input type="number" {...register("ordem", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{curso ? "Atualizar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
