import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TipoConteudo = 'artigo' | 'documento' | 'dica' | 'noticia' | 'newsletter' | 'material';

export interface ConteudoDashboard {
  id: string;
  tipo: TipoConteudo;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  arquivo_pdf_url?: string | null;
  galeria_imagens?: string[] | null;
  estilo_texto?: {
    fontSize?: number;
    lineHeight?: number;
    fontWeight?: string;
    textAlign?: string;
  } | null;
  link_externo: string | null;
  imagem_url: string | null;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export function useConteudosDashboard(tipo?: TipoConteudo) {
  return useQuery({
    queryKey: ['conteudos-dashboard', tipo],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('conteudos_dashboard')
        .select('*')
        .eq('ativo', true)
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ConteudoDashboard[];
    },
  });
}

/**
 * Curadoria completa, numa consulta só. Traz todos os tipos de conteúdo
 * (o tipo `criador` tem listagem própria) para as abas agruparem no cliente.
 */
export function useConteudosCurados(limite = 60) {
  return useQuery({
    queryKey: ['conteudos-dashboard', 'curados', limite],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudos_dashboard')
        .select('*')
        .eq('ativo', true)
        .neq('tipo', 'criador')
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data as ConteudoDashboard[];
    },
  });
}
