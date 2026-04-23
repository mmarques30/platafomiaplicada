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
  tipo: TipoDocumento;
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
      // Buscar o documento para pegar o arquivo_url antes de deletar
      const { data: doc } = await supabase
        .from("documentos_business")
        .select("arquivo_url")
        .eq("id", id)
        .single();

      // Remover arquivo do storage se existir
      if (doc?.arquivo_url) {
        await supabase.storage
          .from("contratos-business")
          .remove([doc.arquivo_url]);
      }

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
    const MAX = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX) {
      throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo permitido: 25MB.`);
    }

    const fileName = `${contratoId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from("contratos-business")
      .upload(fileName, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload storage error:', uploadError);
      throw new Error(uploadError.message || 'Falha ao enviar arquivo para o storage');
    }

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
