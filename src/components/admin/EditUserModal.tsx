import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Key, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateUser, useResetUserPassword } from "@/hooks/admin/useUsers";
import { useUserSkillsMembro, useUpdateUserSkillsMembro, useRemoveUserSkillsMembro } from "@/hooks/admin/useEquipesSkillsAdmin";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkillsEquipeSelector, SkillsEquipeData } from "./SkillsEquipeSelector";

type AppRole = "admin" | "equipe" | "mentorado" | "aluno_trilha" | "parceiros";

// Verifica se o email é do Google (@gmail.com ou @googlemail.com)
function isGoogleEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith("@gmail.com") || lowerEmail.endsWith("@googlemail.com");
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    nome_completo: string;
    email: string;
    profissao?: string;
    idade?: number;
    linkedin?: string;
    plano_mentoria?: string;
    data_expiracao_acesso?: string;
    conta_ativa?: boolean;
    origem_consultoria?: boolean;
    empresa_consultoria?: string;
    roles: string[];
    skills_liberado?: boolean;
    google_login_autorizado?: boolean;
  } | null;
}

const PLANOS = [
  { value: "academy", label: "Academy", description: "B2C Individual - Acesso às trilhas" },
  { value: "skills", label: "Skills", description: "B2B - Licença corporativa" },
  { value: "business_parceria", label: "Business Parceria", description: "Consultoria colaborativa - cliente participa" },
  { value: "business_sistemas", label: "Business Sistemas", description: "iAplicada constrói - cliente acompanha" },
];

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();
  const updateSkillsMembro = useUpdateUserSkillsMembro();
  const removeSkillsMembro = useRemoveUserSkillsMembro();
  const { data: userSkillsMembro, isLoading: loadingSkillsMembro } = useUserSkillsMembro(user?.id);
  
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<"academy" | "skills" | "business_parceria" | "business_sistemas" | null>(null);
  const [dataExpiracao, setDataExpiracao] = useState<Date | undefined>();
  const [contaAtiva, setContaAtiva] = useState(true);
  const [novaSenha, setNovaSenha] = useState("");
  const [forcarTroca, setForcarTroca] = useState(false);
  const [skillsLiberado, setSkillsLiberado] = useState(false);
  const [googleLoginAutorizado, setGoogleLoginAutorizado] = useState(false);
  const [skillsEquipeData, setSkillsEquipeData] = useState<SkillsEquipeData>({
    equipeId: null,
    novaEquipe: null,
    papelEquipe: "membro",
  });
  const [cargo, setCargo] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");

  // Buscar nome_empresa do contrato business
  const { data: contratoBusiness } = useQuery({
    queryKey: ["contrato-business-nome", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("contratos_business")
        .select("id, nome_empresa")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (contratoBusiness) {
      setNomeEmpresa(contratoBusiness.nome_empresa || "");
    } else {
      setNomeEmpresa("");
    }
  }, [contratoBusiness]);

  useEffect(() => {
    if (user) {
      setValue("nome_completo", user.nome_completo);
      setValue("email", user.email);
      setValue("profissao", user.profissao || "");
      setValue("idade", user.idade || "");
      setValue("linkedin", user.linkedin || "");
      
      setSelectedRoles(user.roles as AppRole[]);
      setSelectedPlano((user.plano_mentoria as "academy" | "skills" | "business_parceria" | "business_sistemas") || null);
      setDataExpiracao(user.data_expiracao_acesso ? new Date(user.data_expiracao_acesso) : undefined);
      setContaAtiva(user.conta_ativa ?? true);
      setSkillsLiberado(user.skills_liberado ?? false);
      setGoogleLoginAutorizado(user.google_login_autorizado ?? false);
    }
  }, [user, setValue]);

  // Carregar dados do vínculo Skills existente
  useEffect(() => {
    if (userSkillsMembro) {
      setSkillsEquipeData({
        equipeId: userSkillsMembro.equipe_id,
        novaEquipe: null,
        papelEquipe: (userSkillsMembro.papel as "lider" | "membro") || "membro",
      });
      setCargo(userSkillsMembro.cargo || "");
    } else {
      setSkillsEquipeData({
        equipeId: null,
        novaEquipe: null,
        papelEquipe: "membro",
      });
      setCargo("");
    }
  }, [userSkillsMembro]);

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const onSubmit = async (data: any) => {
    if (!user) return;

    // Atualizar dados gerais do usuário
    await updateUser.mutateAsync({
      userId: user.id,
      updates: {
        nome_completo: data.nome_completo,
        email: data.email,
        profissao: data.profissao || null,
        idade: data.idade ? parseInt(data.idade) : null,
        linkedin: data.linkedin || null,
        plano_mentoria: selectedPlano as any,
        data_expiracao_acesso: dataExpiracao?.toISOString() || null,
        conta_ativa: contaAtiva,
        roles: selectedRoles,
        skills_liberado: (selectedPlano === "business_parceria" || selectedPlano === "business_sistemas") ? skillsLiberado : false,
        google_login_autorizado: googleLoginAutorizado,
      },
    });

    // Atualizar vínculo Skills quando configuração está visível e há dados de equipe
    const isAnyBusiness = selectedPlano === "business_parceria" || selectedPlano === "business_sistemas";
    const shouldUpdateSkills = (selectedPlano === "skills" || (isAnyBusiness && skillsLiberado)) && 
                               (skillsEquipeData.equipeId || skillsEquipeData.novaEquipe);
    
    if (shouldUpdateSkills) {
      await updateSkillsMembro.mutateAsync({
        userId: user.id,
        equipeId: skillsEquipeData.equipeId,
        novaEquipe: skillsEquipeData.novaEquipe,
        papelEquipe: skillsEquipeData.papelEquipe,
        cargo,
      });
    }

    // Atualizar nome_empresa no contrato business
    const isBusinessPlan = selectedPlano === "business_parceria" || selectedPlano === "business_sistemas";
    if (isBusinessPlan && contratoBusiness?.id) {
      await supabase
        .from("contratos_business")
        .update({ nome_empresa: nomeEmpresa || null })
        .eq("id", contratoBusiness.id);
    }

    onOpenChange(false);
  };

  const handleResetPassword = async () => {
    if (!user || !novaSenha) return;

    await resetPassword.mutateAsync({
      userId: user.id,
      newPassword: novaSenha,
      forcaAlteracao: forcarTroca,
    });

    setNovaSenha("");
    setForcarTroca(false);
  };

  const handleRemoveSkillsVinculo = async () => {
    if (!user) return;
    await removeSkillsMembro.mutateAsync(user.id);
  };

  if (!user) return null;

  const hasSkillsVinculo = !!userSkillsMembro;
  
  // Mostrar configuração Skills quando plano é Skills OU qualquer Business com Skills liberado
  const isAnyBusinessPlan = selectedPlano === "business_parceria" || selectedPlano === "business_sistemas";
  const showSkillsConfig = selectedPlano === "skills" || 
                           (isAnyBusinessPlan && skillsLiberado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário - {user.nome_completo}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="acesso">Acesso</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input id="nome_completo" {...register("nome_completo", { required: true })} />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email", { required: true })} />
                </div>

                <div>
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input id="profissao" {...register("profissao")} />
                </div>

                <div>
                  <Label htmlFor="idade">Idade</Label>
                  <Input id="idade" type="number" {...register("idade")} />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" {...register("linkedin")} placeholder="https://linkedin.com/in/..." />
                </div>

                {/* Nome da Empresa - visível para planos Business */}
                {(selectedPlano === "business_parceria" || selectedPlano === "business_sistemas") && (
                  <div>
                    <Label htmlFor="nome_empresa">Nome da Empresa (exibição no projeto)</Label>
                    <Input
                      id="nome_empresa"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      placeholder="Nome fantasia / nome curto para exibição"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Este nome aparece no título "Projeto [Nome]"
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="acesso" className="space-y-4">
              <div>
                <Label className="mb-3 block">Permissões (Roles)</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-admin"
                      checked={selectedRoles.includes("admin")}
                      onCheckedChange={() => toggleRole("admin")}
                    />
                    <Label htmlFor="role-admin" className="cursor-pointer">Administrador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-equipe"
                      checked={selectedRoles.includes("equipe")}
                      onCheckedChange={() => toggleRole("equipe")}
                    />
                    <Label htmlFor="role-equipe" className="cursor-pointer">Equipe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-mentorado"
                      checked={selectedRoles.includes("mentorado")}
                      onCheckedChange={() => toggleRole("mentorado")}
                    />
                    <Label htmlFor="role-mentorado" className="cursor-pointer">Mentorado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-aluno"
                      checked={selectedRoles.includes("aluno_trilha")}
                      onCheckedChange={() => toggleRole("aluno_trilha")}
                    />
                    <Label htmlFor="role-aluno" className="cursor-pointer">Aluno da Trilha</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-parceiro"
                      checked={selectedRoles.includes("parceiros")}
                      onCheckedChange={() => toggleRole("parceiros")}
                    />
                    <Label htmlFor="role-parceiro" className="cursor-pointer">Parceiro</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Produto / Plano</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      selectedPlano === null
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPlano(null)}
                  >
                    <p className={cn(
                      "font-semibold mb-1 text-sm",
                      selectedPlano === null ? "text-foreground" : "text-card-foreground"
                    )}>
                      Sem plano
                    </p>
                    <p className={cn(
                      "text-xs",
                      selectedPlano === null ? "text-foreground/70" : "text-card-foreground/70"
                    )}>
                      Usuário sem produto ativo
                    </p>
                  </Card>
                  {PLANOS.map((plano) => (
                    <Card
                      key={plano.value}
                      className={cn(
                        "p-4 cursor-pointer transition-colors",
                        selectedPlano === plano.value
                          ? "border-primary bg-primary/10"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setSelectedPlano(plano.value as "academy" | "skills" | "business_parceria" | "business_sistemas")}
                    >
                      <p className={cn(
                        "font-semibold mb-1 text-sm",
                        selectedPlano === plano.value ? "text-foreground" : "text-card-foreground"
                      )}>
                        {plano.label}
                      </p>
                      <p className={cn(
                        "text-xs",
                        selectedPlano === plano.value ? "text-foreground/70" : "text-card-foreground/70"
                      )}>
                        {plano.description}
                      </p>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Selecione o produto/plano deste usuário
                </p>
                
                {/* Switch para liberar Skills - para ambos os tipos Business */}
                {isAnyBusinessPlan && (
                  <div className="flex items-center justify-between space-x-2 mt-4 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="skills-liberado" className="text-sm font-medium">
                        Liberar acesso ao Skills
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Permite acessar o ambiente Skills além do Business
                      </p>
                    </div>
                    <Switch
                      id="skills-liberado"
                      checked={skillsLiberado}
                      onCheckedChange={setSkillsLiberado}
                    />
                  </div>
                )}
              </div>

              {/* Configuração Skills - aparece quando plano é Skills ou Business com Skills liberado */}
              {showSkillsConfig && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Configuração Skills</Label>
                    {hasSkillsVinculo && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveSkillsVinculo}
                        disabled={removeSkillsMembro.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover Vínculo
                      </Button>
                    )}
                  </div>
                  
                  {loadingSkillsMembro ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      Carregando...
                    </div>
                  ) : (
                    <>
                      <SkillsEquipeSelector
                        value={skillsEquipeData}
                        onChange={setSkillsEquipeData}
                        showLiderOption={true}
                      />

                      <div>
                        <Label htmlFor="cargo-skills">Cargo na Empresa</Label>
                        <Input
                          id="cargo-skills"
                          value={cargo}
                          onChange={(e) => setCargo(e.target.value)}
                          placeholder="Ex: Analista de Marketing"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Cargo/função do colaborador na empresa (opcional)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <Label className="mb-2 block">Data de Expiração do Acesso</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataExpiracao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataExpiracao ? format(dataExpiracao, "PPP") : "Sem data de expiração"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataExpiracao}
                      onSelect={setDataExpiracao}
                      initialFocus
                      className="pointer-events-auto"
                    />
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setDataExpiracao(undefined)}
                    >
                      Limpar data
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="conta-ativa">Conta Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Desativar impedirá o usuário de fazer login
                  </p>
                </div>
                <Switch
                  id="conta-ativa"
                  checked={contaAtiva}
                  onCheckedChange={setContaAtiva}
                />
              </div>

              {/* Toggle de autorização Google - só aparece se email não é @gmail.com */}
              {user && !isGoogleEmail(user.email) && (
                <div className="flex items-center justify-between space-x-2 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="google-login-autorizado" className="text-sm font-medium">
                      Autorizar Login com Google
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permite login com Google mesmo com email não @gmail.com
                    </p>
                  </div>
                  <Switch
                    id="google-login-autorizado"
                    checked={googleLoginAutorizado}
                    onCheckedChange={setGoogleLoginAutorizado}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="seguranca" className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Use esta seção para resetar a senha do usuário. A nova senha será definida imediatamente.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forcar-troca"
                  checked={forcarTroca}
                  onCheckedChange={(checked) => setForcarTroca(checked as boolean)}
                />
                <Label htmlFor="forcar-troca" className="cursor-pointer">
                  Marcar como senha temporária (usuário verá aviso em Configurações)
                </Label>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={handleResetPassword}
                disabled={!novaSenha || resetPassword.isPending}
              >
                {resetPassword.isPending ? "Resetando..." : "Resetar Senha"}
              </Button>
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateUser.isPending || updateSkillsMembro.isPending}>
                {(updateUser.isPending || updateSkillsMembro.isPending) ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
