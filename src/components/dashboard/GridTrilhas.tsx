import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCardBloqueavel } from "@/components/shared/TrilhaCardBloqueavel";
import { useContentVisibility } from "@/hooks/useContentVisibility";
import { Skeleton } from "@/components/ui/skeleton";

interface TrilhaGridItem {
  id: string;
  titulo: string;
  imagem_url: string | null;
  bloqueada: boolean | null;
  visivel_apenas_pro: boolean | null;
}

export function GridTrilhas() {
  const { visibilityField, isLoading: loadingVisibility } = useContentVisibility();

  const { data: trilhas, isLoading } = useQuery({
    queryKey: ["trilhas-grid", visibilityField],
    queryFn: async (): Promise<TrilhaGridItem[]> => {
      const query = supabase
        .from("trilhas")
        .select("id, titulo, imagem_url, bloqueada, visivel_apenas_pro")
        .eq("ativo", true)
        .order("ordem");

      // Aplicar filtro de visibilidade
      const { data, error } = await query.eq(visibilityField as 'visivel_mentorados' | 'visivel_visitantes', true);

      if (error) throw error;
      return data as TrilhaGridItem[];
    },
    enabled: !loadingVisibility,
  });

  if (isLoading || loadingVisibility) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!trilhas || trilhas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma trilha disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trilhas.map((trilha) => (
        <TrilhaCardBloqueavel
          key={trilha.id}
          id={trilha.id}
          titulo={trilha.titulo}
          imagem_url={trilha.imagem_url || undefined}
          bloqueada={trilha.bloqueada || false}
          visivel_apenas_pro={trilha.visivel_apenas_pro || false}
        />
      ))}
    </div>
  );
}
