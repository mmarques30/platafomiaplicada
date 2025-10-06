import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjetoMentoria } from "@/hooks/useMentoriaProjetos";

type ProjetoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ProjetoMentoria>) => void;
  projeto?: ProjetoMentoria;
  userId?: string;
  isLoading?: boolean;
  isAdmin?: boolean;
};

export default function ProjetoModal({
  open,
  onOpenChange,
  onSubmit,
  projeto,
  userId,
  isLoading,
  isAdmin = false
}: ProjetoModalProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<ProjetoMentoria>>({
    defaultValues: projeto || {
      status: "planejamento"
    }
  });

  const handleFormSubmit = (data: Partial<ProjetoMentoria>) => {
    onSubmit({ ...data, user_id: userId || projeto?.user_id });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{projeto ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: true })}
              placeholder="Título do projeto"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...register("descricao", { required: true })}
              placeholder="Descreva o projeto"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="objetivo_projeto">Objetivo do Projeto *</Label>
            <Textarea
              id="objetivo_projeto"
              {...register("objetivo_projeto", { required: true })}
              placeholder="Qual o objetivo deste projeto?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="contribuicao_plano">Contribuição para o Plano de Desenvolvimento *</Label>
            <Textarea
              id="contribuicao_plano"
              {...register("contribuicao_plano", { required: true })}
              placeholder="Como este projeto contribui para seu desenvolvimento?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_entrega">Data de Entrega</Label>
              <Input
                id="data_entrega"
                type="date"
                {...register("data_entrega")}
              />
            </div>
          </div>

          {isAdmin && (
            <>
              <div>
                <Label htmlFor="devolutiva_mentor">Devolutiva do Mentor</Label>
                <Textarea
                  id="devolutiva_mentor"
                  {...register("devolutiva_mentor")}
                  placeholder="Feedback do mentor sobre o projeto"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="avaliacao_mentor">Avaliação do Mentor (1-5)</Label>
                <Input
                  id="avaliacao_mentor"
                  type="number"
                  min="1"
                  max="5"
                  {...register("avaliacao_mentor", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="comentarios_mentor">Comentários do Mentor</Label>
                <Textarea
                  id="comentarios_mentor"
                  {...register("comentarios_mentor")}
                  rows={3}
                />
              </div>
            </>
          )}

          {!isAdmin && projeto && (
            <>
              <div>
                <Label htmlFor="avaliacao_mentorado">Sua Avaliação (1-5)</Label>
                <Input
                  id="avaliacao_mentorado"
                  type="number"
                  min="1"
                  max="5"
                  {...register("avaliacao_mentorado", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="comentarios_mentorado">Seus Comentários</Label>
                <Textarea
                  id="comentarios_mentorado"
                  {...register("comentarios_mentorado")}
                  rows={3}
                />
              </div>
            </>
          )}

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
