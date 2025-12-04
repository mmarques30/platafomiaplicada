import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";

export interface DocumentoLegal {
  id: string;
  slug: string;
  titulo: string;
  conteudo_mentorados: string;
  conteudo_visitantes: string | null;
  apenas_mentorados: boolean;
  ultima_atualizacao: string;
  created_at: string;
  updated_at: string;
}

export function useDocumentoLegal(slug: string) {
  const { isVisitante, isLoading: isLoadingRole } = useUserRole();

  return useQuery({
    queryKey: ["documento-legal", slug, isVisitante],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos_legais")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      // Se visitante tentar acessar documento apenas para mentorados
      if (isVisitante && data.apenas_mentorados) {
        return null;
      }

      return {
        ...data,
        conteudo: isVisitante ? data.conteudo_visitantes : data.conteudo_mentorados,
        tituloExibicao: isVisitante && slug === "termos-uso" 
          ? "Política de Uso – Acesso Gratuito – IAPLICADA" 
          : data.titulo
      } as DocumentoLegal & { conteudo: string; tituloExibicao: string };
    },
    enabled: !isLoadingRole,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDocumentosLegais() {
  return useQuery({
    queryKey: ["documentos-legais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos_legais")
        .select("*")
        .order("created_at");

      if (error) throw error;
      return data as DocumentoLegal[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAtualizarDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      conteudo_mentorados,
      conteudo_visitantes,
      apenas_mentorados,
    }: {
      id: string;
      conteudo_mentorados: string;
      conteudo_visitantes?: string | null;
      apenas_mentorados: boolean;
    }) => {
      const { data, error } = await supabase
        .from("documentos_legais")
        .update({
          conteudo_mentorados,
          conteudo_visitantes,
          apenas_mentorados,
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos-legais"] });
      queryClient.invalidateQueries({ queryKey: ["documento-legal"] });
    },
  });
}
