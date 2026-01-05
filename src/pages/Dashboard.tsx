import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PendenciasOnboarding } from "@/components/dashboard/PendenciasOnboarding";
import { CentralConteudo } from "@/components/dashboard/CentralConteudo";
import { RankingTicker } from "@/components/dashboard/RankingTicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isVisitante, isLoading: loadingRole } = useUserRole();
  const { profile, isLoading: loadingProfile } = useUserProfile();

  // Visitantes são redirecionados para /trilhas (nova homepage para acesso gratuito)
  useEffect(() => {
    if (!loadingRole && isVisitante) {
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, loadingRole, navigate]);

  // Derivar o estado do aviso de senha diretamente dos dados carregados (elimina race condition)
  const mostrarAvisoSenha = useMemo(() => {
    // Não mostrar durante carregamento
    if (loadingRole || loadingProfile) return false;
    // Visitantes não veem o aviso
    if (isVisitante) return false;
    // Só mostra se tem senha temporária ou primeiro acesso
    return profile?.senha_temporaria === true || profile?.primeiro_acesso === true;
  }, [loadingRole, loadingProfile, isVisitante, profile]);


  // IMPORTANTE: Não renderizar enquanto carrega ou se for visitante
  // Isso evita flash de conteúdo errado antes do redirect
  if (loadingRole || isVisitante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-3 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6 lg:space-y-8">
        {/* Aviso de senha temporária */}
        {mostrarAvisoSenha && (
          <Alert className="border-2 border-primary bg-primary/5 shadow-md">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <strong className="text-primary">Senha temporária detectada:</strong> Por segurança, recomendamos que você{" "}
                <Link 
                  to="/configuracoes" 
                  className="underline font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  altere sua senha em Configurações
                </Link>
                .
              </div>
              <Link to="/configuracoes">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4 hover:bg-primary/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <section>
          <WelcomeHeader />
        </section>

        {/* Banner PWA (apenas para mentorados) */}
        {!isVisitante && <PWAInstallBanner />}

        {/* Card de Pendências (apenas mentorados) */}
        {!isVisitante && <PendenciasOnboarding />}

        {/* Central de Conteúdo Interativa */}
        {!isVisitante && <CentralConteudo />}

        {/* Painel de Destaques - Ranking */}
        {!isVisitante && <RankingTicker />}

        {/* Novidades da Semana */}
        <section>
          <NovidadesSemana />
        </section>


      </main>
    </div>
  );
}