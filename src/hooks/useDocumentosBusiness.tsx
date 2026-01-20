import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DocumentoBusiness {
  id: string;
  contrato_id: string;
  titulo: string;
  tipo: 'proposta' | 'transcricao' | 'anexo' | 'solucao' | 'outro';
  arquivo_url?: string;
  conteudo_texto?: string;
  processado: boolean;
  resultado_ia?: any;
  created_at: string;
}

export interface DocumentoInput {
  contrato_id: string;
  titulo: string;
  tipo: 'proposta' | 'transcricao' | 'anexo' | 'solucao' | 'outro';
  arquivo_url?: string;
  conteudo_texto?: string;
}

export function useDocumentosBusiness(contratoId?: string) {
  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos-business", contratoId],
    queryFn: async () => {
      if (!contratoId) return [];
      
      const { data, error } = await supabase
        .from("documentos_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("created_at", { ascending: false });

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
    const fileName = `${contratoId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("diagnosticos-mentoria")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Erro ao fazer upload do arquivo");
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("diagnosticos-mentoria")
      .getPublicUrl(fileName);

    return publicUrl;
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
