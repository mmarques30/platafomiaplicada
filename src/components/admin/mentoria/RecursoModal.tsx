import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RecursoMentoria } from "@/hooks/useMentoriaRecursos";

type RecursoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<RecursoMentoria>) => void;
  recurso?: RecursoMentoria;
  userId?: string;
  isLoading?: boolean;
};

export default function RecursoModal({
  open,
  onOpenChange,
  onSubmit,
  recurso,
  userId,
  isLoading
}: RecursoModalProps) {
  const { register, handleSubmit, reset } = useForm<Partial<RecursoMentoria>>({
    defaultValues: recurso
  });

  const handleFormSubmit = (data: Partial<RecursoMentoria>) => {
    onSubmit({ ...data, user_id: userId || recurso?.user_id });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recurso ? "Editar Recurso" : "Novo Recurso"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              {...register("nome", { required: true })}
              placeholder="Nome do recurso/ferramenta"
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Input
              id="categoria"
              {...register("categoria", { required: true })}
              placeholder="Ex: Ferramenta, Curso, Artigo, Vídeo"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...register("descricao", { required: true })}
              placeholder="Descreva o recurso"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="para_que_serve">Para que serve *</Label>
            <Textarea
              id="para_que_serve"
              {...register("para_que_serve", { required: true })}
              placeholder="Qual o objetivo deste recurso"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="como_usar">Como usar</Label>
            <Textarea
              id="como_usar"
              {...register("como_usar")}
              placeholder="Instruções de uso"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              {...register("link")}
              placeholder="https://..."
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
