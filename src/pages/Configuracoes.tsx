import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Sun, Bell, Lock, AlertTriangle, FileText, Smartphone, Download, CheckCircle2, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { forceFullAppReload } from "@/lib/pwaUpdate";
import { PageTitle } from "@/components/shared/PageTitle";
import { OnboardingProgressCard } from "@/components/configuracoes/OnboardingProgressCard";

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const { isVisitante } = useUserRole();
  const { theme, setTheme } = useTheme();
  const { canInstall, isInstalled, deviceType, triggerInstall } = usePWAInstall();
  const navigate = useNavigate();
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [senhaTemporaria, setSenhaTemporaria] = useState(false);

  useEffect(() => {
    const checkSenhaTemporaria = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("senha_temporaria")
        .eq("id", user.id)
        .single();
        
      if (profile?.senha_temporaria) {
        setSenhaTemporaria(true);
      }
    };
    
    checkSenhaTemporaria();
  }, [user]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Atualizar flag de senha temporária
      if (user) {
        await supabase
          .from("profiles")
          .update({
            senha_temporaria: false,
            primeiro_acesso: false,
            senha_alterada_em: new Date().toISOString()
          })
          .eq("id", user.id);
      }

      setSenhaTemporaria(false);
      toast.success("Senha alterada com sucesso");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error) {
      toast.error("Erro ao alterar senha");
    }
  };


  return (
    <div className="container max-w-4xl py-4 md:py-8 px-4">
      <PageTitle primary="Configurações" />
      <div className="mb-6 md:mb-8" />

      <div className="space-y-6">
        {/* Progresso do Perfil */}
        <OnboardingProgressCard />

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Aparência
            </CardTitle>
            <CardDescription>Personalize a aparência do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Ative o tema escuro para melhor visualização
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
        </CardContent>
        </Card>

        {/* Instalar Aplicativo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Instalar Aplicativo
            </CardTitle>
            <CardDescription>
              Acesse o Academy direto da tela inicial do seu celular
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    App instalado!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você já está usando o aplicativo instalado
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {deviceType === 'ios' 
                    ? "No Safari, toque em Compartilhar e depois em 'Adicionar à Tela de Início'"
                    : "Instale o app para acesso rápido, offline e notificações"
                  }
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {deviceType !== 'ios' && canInstall && (
                    <Button onClick={triggerInstall} className="gap-2">
                      <Download className="h-4 w-4" />
                      Instalar Agora
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/instalar')}
                  >
                    Ver instruções detalhadas
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Gerencie suas preferências de notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações por email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificacoesEmail}
                onCheckedChange={setNotificacoesEmail}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Altere sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {senhaTemporaria && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Senha Temporária</AlertTitle>
                <AlertDescription>
                  Você está usando uma senha temporária. Recomendamos alterá-la para uma senha pessoal agora.
                </AlertDescription>
              </Alert>
            )}

            {!isChangingPassword ? (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                Alterar Senha
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword}>
                    Confirmar Alteração
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atualização do App */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Atualização do App
            </CardTitle>
            <CardDescription>
              Force a atualização se algo não estiver funcionando corretamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se você está vendo imagens antigas ou comportamentos estranhos, 
              clique no botão abaixo para forçar uma atualização completa.
            </p>
            <Button 
              variant="outline"
              onClick={forceFullAppReload}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Forçar Atualização Completa
            </Button>
          </CardContent>
        </Card>

        {/* Políticas e Termos - Apenas para clientes pagantes */}
        {!isVisitante && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Políticas e Termos
              </CardTitle>
              <CardDescription>Consulte os documentos legais da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link to="/politica-servicos">
                <Button variant="outline">Política de Serviços</Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
