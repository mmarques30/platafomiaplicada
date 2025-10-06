import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";

type SessaoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<SessaoMentoria>) => void;
  sessao?: SessaoMentoria;
  userId?: string;
  isLoading?: boolean;
};

export default function SessaoModal({
  open,
  onOpenChange,
  onSubmit,
  sessao,
  userId,
  isLoading
}: SessaoModalProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<SessaoMentoria>>({
    defaultValues: sessao || {
      status: "agendada"
    }
  });

  const handleFormSubmit = (data: Partial<SessaoMentoria>) => {
    onSubmit({ ...data, user_id: userId || sessao?.user_id });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sessao ? "Editar Sessão" : "Nova Sessão"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: true })}
              placeholder="Título da sessão"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_sessao">Data/Hora *</Label>
              <Input
                id="data_sessao"
                type="datetime-local"
                {...register("data_sessao", { required: true })}
              />
            </div>

            <div>
              <Label htmlFor="duracao">Duração (minutos)</Label>
              <Input
                id="duracao"
                type="number"
                {...register("duracao", { valueAsNumber: true })}
              />
            </div>
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
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="video_url">URL do Vídeo/Gravação</Label>
            <Input
              id="video_url"
              {...register("video_url")}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="transcricao">Transcrição</Label>
            <Textarea
              id="transcricao"
              {...register("transcricao")}
              placeholder="Transcrição da sessão"
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas e Observações</Label>
            <Textarea
              id="notas"
              {...register("notas")}
              placeholder="Anotações da sessão"
              rows={4}
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
