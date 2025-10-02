import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "@/hooks/admin/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppRole = "admin" | "mentorado" | "aluno_trilha";

export default function CadastrarUsuario() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nomeCompleto: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);

  const toggleRole = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(
      { ...formData, roles: selectedRoles },
      {
        onSuccess: () => {
          navigate("/admin/usuarios");
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Cadastrar Novo Usuário</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nomeCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nomeCompleto: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <div className="space-y-3">
              <Label>Roles Iniciais</Label>
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
                    Aluno Trilha
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/usuarios")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
