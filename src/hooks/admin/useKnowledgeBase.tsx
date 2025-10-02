import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useKnowledgeBase = () => {
  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["knowledge-base"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const uploadDocumento = useMutation({
    mutationFn: async ({ file, titulo, categoria }: { file: File; titulo: string; categoria: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/processar-documento`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast({
        title: "Documento enviado! 📄",
        description: "O documento foi processado e está disponível para a MarIAna.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("knowledge_base")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast({
        title: "Status atualizado",
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

  const deleteDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast({
        title: "Documento deletado",
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
    uploadDocumento: uploadDocumento.mutate,
    isUploading: uploadDocumento.isPending,
    toggleAtivo: toggleAtivo.mutate,
    deleteDocumento: deleteDocumento.mutate,
  };
};
