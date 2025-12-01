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
  const { data: trilhasVisitante, isLoading } = useQuery({
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trilhas de Aprendizado</h1>
          <p className="text-muted-foreground">
            Vídeos organizados por trilha
          </p>
        </div>

        {isVisitante ? (
          // VISITANTES: Mostrar TODAS as trilhas com cadeado
          isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trilhasVisitante?.map((trilha) => (
                <TrilhaCardBloqueavel
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url || undefined}
                  bloqueada={trilha.bloqueada || false}
                  visivel_apenas_pro={trilha.visivel_apenas_pro || false}
                  nivel_minimo_acesso={trilha.nivel_minimo_acesso}
                  isVisitante={true}
                  temConteudoDisponivel={false}
                />
              ))}
            </div>
          )
        ) : (
          // MENTORADOS: Mostrar carrosséis de vídeos por trilha
          <UltimosConteudos />
        )}
      </main>
    </div>
  );
}
