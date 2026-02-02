import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useAddConteudoLiberado, useTrilhasDisponiveis, useModulosByTrilha } from "@/hooks/admin/useConteudosSkillsAdmin";
import { Loader2 } from "lucide-react";

interface ConteudoLiberacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipeId: string;
}

export default function ConteudoLiberacaoModal({ open, onOpenChange, equipeId }: ConteudoLiberacaoModalProps) {
  const [tipo, setTipo] = useState<"trilha" | "modulo">("trilha");
  const [trilhaId, setTrilhaId] = useState<string>("");
  const [moduloId, setModuloId] = useState<string>("");
  const [motivo, setMotivo] = useState("manual");

  const { data: trilhas, isLoading: trilhasLoading } = useTrilhasDisponiveis();
  const { data: modulos, isLoading: modulosLoading } = useModulosByTrilha(tipo === "modulo" ? trilhaId : null);
  const addConteudo = useAddConteudoLiberado();

  const handleSubmit = async () => {
    await addConteudo.mutateAsync({
      equipeId,
      trilhaId: tipo === "trilha" ? trilhaId : null,
      moduloId: tipo === "modulo" ? moduloId : null,
      motivo,
    });
    
    // Reset form
    setTipo("trilha");
    setTrilhaId("");
    setModuloId("");
    setMotivo("manual");
    onOpenChange(false);
  };

  const isValid = tipo === "trilha" ? !!trilhaId : !!moduloId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar Conteúdo</DialogTitle>
          <DialogDescription>
            Selecione uma trilha ou módulo para liberar para a equipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de Conteúdo */}
          <div className="space-y-2">
            <Label>Tipo de Conteúdo</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => {
                setTipo(v as "trilha" | "modulo");
                setModuloId("");
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trilha" id="tipo-trilha" />
                <Label htmlFor="tipo-trilha" className="font-normal cursor-pointer">
                  Trilha Completa
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="modulo" id="tipo-modulo" />
                <Label htmlFor="tipo-modulo" className="font-normal cursor-pointer">
                  Módulo Específico
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Seletor de Trilha */}
          <div className="space-y-2">
            <Label>Trilha</Label>
            <Select value={trilhaId} onValueChange={setTrilhaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {trilhasLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  trilhas?.map((trilha) => (
                    <SelectItem key={trilha.id} value={trilha.id}>
                      {trilha.titulo}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Módulo (se tipo === modulo) */}
          {tipo === "modulo" && trilhaId && (
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select value={moduloId} onValueChange={setModuloId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modulosLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : modulos?.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Nenhum módulo disponível
                    </div>
                  ) : (
                    modulos?.map((modulo) => (
                      <SelectItem key={modulo.id} value={modulo.id}>
                        {modulo.titulo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-2">
            <Label>Motivo da Liberação</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="diagnostico">Baseado no Diagnóstico</SelectItem>
                <SelectItem value="fase_roadmap">Fase do Roadmap</SelectItem>
                <SelectItem value="recomendacao_ia">Recomendação IA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || addConteudo.isPending}
          >
            {addConteudo.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Liberar Conteúdo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
