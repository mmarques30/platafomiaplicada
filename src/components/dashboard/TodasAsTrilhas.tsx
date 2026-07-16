import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCard } from "@/components/shared/TrilhaCard";
import { ClassificacaoIcons } from "@/components/dashboard/ClassificacaoIcons";
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
  ferramentas: string[] | null;
  ordem: number;
  visivel_apenas_pro: boolean;
  created_at: string;
  total_videos: number;
}

const TRILHAS_BASE_SELECT =
  "id, titulo, imagem_url, categoria, classificacao, ordem, visivel_apenas_pro, created_at";

function isMissingFerramentasColumn(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42703" ||
    (error?.message?.includes("ferramentas") && error?.message?.includes("does not exist")) ||
    false
  );
}

export function TodasAsTrilhas() {
  const [ordenar, setOrdenar] = useState("ordem");
  const [classificacaoFiltro, setClassificacaoFiltro] = useState("todas");
  const [ferramentaFiltro, setFerramentaFiltro] = useState("todas");

  const { data: trilhas, isLoading, isError } = useQuery({
    queryKey: ["todas-trilhas-com-contagem"],
    queryFn: async () => {
      let trilhasData: Array<Record<string, unknown>> | null = null;

      const fullQuery = await supabase
        .from("trilhas")
        .select(`${TRILHAS_BASE_SELECT}, ferramentas`)
        .eq("visivel_mentorados", true)
        .order("ordem");

      if (fullQuery.error && isMissingFerramentasColumn(fullQuery.error)) {
        const fallbackQuery = await supabase
          .from("trilhas")
          .select(TRILHAS_BASE_SELECT)
          .eq("visivel_mentorados", true)
          .order("ordem");

        if (fallbackQuery.error) throw fallbackQuery.error;
        trilhasData = fallbackQuery.data;
      } else {
        if (fullQuery.error) throw fullQuery.error;
        trilhasData = fullQuery.data;
      }

      const { data: videosCounts, error: vError } = await supabase
        .from("videos")
        .select("trilha_id")
        .eq("ativo", true)
        .in("trilha_id", (trilhasData || []).map((t) => t.id as string));

      if (vError) throw vError;

      const countMap: Record<string, number> = {};
      (videosCounts || []).forEach((v) => {
        if (v.trilha_id) {
          countMap[v.trilha_id] = (countMap[v.trilha_id] || 0) + 1;
        }
      });

      return (trilhasData || []).map((t) => ({
        ...t,
        ferramentas: Array.isArray(t.ferramentas) ? (t.ferramentas as string[]) : [],
        total_videos: countMap[t.id as string] || 0,
      })) as TrilhaComContagem[];
    },
  });

  // Extract unique classificacoes
  const classificacoes = useMemo(() => {
    if (!trilhas) return [];
    const cls = [...new Set(trilhas.map((t) => t.classificacao).filter(Boolean))] as string[];
    return cls.sort();
  }, [trilhas]);

  // Extract unique ferramentas/modelos
  const ferramentas = useMemo(() => {
    if (!trilhas) return [];
    const set = new Set<string>();
    trilhas.forEach((t) => (Array.isArray(t.ferramentas) ? t.ferramentas : []).forEach((f) => f && set.add(f)));
    return Array.from(set).sort();
  }, [trilhas]);

  // Filter and sort
  const trilhasFiltradas = useMemo(() => {
    if (!trilhas) return [];
    let result = [...trilhas];

    if (classificacaoFiltro !== "todas") {
      result = result.filter((t) => t.classificacao === classificacaoFiltro);
    }

    if (ferramentaFiltro !== "todas") {
      result = result.filter((t) => Array.isArray(t.ferramentas) && t.ferramentas.includes(ferramentaFiltro));
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
  }, [trilhas, classificacaoFiltro, ferramentaFiltro, ordenar]);

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

  if (isError) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Não foi possível carregar as trilhas. Tente atualizar a página.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={ordenar} onValueChange={setOrdenar}>
          <SelectTrigger className="h-9 w-auto min-w-[150px] rounded-full border-primary/20 bg-primary/5 text-xs text-primary/80 hover:bg-primary/10 hover:border-primary/30 transition-colors">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="border-primary/20 bg-background [&_[role=option]]:text-xs [&_[role=option]]:focus:bg-primary/10 [&_[role=option]]:focus:text-primary">
            <SelectItem value="ordem">Ordem padrão</SelectItem>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="antigos">Mais antigos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={classificacaoFiltro} onValueChange={setClassificacaoFiltro}>
          <SelectTrigger className="h-9 w-auto min-w-[170px] rounded-full border-primary/20 bg-primary/5 text-xs text-primary/80 hover:bg-primary/10 hover:border-primary/30 transition-colors">
            <SelectValue placeholder="Classificação" />
          </SelectTrigger>
          <SelectContent className="border-primary/20 bg-background [&_[role=option]]:text-xs [&_[role=option]]:focus:bg-primary/10 [&_[role=option]]:focus:text-primary">
            <SelectItem value="todas">Todas as classificações</SelectItem>
            {classificacoes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {ferramentas.length > 0 && (
          <Select value={ferramentaFiltro} onValueChange={setFerramentaFiltro}>
            <SelectTrigger className="h-9 w-auto min-w-[170px] rounded-full border-primary/20 bg-primary/5 text-xs text-primary/80 hover:bg-primary/10 hover:border-primary/30 transition-colors">
              <SelectValue placeholder="Ferramenta" />
            </SelectTrigger>
            <SelectContent className="border-primary/20 bg-background [&_[role=option]]:text-xs [&_[role=option]]:focus:bg-primary/10 [&_[role=option]]:focus:text-primary">
              <SelectItem value="todas">Todas as ferramentas</SelectItem>
              {ferramentas.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Carousel */}
      {trilhasFiltradas.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma trilha encontrada com os filtros selecionados.
        </p>
      ) : (
        <div className="px-2 md:px-12">
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
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 2xl:basis-1/5"
                >
                  <div className="flex flex-col gap-2 h-full">
                    <TrilhaCard
                      id={trilha.id}
                      titulo={trilha.titulo}
                      imagem_url={trilha.imagem_url || undefined}
                      visivel_apenas_pro={trilha.visivel_apenas_pro}
                    />
                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-1 flex-1 flex flex-col justify-between">
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
                      {Array.isArray(trilha.ferramentas) && trilha.ferramentas.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[10px] text-muted-foreground">Funciona em:</span>
                          {trilha.ferramentas.map((f) => (
                            <span
                              key={f}
                              className="bg-brand-strong/10 text-brand-strong px-2 py-0.5 rounded-full text-[10px] font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
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

      {/* Ícones animados de classificação */}
      {classificacoes.length > 0 && (
        <ClassificacaoIcons
          classificacoes={classificacoes}
          activeFilter={classificacaoFiltro}
          onSelect={setClassificacaoFiltro}
        />
      )}
    </div>
  );
}
