import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateConteudo, type TipoConteudo } from "./useConteudosDashboardAdmin";
import { toast } from "sonner";

export interface CuradoriaItem {
  id: string;
  tipo: TipoConteudo;
  titulo: string;
  resumo: string;
  conteudo: string;
  link_externo: string | null;
  tags: string[];
  autor: string;
  status: "pendente" | "aprovado" | "descartado";
}

export function useCuradoriaIA() {
  const [items, setItems] = useState<CuradoriaItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const createConteudo = useCreateConteudo();

  const generateCuradoria = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-curadoria-semanal", {
        body: { tipos: ["noticia", "dica", "newsletter"] },
      });

      if (error) throw error;
      if (data.errors?.length) {
        console.warn("Curadoria partial errors:", data.errors);
        toast.warning("Alguns tipos tiveram erro ao gerar. Resultados parciais abaixo.");
      }

      const allItems: CuradoriaItem[] = [];
      const tipoMap: Record<string, TipoConteudo> = {
        noticia: "noticia",
        dica: "dica",
        newsletter: "newsletter",
      };

      for (const [tipo, rawItems] of Object.entries(data.curadoria || {})) {
        for (const item of rawItems as any[]) {
          allItems.push({
            id: crypto.randomUUID(),
            tipo: tipoMap[tipo] || "noticia",
            titulo: item.titulo,
            resumo: item.resumo,
            conteudo: item.conteudo,
            link_externo: item.link_externo || null,
            tags: item.tags || [],
            autor: item.autor || "",
            status: "pendente",
          });
        }
      }

      setItems(allItems);
      toast.success(`${allItems.length} itens gerados pela curadoria IA`);
    } catch (err) {
      console.error("Erro ao gerar curadoria:", err);
      toast.error("Erro ao gerar curadoria semanal");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const approveItem = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      await createConteudo.mutateAsync({
        tipo: item.tipo,
        titulo: item.titulo,
        resumo: item.resumo,
        conteudo: item.conteudo,
        link_externo: item.link_externo || undefined,
        tags: item.tags,
        autor: item.autor,
        ativo: true,
        destaque: false,
        visivel_gratuitos: false,
      });

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "aprovado" as const } : i))
      );
    } catch {
      toast.error("Erro ao aprovar item");
    }
  }, [items, createConteudo]);

  const discardItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "descartado" as const } : i))
    );
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Pick<CuradoriaItem, "titulo" | "resumo" | "conteudo" | "tags">>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }, []);

  return {
    items,
    isGenerating,
    generateCuradoria,
    approveItem,
    discardItem,
    updateItem,
  };
}
