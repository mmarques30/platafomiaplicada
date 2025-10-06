import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ObjetivoMentoria } from "@/hooks/useMentoriaObjetivos";

type ObjetivoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ObjetivoMentoria>) => void;
  objetivo?: ObjetivoMentoria;
  userId?: string;
  isLoading?: boolean;
};

export default function ObjetivoModal({
  open,
  onOpenChange,
  onSubmit,
  objetivo,
  userId,
  isLoading
}: ObjetivoModalProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<ObjetivoMentoria>>({
    defaultValues: objetivo || {
      status: "em_andamento",
      progresso: 0
    }
  });

  const handleFormSubmit = (data: Partial<ObjetivoMentoria>) => {
    onSubmit({ ...data, user_id: userId || objetivo?.user_id });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{objetivo ? "Editar Objetivo" : "Novo Objetivo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              {...register("objetivo", { required: true })}
              placeholder="Descreva o objetivo de desenvolvimento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                id="prazo"
                type="date"
                {...register("prazo")}
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="progresso">Progresso (%)</Label>
            <Input
              id="progresso"
              type="number"
              min="0"
              max="100"
              {...register("progresso", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
              placeholder="Anotações e observações sobre o objetivo"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
