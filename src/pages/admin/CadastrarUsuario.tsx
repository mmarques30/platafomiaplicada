import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "@/hooks/admin/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppRole = "admin" | "equipe" | "mentorado" | "aluno_trilha";

export default function CadastrarUsuario() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nomeCompleto: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const toggleRole = (role: AppRole) => {
    setSelectedRoles((prev) => {
      const newRoles = prev.includes(role) 
        ? prev.filter((r) => r !== role) 
        : [...prev, role];
      
      // Se desmarcar mentorado, limpar plano
      if (role === "mentorado" && !newRoles.includes("mentorado")) {
        setSelectedPlan("");
      }
      
      return newRoles;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que mentorados tenham plano selecionado
    if (selectedRoles.includes("mentorado") && !selectedPlan) {
      return; // Toast será exibido pelo componente
    }
    
    createUser.mutate(
      { 
        ...formData, 
        roles: selectedRoles,
        planoMentoria: selectedPlan || null 
      },
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
                    id="equipe"
                    checked={selectedRoles.includes("equipe")}
                    onCheckedChange={() => toggleRole("equipe")}
                  />
                  <Label htmlFor="equipe" className="cursor-pointer">
                    Equipe
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

            {selectedRoles.includes("mentorado") && (
              <div className="space-y-3">
                <Label>Plano de Mentoria *</Label>
                <p className="text-sm text-muted-foreground">
                  Classificação interna para alinhamento operacional
                </p>
                <div className="space-y-3">
                  {/* INTENSIVO GRUPO */}
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedPlan === "intensivo_grupo" 
                        ? "border-primary border-2 bg-primary/5" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlan("intensivo_grupo")}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="plano"
                              checked={selectedPlan === "intensivo_grupo"}
                              onChange={() => setSelectedPlan("intensivo_grupo")}
                            />
                            <h3 className="font-bold text-lg">Intensivo Grupo</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            6 semanas • Implementação em grupo com autonomia guiada
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            <div>• 6 sessões obrigatórias em grupo (2h)</div>
                            <div>• Implementação: Sozinho</div>
                            <div>• 2 projetos básicos (com templates)</div>
                            <div>• Comunidade básica + 20+ prompts</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* LIGHT */}
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedPlan === "light" 
                        ? "border-primary border-2 bg-primary/5" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlan("light")}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="plano"
                              checked={selectedPlan === "light"}
                              onChange={() => setSelectedPlan("light")}
                            />
                            <h3 className="font-bold text-lg">Light (Intensivo + Revisão)</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            8 semanas • Implementação orientada com revisão individual
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            <div>• 6 sessões grupo + 3 sessões 1:1 (60min)</div>
                            <div>• Implementação: Com revisão</div>
                            <div>• WhatsApp direto (SLA 24h) + Revisão ilimitada</div>
                            <div>• 3 projetos customizados + 50+ prompts</div>
                            <div>• Plano de Carreira 6 meses</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PREMIUM */}
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedPlan === "premium" 
                        ? "border-primary border-2 bg-primary/5" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlan("premium")}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="plano"
                              checked={selectedPlan === "premium"}
                              onChange={() => setSelectedPlan("premium")}
                            />
                            <h3 className="font-bold text-lg">Parceria Premium</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            12 semanas • Parceria estratégica com resultado garantido
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            <div>• Aulas opcionais + 6 sessões 1:1 (90min quinzenais)</div>
                            <div>• Implementação: Junto comigo</div>
                            <div>• WhatsApp direto (SLA 12h) + Revisão prioritária</div>
                            <div>• 6+ projetos estratégicos + 100+ prompts customizados</div>
                            <div>• Sistema de IA Operacional + Plano 12 meses</div>
                            <div>• Mastermind trimestral + Comunidade exclusiva</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {selectedRoles.includes("mentorado") && !selectedPlan && (
                  <p className="text-sm text-destructive">
                    Selecione um plano de mentoria
                  </p>
                )}
              </div>
            )}

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
