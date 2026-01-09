import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export type MaterialGratuito = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url: string;
  tipo: string | null;
  imagem_url: string | null;
  ordem: number | null;
  arquivos_url: Json | null;
  links_url: Json | null;
  created_at: string | null;
};

export function useMateriaisGratuitos(limit?: number) {
  return useQuery({
    queryKey: ['materiais-gratuitos-home', limit],
    queryFn: async () => {
      let query = supabase
        .from('materiais_gratuitos')
        .select('*')
        .eq('ativo', true)
        .eq('visivel_gratuitos', true)
        .order('ordem', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as MaterialGratuito[];
    },
  });
}
