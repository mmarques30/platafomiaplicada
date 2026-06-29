import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [visivelPara, setVisivelPara] = useState<string[]>(['visitante', 'academy', 'skills', 'business']);

  useEffect(() => {
    if (aviso) {
      reset(aviso);
      setVisivelPara(aviso.visivel_para || ['visitante', 'academy', 'skills', 'business']);
    } else {
      reset({ titulo: "", mensagem: "", tipo: "info", data_expiracao: "", ativo: true });
      setVisivelPara(['visitante', 'academy', 'skills', 'business']);
    }
  }, [aviso, reset, open]);

  const onSubmit = (data: any) => {
    const payload = { ...data, visivel_para: visivelPara };
    if (aviso) {
      updateAviso.mutate({ id: aviso.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createAviso.mutate(payload, { onSuccess: () => onOpenChange(false) });
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
            <Select value={watch("tipo")} onValueChange={(value) => setValue("tipo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data de Expiração (opcional)</Label>
            <Input type="date" {...register("data_expiracao")} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>
          <div className="space-y-2">
            <Label>Visível para:</Label>
            <div className="grid grid-cols-2 gap-3 p-3 border rounded-md">
              {[
                { value: "visitante", label: "Visitantes" },
                { value: "academy", label: "Academy" },
                { value: "skills", label: "Skills" },
                { value: "business", label: "Builder" }
              ].map((plano) => (
                <div key={plano.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`visivel-${plano.value}`}
                    checked={visivelPara.includes(plano.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisivelPara([...visivelPara, plano.value]);
                      } else {
                        setVisivelPara(visivelPara.filter(p => p !== plano.value));
                      }
                    }}
                  />
                  <Label htmlFor={`visivel-${plano.value}`} className="cursor-pointer">{plano.label}</Label>
                </div>
              ))}
            </div>
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
