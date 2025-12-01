import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { TrilhaCardBloqueavel } from "@/components/shared/TrilhaCardBloqueavel";
import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { Skeleton } from "@/components/ui/skeleton";

export default function Trilhas() {
  const { user } = useAuth();
  const { isVisitante } = useUserRole();

  // Query para visitantes: buscar TODAS as trilhas (sem filtro de ativo)
  const { data: trilhasVisitante, isLoading: loadingVisitante } = useQuery({
    queryKey: ["trilhas-visitante-todas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("id, titulo, imagem_url, bloqueada, ordem, visivel_apenas_pro, nivel_minimo_acesso")
        .order("ordem");

      if (error) throw error;
      return data || [];
    },
    enabled: isVisitante,
  });

  // Query para mentorados: buscar TODAS as trilhas (incluindo bloqueadas)
  const { data: trilhasMentorado, isLoading: loadingMentorado } = useQuery({
    queryKey: ["trilhas-mentorado-todas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("id, titulo, imagem_url, bloqueada, ordem, visivel_apenas_pro, nivel_minimo_acesso")
        .eq("ativo", true)
        .order("ordem");

      if (error) throw error;
      
      // Ordenar: trilhas desbloqueadas primeiro, depois bloqueadas
      const sorted = (data || []).sort((a, b) => {
        if (a.bloqueada === b.bloqueada) return a.ordem - b.ordem;
        return a.bloqueada ? 1 : -1;
      });
      
      return sorted;
    },
    enabled: !isVisitante,
  });

  const isLoading = isVisitante ? loadingVisitante : loadingMentorado;
  const trilhas = isVisitante ? trilhasVisitante : trilhasMentorado;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trilhas de Aprendizado</h1>
          <p className="text-muted-foreground">
            Vídeos organizados por trilha
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Grid de Catálogo de Trilhas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {trilhas?.map((trilha) => (
                <TrilhaCardBloqueavel
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url || undefined}
                  bloqueada={trilha.bloqueada || false}
                  visivel_apenas_pro={trilha.visivel_apenas_pro || false}
                  nivel_minimo_acesso={trilha.nivel_minimo_acesso}
                  isVisitante={isVisitante}
                  temConteudoDisponivel={false}
                />
              ))}
            </div>

            {/* Seção de Últimos Vídeos (apenas para mentorados) */}
            {!isVisitante && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Últimos Vídeos Adicionados</h2>
                <UltimosConteudos />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
