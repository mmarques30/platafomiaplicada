import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateAviso, useUpdateAviso } from "@/hooks/admin/useAvisos";

interface AvisoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aviso?: any;
}

export function AvisoModal({ open, onOpenChange, aviso }: AvisoModalProps) {
  const createAviso = useCreateAviso();
  const updateAviso = useUpdateAviso();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (aviso) {
      reset(aviso);
    } else {
      reset({ titulo: "", mensagem: "", tipo: "Info", data_expiracao: "", ativo: true });
    }
  }, [aviso, reset, open]);

  const onSubmit = (data: any) => {
    if (aviso) {
      updateAviso.mutate({ id: aviso.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createAviso.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{aviso ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...register("titulo")} required />
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea {...register("mensagem")} rows={4} required />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input {...register("tipo")} placeholder="Info, Alerta, Urgente" />
          </div>
          <div className="space-y-2">
            <Label>Data de Expiração (opcional)</Label>
            <Input type="date" {...register("data_expiracao")} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{aviso ? "Atualizar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
