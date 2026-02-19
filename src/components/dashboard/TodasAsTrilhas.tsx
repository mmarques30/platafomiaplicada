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
import { SlidersHorizontal } from "lucide-react";

interface TrilhaComContagem {
  id: string;
  titulo: string;
  imagem_url: string | null;
  categoria: string | null;
  ordem: number;
  visivel_apenas_pro: boolean;
  created_at: string;
  total_videos: number;
}

export function TodasAsTrilhas() {
  const [ordenar, setOrdenar] = useState("ordem");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");

  const { data: trilhas, isLoading } = useQuery({
    queryKey: ["todas-trilhas-com-contagem"],
    queryFn: async () => {
      // Fetch trilhas
      const { data: trilhasData, error: tError } = await supabase
        .from("trilhas")
        .select("id, titulo, imagem_url, categoria, ordem, visivel_apenas_pro, created_at")
        .eq("visivel_mentorados", true)
        .order("ordem");

      if (tError) throw tError;

      // Fetch video counts per trilha
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

  // Extract unique categories
  const categorias = useMemo(() => {
    if (!trilhas) return [];
    const cats = [...new Set(trilhas.map((t) => t.categoria).filter(Boolean))] as string[];
    return cats.sort();
  }, [trilhas]);

  // Filter and sort
  const trilhasFiltradas = useMemo(() => {
    if (!trilhas) return [];
    let result = [...trilhas];

    if (categoriaFiltro !== "todas") {
      result = result.filter((t) => t.categoria === categoriaFiltro);
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
  }, [trilhas, categoriaFiltro, ordenar]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[320px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          Todas as Trilhas
        </h2>

        <div className="flex flex-wrap gap-3">
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

          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {trilhasFiltradas.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma trilha encontrada com os filtros selecionados.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trilhasFiltradas.map((trilha) => (
            <div key={trilha.id} className="space-y-2">
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded-full">
                    Trilha {trilha.ordem + 1}
                  </span>
                  {trilha.categoria && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                      {trilha.categoria}
                    </span>
                  )}
                  <span>{trilha.total_videos} vídeos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
