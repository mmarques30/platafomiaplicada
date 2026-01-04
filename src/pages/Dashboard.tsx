import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Zap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PendenciasOnboarding } from "@/components/dashboard/PendenciasOnboarding";
import { VideosVisitante } from "@/components/dashboard/VideosVisitante";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCardBloqueavel } from "@/components/shared/TrilhaCardBloqueavel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isVisitante, isLoading: loadingRole } = useUserRole();
  const { profile, isLoading: loadingProfile } = useUserProfile();

  // Visitantes são redirecionados para /trilhas (nova homepage para acesso gratuito)
  useEffect(() => {
    if (!loadingRole && isVisitante) {
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, loadingRole, navigate]);

  // Query para buscar trilhas com lógica diferenciada por tipo de usuário
  const { data: trilhasRaw, isLoading: loadingTrilhas } = useQuery({
    queryKey: ["trilhas-dashboard", user?.id, isVisitante],
    queryFn: async () => {
      if (isVisitante) {
        // Visitantes: buscar TODAS trilhas (mostrar todas bloqueadas)
        const { data: trilhasData, error: trilhasError } = await supabase
          .from("trilhas")
          .select("id, titulo, imagem_url, bloqueada, ordem, visivel_apenas_pro, nivel_minimo_acesso")
          .order("ordem");

        if (trilhasError) throw trilhasError;

        // Para cada trilha, verificar se tem vídeos visíveis para visitantes
        const trilhasComDisponibilidade = await Promise.all(
          (trilhasData || []).map(async (trilha) => {
            const { data: videos } = await supabase
              .from("videos")
              .select("id")
              .eq("trilha_id", trilha.id)
              .eq("ativo", true)
              .eq("visivel_visitantes", true);

            return {
              ...trilha,
              temConteudoDisponivel: (videos?.length || 0) > 0
            };
          })
        );

        // Ordenar: com conteúdo disponível primeiro
        return trilhasComDisponibilidade.sort((a, b) => {
          if (a.temConteudoDisponivel && !b.temConteudoDisponivel) return -1;
          if (!a.temConteudoDisponivel && b.temConteudoDisponivel) return 1;
          return a.ordem - b.ordem;
        });
      } else {
        // Mentorados: buscar TODAS trilhas (incluindo bloqueadas com ativo=false)
        const { data, error } = await supabase
          .from("trilhas")
          .select("id, titulo, imagem_url, bloqueada, visivel_apenas_pro, nivel_minimo_acesso, ordem, ativo")
          .order("bloqueada", { ascending: true }) // Liberadas primeiro!
          .order("ordem");

        if (error) throw error;
        return (data || []).map((t) => ({ ...t, temConteudoDisponivel: true }));
      }
    },
    enabled: !!user && !loadingRole,
  });

  const trilhas = trilhasRaw || [];

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
      <main className="container py-4 md:py-6 px-4 space-y-6 md:space-y-8">
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

        {/* Novidades da Semana */}
        <section>
          <NovidadesSemana />
        </section>

        {/* Conteúdo baseado no tipo de usuário */}
        <section>
          {isVisitante ? (
            // Visitantes: todas trilhas bloqueadas
            <>
              <div className="flex justify-between items-start gap-4 mb-6">
                <h2 className="text-2xl font-bold">Trilhas de Aprendizado</h2>
                <Link 
                  to="/aplique"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 font-medium transition-colors whitespace-nowrap"
                >
                  <Zap className="h-4 w-4" />
                  Ter acesso ao Academy
                </Link>
              </div>
              {loadingTrilhas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-[400px] rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trilhas.map((trilha: any) => (
                    <TrilhaCardBloqueavel
                      key={trilha.id}
                      id={trilha.id}
                      titulo={trilha.titulo}
                      imagem_url={trilha.imagem_url || undefined}
                      bloqueada={trilha.bloqueada || false}
                      visivel_apenas_pro={trilha.visivel_apenas_pro || false}
                      nivel_minimo_acesso={trilha.nivel_minimo_acesso}
                      isVisitante={true}
                      temConteudoDisponivel={false} // Força cadeado em todas
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Mentorados: carrossel com TODAS as trilhas
            <>
              <h2 className="text-2xl font-bold mb-6">Suas Trilhas</h2>
              {loadingTrilhas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[400px] rounded-xl" />
                  ))}
                </div>
              ) : (
              <div className="relative px-0 md:px-14">
                <Carousel 
                  opts={{ align: "start", loop: false }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {trilhas.map((trilha: any) => (
                      <CarouselItem 
                        key={trilha.id} 
                        className="pl-4 basis-1/2 sm:basis-1/2 md:basis-1/4"
                      >
                        <TrilhaCardBloqueavel
                          id={trilha.id}
                          titulo={trilha.titulo}
                          imagem_url={trilha.imagem_url || undefined}
                          bloqueada={trilha.bloqueada || false}
                          visivel_apenas_pro={trilha.visivel_apenas_pro || false}
                          nivel_minimo_acesso={trilha.nivel_minimo_acesso}
                          isVisitante={isVisitante}
                          temConteudoDisponivel={trilha.temConteudoDisponivel}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {trilhas.length > 4 && (
                    <>
                      <CarouselPrevious className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white border-0 shadow-xl h-10 w-10" />
                      <CarouselNext className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white border-0 shadow-xl h-10 w-10" />
                    </>
                  )}
                </Carousel>
              </div>
              )}
            </>
          )}
        </section>

      </main>
    </div>
  );
}