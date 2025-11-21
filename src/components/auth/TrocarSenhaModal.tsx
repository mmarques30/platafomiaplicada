import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useTrocarSenha } from "@/hooks/useTrocarSenha";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TrocarSenhaModalProps {
  open: boolean;
  userId: string;
  onSuccess: () => void;
}

export function TrocarSenhaModal({ open, userId, onSuccess }: TrocarSenhaModalProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { trocarSenha, isLoading } = useTrocarSenha();

  const requisitos = {
    tamanho: novaSenha.length >= 8,
    maiuscula: /[A-Z]/.test(novaSenha),
    numero: /[0-9]/.test(novaSenha),
  };

  const senhaValida = Object.values(requisitos).every(Boolean);
  const senhasConferem = novaSenha === confirmarSenha && novaSenha.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senhaValida || !senhasConferem) {
      return;
    }

    trocarSenha(
      { novaSenha, userId },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Troca de Senha Obrigatória
          </DialogTitle>
          <DialogDescription>
            Por segurança, você precisa criar uma nova senha no primeiro acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova Senha</Label>
            <PasswordInput
              id="nova-senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
            <PasswordInput
              id="confirmar-senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite novamente"
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
            <p className="text-sm font-medium">Requisitos:</p>
            <div className="space-y-1">
              <RequisitoItem 
                atendido={requisitos.tamanho} 
                texto="Mínimo 8 caracteres" 
              />
              <RequisitoItem 
                atendido={requisitos.maiuscula} 
                texto="Pelo menos 1 letra maiúscula" 
              />
              <RequisitoItem 
                atendido={requisitos.numero} 
                texto="Pelo menos 1 número" 
              />
              <RequisitoItem 
                atendido={senhasConferem} 
                texto="Senhas devem coincidir" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!senhaValida || !senhasConferem || isLoading}
          >
            {isLoading ? "Atualizando..." : "Criar Nova Senha"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequisitoItem({ atendido, texto }: { atendido: boolean; texto: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 
        className={`h-4 w-4 ${atendido ? 'text-success' : 'text-muted-foreground'}`}
      />
      <span className={atendido ? 'text-foreground' : 'text-muted-foreground'}>
        {texto}
      </span>
    </div>
  );
}
