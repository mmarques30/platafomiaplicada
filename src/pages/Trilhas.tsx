import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { useUserRole } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCardBloqueavel } from "@/components/shared/TrilhaCardBloqueavel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export default function Trilhas() {
  const { isVisitante, isLoading: loadingRole } = useUserRole();

  // Query para buscar todas as trilhas para visitantes
  const { data: trilhasVisitante, isLoading: loadingTrilhas } = useQuery({
    queryKey: ["trilhas-visitante-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("id, titulo, imagem_url, ordem")
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
    enabled: isVisitante && !loadingRole,
  });

  const showLoading = loadingRole || (isVisitante && loadingTrilhas);

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="mb-8 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trilhas de Aprendizado</h1>
            <p className="text-muted-foreground">
              Vídeos organizados por trilha
            </p>
          </div>
          
          {isVisitante && (
            <Link 
              to="/aplique"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 font-medium transition-colors whitespace-nowrap"
            >
              <Zap className="h-4 w-4" />
              Ter acesso ao Academy
            </Link>
          )}
        </div>

        <div className="mt-8">
          {showLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[400px] rounded-xl" />
              ))}
            </div>
          ) : isVisitante ? (
            // VISITANTE: Carrossel de trilhas bloqueadas
            <div className="relative px-14">
              <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <CarouselContent className="-ml-4">
                  {trilhasVisitante?.map((trilha) => (
                    <CarouselItem key={trilha.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/4">
                      <TrilhaCardBloqueavel
                        id={trilha.id}
                        titulo={trilha.titulo}
                        imagem_url={trilha.imagem_url}
                        bloqueada={true}
                        isVisitante={true}
                        temConteudoDisponivel={false}
                        aspectRatio="3/4"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {(trilhasVisitante?.length ?? 0) > 4 && (
                  <>
                    <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white border-0 shadow-xl h-10 w-10" />
                    <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white border-0 shadow-xl h-10 w-10" />
                  </>
                )}
              </Carousel>
            </div>
          ) : (
            // MENTORADO: Vídeos por trilha (comportamento atual)
            <UltimosConteudos />
          )}
        </div>
      </main>
    </div>
  );
}
