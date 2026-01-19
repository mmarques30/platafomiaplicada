import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVisitantes } from "@/hooks/useVisitantes";

interface NovoVisitanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoVisitanteModal({ open, onOpenChange }: NovoVisitanteModalProps) {
  const { createVisitante } = useVisitantes();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");

  const handleSave = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) return;

    createVisitante.mutate(
      {
        nome_completo: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim() || undefined,
        password: senha,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setSenha("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isFormValid = nome.trim() && email.trim() && senha.trim() && senha.length >= 6;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados do visitante. Ele poderá fazer login com o email e senha informados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="novo-nome">Nome Completo *</Label>
            <Input
              id="novo-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do visitante"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novo-email">Email *</Label>
            <Input
              id="novo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novo-telefone">Telefone</Label>
            <Input
              id="novo-telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novo-senha">Senha *</Label>
            <Input
              id="novo-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              O visitante usará esta senha para fazer login
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid || createVisitante.isPending}
          >
            {createVisitante.isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
