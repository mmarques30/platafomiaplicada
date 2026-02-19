import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCard } from "@/components/shared/TrilhaCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface TrilhaComContagem {
  id: string;
  titulo: string;
  imagem_url: string | null;
  categoria: string | null;
  classificacao: string | null;
  ordem: number;
  visivel_apenas_pro: boolean;
  created_at: string;
  total_videos: number;
}

export function TodasAsTrilhas() {
  const [ordenar, setOrdenar] = useState("ordem");
  const [classificacaoFiltro, setClassificacaoFiltro] = useState("todas");

  const { data: trilhas, isLoading } = useQuery({
    queryKey: ["todas-trilhas-com-contagem"],
    queryFn: async () => {
      const { data: trilhasData, error: tError } = await supabase
        .from("trilhas")
        .select("id, titulo, imagem_url, categoria, classificacao, ordem, visivel_apenas_pro, created_at")
        .eq("visivel_mentorados", true)
        .order("ordem");

      if (tError) throw tError;

      const { data: videosCounts, error: vError } = await supabase
        .from("videos")
        .select("trilha_id")
        .eq("ativo", true)
        .in("trilha_id", (trilhasData || []).map((t) => t.id));

      if (vError) throw vError;

      const countMap: Record<string, number> = {};
      (videosCounts || []).forEach((v) => {
        if (v.trilha_id) {
          countMap[v.trilha_id] = (countMap[v.trilha_id] || 0) + 1;
        }
      });

      return (trilhasData || []).map((t) => ({
        ...t,
        total_videos: countMap[t.id] || 0,
      })) as TrilhaComContagem[];
    },
  });

  // Extract unique classificacoes
  const classificacoes = useMemo(() => {
    if (!trilhas) return [];
    const cls = [...new Set(trilhas.map((t) => t.classificacao).filter(Boolean))] as string[];
    return cls.sort();
  }, [trilhas]);

  // Filter and sort
  const trilhasFiltradas = useMemo(() => {
    if (!trilhas) return [];
    let result = [...trilhas];

    if (classificacaoFiltro !== "todas") {
      result = result.filter((t) => t.classificacao === classificacaoFiltro);
    }

    switch (ordenar) {
      case "recentes":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "antigos":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default:
        result.sort((a, b) => a.ordem - b.ordem);
    }

    return result;
  }, [trilhas, classificacaoFiltro, ordenar]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[320px] w-[300px] rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Select value={ordenar} onValueChange={setOrdenar}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ordem">Ordem padrão</SelectItem>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="antigos">Mais antigos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={classificacaoFiltro} onValueChange={setClassificacaoFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Classificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as classificações</SelectItem>
            {classificacoes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Carousel */}
      {trilhasFiltradas.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma trilha encontrada com os filtros selecionados.
        </p>
      ) : (
        <div className="px-12">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {trilhasFiltradas.map((trilha) => (
                <CarouselItem
                  key={trilha.id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="space-y-2">
                    <TrilhaCard
                      id={trilha.id}
                      titulo={trilha.titulo}
                      imagem_url={trilha.imagem_url || undefined}
                      visivel_apenas_pro={trilha.visivel_apenas_pro}
                    />
                    <div className="px-1 space-y-0.5">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {trilha.titulo}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="bg-muted px-2 py-0.5 rounded-full">
                          Trilha {trilha.ordem + 1}
                        </span>
                        {trilha.classificacao && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {trilha.classificacao}
                          </span>
                        )}
                        <span>{trilha.total_videos} vídeos</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}
