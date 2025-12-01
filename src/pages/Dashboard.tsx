import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { VideosVisitante } from "@/components/dashboard/VideosVisitante";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCardBloqueavel } from "@/components/shared/TrilhaCardBloqueavel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isVisitante } = useUserRole();
  const [mostrarAvisoSenha, setMostrarAvisoSenha] = useState(false);

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
    enabled: !!user,
  });

  const trilhas = trilhasRaw || [];

  useEffect(() => {
    if (!user) return;
    
    const verificarSenhaTemporaria = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('senha_temporaria, primeiro_acesso')
        .eq('id', user.id)
        .single();

      // Não mostrar aviso para visitantes - eles criaram a própria senha
      if (!isVisitante && (profile?.senha_temporaria || profile?.primeiro_acesso)) {
        setMostrarAvisoSenha(true);
      }
    };

    verificarSenhaTemporaria();
  }, [user]);


  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
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
              <Button
                variant="ghost"
                size="sm"
                className="ml-4 hover:bg-primary/10"
                onClick={() => setMostrarAvisoSenha(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/10 p-4 md:p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <WelcomeHeader />
            </div>
          </div>
        </section>

        {/* Novidades da Semana */}
        <section>
          <NovidadesSemana />
        </section>

        {/* Conteúdo baseado no tipo de usuário */}
        <section>
          {isVisitante ? (
            // Visitantes: todas trilhas bloqueadas
            <>
              <h2 className="text-2xl font-bold mb-6">Trilhas de Aprendizado</h2>
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
            // Mentorados: 4 trilhas com botão "Ver todas"
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Suas Trilhas</h2>
                <Link 
                  to="/trilhas" 
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Ver todas
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {loadingTrilhas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[400px] rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {trilhas.slice(0, 4).map((trilha: any) => (
                    <TrilhaCardBloqueavel
                      key={trilha.id}
                      id={trilha.id}
                      titulo={trilha.titulo}
                      imagem_url={trilha.imagem_url || undefined}
                      bloqueada={trilha.bloqueada || false}
                      visivel_apenas_pro={trilha.visivel_apenas_pro || false}
                      nivel_minimo_acesso={trilha.nivel_minimo_acesso}
                      isVisitante={isVisitante}
                      temConteudoDisponivel={trilha.temConteudoDisponivel}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

      </main>
    </div>
  );
}