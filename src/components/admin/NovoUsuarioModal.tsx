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
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useCreateUser } from "@/hooks/admin/useUsers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SkillsEquipeSelector, type SkillsEquipeData } from "./SkillsEquipeSelector";

type AppRole = "admin" | "equipe" | "mentorado" | "aluno_trilha" | "parceiros";

interface NovoUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLANOS = [
  { value: "academy", label: "Academy", description: "B2C Individual - Acesso às trilhas" },
  { value: "skills", label: "Skills", description: "B2B - Licença corporativa" },
  { value: "business_parceria", label: "Builder", description: "Consultoria colaborativa - cliente participa" },
  { value: "business_sistemas", label: "System", description: "iAplicada constrói - cliente acompanha" },
];

export function NovoUsuarioModal({ open, onOpenChange }: NovoUsuarioModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<string>("");
  const [skillsLiberado, setSkillsLiberado] = useState(false);
  const [skillsEquipeData, setSkillsEquipeData] = useState<SkillsEquipeData>({
    equipeId: null,
    novaEquipe: null,
    papelEquipe: "membro",
  });
  
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

  const isSkillsValid = () => {
    if (selectedPlano !== "skills") return true;
    
    // Must have either existing team or valid new team data
    if (skillsEquipeData.equipeId) return true;
    if (skillsEquipeData.novaEquipe?.nome && skillsEquipeData.novaEquipe?.empresa) return true;
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlano === "skills" && !isSkillsValid()) {
      toast.error("Para o plano Skills, é obrigatório selecionar ou criar uma equipe.");
      return;
    }

    await createUser.mutateAsync({
      email,
      password,
      nomeCompleto,
      roles: selectedRoles,
      planoMentoria: selectedPlano || null,
      skillsLiberado: (selectedPlano === "business_parceria" || selectedPlano === "business_sistemas") ? skillsLiberado : false,
      // Skills team data
      equipeId: selectedPlano === "skills" ? skillsEquipeData.equipeId : null,
      novaEquipe: selectedPlano === "skills" ? skillsEquipeData.novaEquipe : null,
      papelEquipe: selectedPlano === "skills" ? skillsEquipeData.papelEquipe : undefined,
    });

    // Resetar form
    setEmail("");
    setPassword("");
    setNomeCompleto("");
    setSelectedRoles([]);
    setSelectedPlano("");
    setSkillsLiberado(false);
    setSkillsEquipeData({
      equipeId: null,
      novaEquipe: null,
      papelEquipe: "membro",
    });
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
                  Aluno da Trilha
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parceiros"
                  checked={selectedRoles.includes("parceiros")}
                  onCheckedChange={() => toggleRole("parceiros")}
                />
                <Label htmlFor="parceiros" className="cursor-pointer">
                  Parceiro
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Produto / Plano (opcional)</Label>
            <div className="grid grid-cols-2 gap-3">
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
                    "font-semibold mb-1 text-sm",
                    selectedPlano === plano.value 
                      ? "text-foreground" 
                      : "text-card-foreground"
                  )}>
                    {plano.label}
                  </h4>
                  <p className={cn(
                    "text-xs",
                    selectedPlano === plano.value 
                      ? "text-foreground/70"
                      : "text-card-foreground/70"
                  )}>
                    {plano.description}
                  </p>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Selecione o produto/plano que este usuário terá acesso
            </p>
            
            {/* Skills Team Selector - apenas para Skills */}
            {selectedPlano === "skills" && (
              <div className="mt-4">
                <SkillsEquipeSelector
                  value={skillsEquipeData}
                  onChange={setSkillsEquipeData}
                  showLiderOption={true}
                />
              </div>
            )}
            
            {/* Switch para liberar Skills - apenas para Business colaborativo */}
            {(selectedPlano === "business_parceria" || selectedPlano === "business_sistemas") && (
              <div className="flex items-center justify-between space-x-2 mt-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="skills-liberado-novo" className="text-sm font-medium">
                    Liberar acesso ao Skills
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permite acessar o ambiente Skills além do Business
                  </p>
                </div>
                <Switch
                  id="skills-liberado-novo"
                  checked={skillsLiberado}
                  onCheckedChange={setSkillsLiberado}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createUser.isPending || (selectedPlano === "skills" && !isSkillsValid())}>
              {createUser.isPending ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
