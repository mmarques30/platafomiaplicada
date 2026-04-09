import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TipoDocumento = 'proposta' | 'transcricao' | 'anexo' | 'solucao' | 'logo' | 'imagem' | 'outro';

export interface DocumentoBusiness {
  id: string;
  contrato_id: string;
  titulo: string;
  tipo: TipoDocumento;
  arquivo_url?: string;
  conteudo_texto?: string;
  processado: boolean;
  resultado_ia?: any;
  created_at: string;
  para_processamento_ia: boolean;
}

export interface DocumentoInput {
  contrato_id: string;
  titulo: string;
  tipo: 'proposta' | 'transcricao' | 'anexo' | 'solucao' | 'outro';
  arquivo_url?: string;
  conteudo_texto?: string;
  para_processamento_ia?: boolean;
}

export function useDocumentosBusiness(contratoId?: string, paraProcessamentoIA?: boolean) {
  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos-business", contratoId, paraProcessamentoIA],
    queryFn: async () => {
      if (!contratoId) return [];
      
      let query = supabase
        .from("documentos_business")
        .select("*")
        .eq("contrato_id", contratoId);
      
      // Filtrar por propósito se especificado
      if (paraProcessamentoIA !== undefined) {
        query = query.eq("para_processamento_ia", paraProcessamentoIA);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as DocumentoBusiness[];
    },
    enabled: !!contratoId,
  });

  const createDocumento = useMutation({
    mutationFn: async (input: DocumentoInput) => {
      const { data, error } = await supabase
        .from("documentos_business")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos-business", contratoId] });
      toast.success("Documento adicionado");
    },
    onError: (error) => {
      console.error("Erro ao adicionar documento:", error);
      toast.error("Erro ao adicionar documento");
    },
  });

  const updateDocumento = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocumentoInput> & { id: string; processado?: boolean; resultado_ia?: any }) => {
      const { data, error } = await supabase
        .from("documentos_business")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos-business", contratoId] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar documento:", error);
      toast.error("Erro ao atualizar documento");
    },
  });

  const deleteDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("documentos_business")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos-business", contratoId] });
      toast.success("Documento removido");
    },
    onError: (error) => {
      console.error("Erro ao remover documento:", error);
      toast.error("Erro ao remover documento");
    },
  });

  const uploadDocumento = async (file: File, contratoId: string, tipo: DocumentoInput['tipo']) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contratoId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Usar o bucket correto para documentos business
    const { error: uploadError } = await supabase.storage
      .from("contratos-business")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Erro ao fazer upload do arquivo");
      throw uploadError;
    }

    // Retornar o path relativo (não a URL pública) para uso com signed URLs
    return fileName;
  };

  return {
    documentos,
    isLoading,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    uploadDocumento,
  };
}
