import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useCreateUser } from "@/hooks/admin/useUsers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AppRole = "admin" | "mentorado" | "aluno_trilha";

interface NovoUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLANOS = [
  { value: "club", label: "IAplicada Club", description: "Acesso à plataforma de conteúdo" },
  { value: "boost", label: "IAplicada Boost", description: "Plataforma + painel simplificado + conteúdo Boost" },
  { value: "legacy", label: "IAplicada Legacy", description: "Acesso completo (Club + Boost + Legacy + painel completo)" },
];

export function NovoUsuarioModal({ open, onOpenChange }: NovoUsuarioModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<string>("");
  
  const createUser = useCreateUser();

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev => {
      const newRoles = prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role];
      
      if (!newRoles.includes("mentorado")) {
        setSelectedPlano("");
      }
      
      return newRoles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.includes("mentorado") && !selectedPlano) {
      toast.error("Selecione um plano de mentoria para mentorados");
      return;
    }

    await createUser.mutateAsync({
      email,
      password,
      nomeCompleto,
      roles: selectedRoles,
      planoMentoria: selectedPlano || null,
    });

    // Resetar form
    setEmail("");
    setPassword("");
    setNomeCompleto("");
    setSelectedRoles([]);
    setSelectedPlano("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite uma senha temporária"
                required
              />
              <p className="text-sm text-foreground/60 mt-1">
                O usuário poderá alterar esta senha em Configurações
              </p>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Permissões (Roles)</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin"
                  checked={selectedRoles.includes("admin")}
                  onCheckedChange={() => toggleRole("admin")}
                />
                <Label htmlFor="admin" className="cursor-pointer">
                  Administrador
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mentorado"
                  checked={selectedRoles.includes("mentorado")}
                  onCheckedChange={() => toggleRole("mentorado")}
                />
                <Label htmlFor="mentorado" className="cursor-pointer">
                  Mentorado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aluno_trilha"
                  checked={selectedRoles.includes("aluno_trilha")}
                  onCheckedChange={() => toggleRole("aluno_trilha")}
                />
                <Label htmlFor="aluno_trilha" className="cursor-pointer">
                  Aluno da Trilha
                </Label>
              </div>
            </div>
          </div>

          {selectedRoles.includes("mentorado") && (
            <div>
              <Label className="mb-3 block">Plano de Mentoria *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANOS.map((plano) => (
                  <Card
                    key={plano.value}
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      selectedPlano === plano.value
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPlano(plano.value)}
                  >
                    <h4 className={cn(
                      "font-semibold mb-1",
                      selectedPlano === plano.value 
                        ? "text-foreground" 
                        : "text-card-foreground"
                    )}>
                      {plano.label}
                    </h4>
                    <p className={cn(
                      "text-sm",
                      selectedPlano === plano.value 
                        ? "text-foreground/70"
                        : "text-card-foreground/70"
                    )}>
                      {plano.description}
                    </p>
                  </Card>
                ))}
              </div>
              {selectedRoles.includes("mentorado") && !selectedPlano && (
                <p className="text-sm text-destructive mt-2">
                  Selecione um plano de mentoria
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
