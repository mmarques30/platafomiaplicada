import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAula, useUpdateAula, AulaSemanal } from "@/hooks/useCalendarioAulas";
import { Loader2, ExternalLink } from "lucide-react";

interface AulaSemanalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: AulaSemanal | null;
}

export function AulaSemanalModal({ open, onOpenChange, aula }: AulaSemanalModalProps) {
  const [tema, setTema] = useState("");
  const [dataAula, setDataAula] = useState("");
  const [horario, setHorario] = useState("19:30");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [tipoEvento, setTipoEvento] = useState<'aula_ao_vivo' | 'qa' | 'outro'>('aula_ao_vivo');
  const [linkReuniao, setLinkReuniao] = useState("");

  const createAula = useCreateAula();
  const updateAula = useUpdateAula();

  useEffect(() => {
    if (aula) {
      setTema(aula.tema || "");
      setDataAula(aula.data_aula || "");
      setHorario(aula.horario || "19:30");
      setDescricao(aula.descricao || "");
      setAtivo(aula.ativo ?? true);
      setTipoEvento(aula.tipo_evento || 'aula_ao_vivo');
      setLinkReuniao(aula.link_reuniao || "");
    } else {
      setTema("");
      setDataAula("");
      setHorario("19:30");
      setDescricao("");
      setAtivo(true);
      setTipoEvento('aula_ao_vivo');
      setLinkReuniao("");
    }
  }, [aula, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tema.trim()) {
      return;
    }

    const aulaData = {
      tema: tema.trim(),
      data_aula: dataAula || null,
      horario: horario || null,
      descricao: descricao.trim() || null,
      ativo,
      tipo_evento: tipoEvento,
      link_reuniao: linkReuniao.trim() || null,
    };

    if (aula) {
      await updateAula.mutateAsync({ id: aula.id, ...aulaData });
    } else {
      await createAula.mutateAsync(aulaData);
    }

    onOpenChange(false);
  };

  const isLoading = createAula.isPending || updateAula.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Nova Aula"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tema">
              Tema da Aula <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Stack completo para projetos"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_evento">Tipo de Evento</Label>
            <Select value={tipoEvento} onValueChange={(v) => setTipoEvento(v as 'aula_ao_vivo' | 'qa' | 'outro')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aula_ao_vivo">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    Aula ao Vivo
                  </span>
                </SelectItem>
                <SelectItem value="qa">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    Q&A
                  </span>
                </SelectItem>
                <SelectItem value="outro">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                    Outro
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_aula">Data da Aula</Label>
              <Input
                id="data_aula"
                type="date"
                value={dataAula}
                onChange={(e) => setDataAula(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais sobre a aula..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_reuniao" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Link da Reunião (opcional)
            </Label>
            <Input
              id="link_reuniao"
              type="url"
              value={linkReuniao}
              onChange={(e) => setLinkReuniao(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
              <Label htmlFor="ativo">Aula ativa</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {aula ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
