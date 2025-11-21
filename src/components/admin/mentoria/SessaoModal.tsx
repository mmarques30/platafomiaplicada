import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
    defaultValues: {
      status: "agendada"
    }
  });

  useEffect(() => {
    if (open && sessao) {
      reset({
        titulo: sessao.titulo,
        data_sessao: formatDateForInput(sessao.data_sessao),
        duracao: sessao.duracao,
        status: sessao.status,
        video_url: sessao.video_url || "",
        transcricao_url: sessao.transcricao_url || "",
        transcricao: sessao.transcricao || "",
        notas: sessao.notas || ""
      });
    } else if (open && !sessao) {
      reset({
        titulo: "",
        data_sessao: "",
        duracao: undefined,
        status: "agendada",
        video_url: "",
        transcricao_url: "",
        transcricao: "",
        notas: ""
      });
    }
  }, [open, sessao, reset]);

  const handleFormSubmit = (data: Partial<SessaoMentoria>) => {
    onSubmit({ ...data, user_id: userId || sessao?.user_id });
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
            <Label htmlFor="transcricao_url">URL ou Link da Transcrição</Label>
            <Input
              id="transcricao_url"
              {...register("transcricao_url")}
              placeholder="https://... (Google Docs, Notion, Drive, etc.)"
              type="url"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cole o link de um documento externo (Google Docs, Notion, Drive, etc.) contendo a transcrição
            </p>
          </div>

          <div>
            <Label htmlFor="transcricao">Ou escreva uma transcrição curta</Label>
            <Textarea
              id="transcricao"
              {...register("transcricao")}
              placeholder="Resumo ou transcrição breve da sessão"
              rows={4}
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

          <div>
            <Label htmlFor="feedback_entregas">
              Mudanças, Melhorias e Feedbacks das Entregas
            </Label>
            <Textarea
              id="feedback_entregas"
              {...register("feedback_entregas")}
              placeholder="Descreva as mudanças implementadas, melhorias sugeridas e feedbacks sobre as entregas apresentadas nesta sessão..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use este espaço para documentar evoluções, ajustes e avaliações das entregas
            </p>
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
