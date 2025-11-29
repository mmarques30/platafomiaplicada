import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useVisitantes } from "@/hooks/useVisitantes";

interface EditVisitanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitante: {
    id: string;
    nome_completo: string;
    email: string;
    telefone?: string | null;
    conta_ativa?: boolean | null;
  } | null;
}

export function EditVisitanteModal({
  open,
  onOpenChange,
  visitante,
}: EditVisitanteModalProps) {
  const { updateVisitante } = useVisitantes();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [contaAtiva, setContaAtiva] = useState(true);

  useEffect(() => {
    if (visitante) {
      setNomeCompleto(visitante.nome_completo);
      setEmail(visitante.email || "");
      setTelefone(visitante.telefone || "");
      setContaAtiva(visitante.conta_ativa ?? true);
    }
  }, [visitante]);

  const handleSave = () => {
    if (!visitante) return;

    updateVisitante.mutate(
      {
        userId: visitante.id,
        updates: {
          nome_completo: nomeCompleto,
          email,
          telefone: telefone || null,
          conta_ativa: contaAtiva,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Visitante</DialogTitle>
          <DialogDescription>
            Atualize as informações do visitante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="conta-ativa">Conta Ativa</Label>
            <Switch
              id="conta-ativa"
              checked={contaAtiva}
              onCheckedChange={setContaAtiva}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!nomeCompleto || !email || updateVisitante.isPending}
          >
            {updateVisitante.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
