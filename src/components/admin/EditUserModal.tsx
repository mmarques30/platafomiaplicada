import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { CalendarIcon, Key } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUpdateUser, useResetUserPassword } from "@/hooks/admin/useUsers";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AppRole = "admin" | "mentorado" | "aluno_trilha";

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
  } | null;
}

const PLANOS = [
  { value: "academy", label: "Academy", description: "B2C Individual - Acesso às trilhas" },
  { value: "skills", label: "Skills", description: "B2B - Licença corporativa" },
  { value: "business", label: "Business", description: "B2C Premium - Mentoria 1:1 completa" },
];

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();
  
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedPlano, setSelectedPlano] = useState<"academy" | "skills" | "business" | null>(null);
  const [dataExpiracao, setDataExpiracao] = useState<Date | undefined>();
  const [contaAtiva, setContaAtiva] = useState(true);
  const [origemConsultoria, setOrigemConsultoria] = useState(false);
  const [empresaConsultoria, setEmpresaConsultoria] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [forcarTroca, setForcarTroca] = useState(false);

  useEffect(() => {
    if (user) {
      setValue("nome_completo", user.nome_completo);
      setValue("email", user.email);
      setValue("profissao", user.profissao || "");
      setValue("idade", user.idade || "");
      setValue("linkedin", user.linkedin || "");
      
      setSelectedRoles(user.roles as AppRole[]);
      setSelectedPlano((user.plano_mentoria as "academy" | "skills" | "business") || null);
      setDataExpiracao(user.data_expiracao_acesso ? new Date(user.data_expiracao_acesso) : undefined);
      setContaAtiva(user.conta_ativa ?? true);
      setOrigemConsultoria(user.origem_consultoria ?? false);
      setEmpresaConsultoria(user.empresa_consultoria || "");
    }
  }, [user, setValue]);

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const onSubmit = async (data: any) => {
    if (!user) return;

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
        origem_consultoria: origemConsultoria,
        empresa_consultoria: empresaConsultoria || null,
        roles: selectedRoles,
      },
    });

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

  if (!user) return null;

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
                      onClick={() => setSelectedPlano(plano.value as "academy" | "skills" | "business")}
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
              </div>

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

              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="origem-consultoria">Veio de Consultoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Marcar se o acesso veio de um projeto Consult
                    </p>
                  </div>
                  <Switch
                    id="origem-consultoria"
                    checked={origemConsultoria}
                    onCheckedChange={setOrigemConsultoria}
                  />
                </div>

                {origemConsultoria && (
                  <div>
                    <Label htmlFor="empresa-consultoria">Empresa/Projeto (opcional)</Label>
                    <Input
                      id="empresa-consultoria"
                      value={empresaConsultoria}
                      onChange={(e) => setEmpresaConsultoria(e.target.value)}
                      placeholder="Ex: Empresa XYZ - Projeto Transformação Digital"
                    />
                  </div>
                )}
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
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
