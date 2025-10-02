import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeBaseDocument } from "@/types/knowledge-base";

export const useKnowledgeBase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documentos, isLoading } = useQuery<KnowledgeBaseDocument[]>({
    queryKey: ["knowledge-base"],
    queryFn: async () => {
      // @ts-ignore - knowledge_base table will be available after migration
      const { data, error } = await supabase
        // @ts-ignore
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // @ts-ignore
      return data as KnowledgeBaseDocument[];
    },
  });

  const uploadDocumento = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data, error } = await supabase.functions.invoke('processar-documento', {
        body: formData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast({
        title: "Documento enviado com sucesso",
        description: "O documento foi processado e adicionado à base de conhecimento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar documento",
        description: error.message || "Ocorreu um erro ao processar o documento.",
        variant: "destructive",
      });
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      // @ts-ignore - knowledge_base table will be available after migration
      const { error } = await supabase
        // @ts-ignore
        .from("knowledge_base")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast({
        title: "Status atualizado",
        description: "O status do documento foi alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletarDocumento = useMutation({
    mutationFn: async (id: string) => {
      // Buscar arquivo_url antes de deletar
      // @ts-ignore - knowledge_base table will be available after migration
      const { data: doc } = await supabase
        // @ts-ignore
        .from("knowledge_base")
        .select("arquivo_url")
        .eq("id", id)
        .single();

      if (doc && 'arquivo_url' in doc) {
        // Deletar arquivo do storage
        await supabase.storage
          .from("knowledge-documents")
          .remove([doc.arquivo_url as string]);
      }

      // Deletar registro do banco
      // @ts-ignore - knowledge_base table will be available after migration
      const { error } = await supabase
        // @ts-ignore
        .from("knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast({
        title: "Documento deletado",
        description: "O documento foi removido da base de conhecimento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    documentos,
    isLoading,
    uploadDocumento,
    toggleAtivo,
    deletarDocumento,
  };
};
