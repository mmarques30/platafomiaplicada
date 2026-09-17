import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { PLANOS, type Plano } from "@/lib/planos";

/**
 * Cadastro de usuário pelo admin.
 *
 * Dois eixos, e só dois:
 *
 * - O PLANO diz o que a pessoa tem: Academy, Insider Business ou Insider
 *   Convidado. Quem tem plano é cliente, e o papel de cliente no banco
 *   (aluno_trilha) é atribuído pelo servidor a partir do plano. Ninguém marca
 *   "aluno" ou "mentorado" na mão: isso era o resquício de quando Builder,
 *   Skills e mentoria eram produtos separados.
 *
 * - As PERMISSÕES são de equipe: Administrador e Equipe. Quem trabalha na
 *   IAplicada pode não ter plano nenhum.
 *
 * Antes, o plano só destravava se "Mentorado" estivesse marcado, e a lista de
 * papéis tinha cinco opções, três delas de produtos que não existem mais.
 */

type PermissaoEquipe = "admin" | "equipe";

interface NovoUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function NovoUsuarioModal({ open, onOpenChange }: NovoUsuarioModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [permissoes, setPermissoes] = useState<PermissaoEquipe[]>([]);
  const [plano, setPlano] = useState<Plano | null>(null);
  const createUser = useCreateUser();

  const alternar = (p: PermissaoEquipe) =>
    setPermissoes((atual) => (atual.includes(p) ? atual.filter((x) => x !== p) : [...atual, p]));

  // Sem plano e sem permissão a pessoa não entra em lugar nenhum.
  const podeCriar = Boolean(plano) || permissoes.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeCriar) return;
    await createUser.mutateAsync({
      email,
      password,
      nomeCompleto,
      roles: permissoes,
      planoMentoria: plano,
    });
    setEmail("");
    setPassword("");
    setNomeCompleto("");
    setPermissoes([]);
    setPlano(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Nome da pessoa"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
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
              <Label htmlFor="password">Senha temporária</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="A pessoa troca no primeiro acesso"
                required
              />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Plano</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLANOS.map((opcao) => {
                const ativo = plano === opcao.value;
                return (
                  <Card
                    key={opcao.value}
                    role="radio"
                    aria-checked={ativo}
                    tabIndex={0}
                    onClick={() => setPlano(ativo ? null : opcao.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPlano(ativo ? null : opcao.value);
                      }
                    }}
                    className={cn(
                      "cursor-pointer p-4 transition-colors",
                      ativo ? "border-primary bg-primary/10" : "hover:border-primary/50",
                    )}
                  >
                    <p className="mb-1 text-sm font-semibold text-foreground">{opcao.label}</p>
                    <p className="text-xs text-muted-foreground">{opcao.description}</p>
                  </Card>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Quem tem plano é cliente. O acesso ao conteúdo vem daqui; clique de novo para
              desmarcar.
            </p>
          </div>

          <div>
            <Label className="mb-3 block">Permissões de equipe</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm-admin"
                  checked={permissoes.includes("admin")}
                  onCheckedChange={() => alternar("admin")}
                />
                <Label htmlFor="perm-admin" className="cursor-pointer">
                  Administrador
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm-equipe"
                  checked={permissoes.includes("equipe")}
                  onCheckedChange={() => alternar("equipe")}
                />
                <Label htmlFor="perm-equipe" className="cursor-pointer">
                  Equipe
                </Label>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Só para quem trabalha na IAplicada. Cliente não precisa de permissão.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createUser.isPending || !podeCriar}>
              {createUser.isPending ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
