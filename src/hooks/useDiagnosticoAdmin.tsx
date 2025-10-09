import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDiagnosticoAdmin(userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: diagnostico, isLoading } = useQuery({
    queryKey: ["diagnostico-admin", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const uploadArquivo = useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/diagnostico.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('diagnosticos-mentoria')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('diagnosticos-mentoria')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin", userId] });
    },
  });

  const salvarDiagnostico = useMutation({
    mutationFn: async ({ 
      dados, 
      userId, 
      arquivoUrl,
      observacoes 
    }: { 
      dados?: any; 
      userId: string; 
      arquivoUrl?: string;
      observacoes?: string;
    }) => {
      const payload: any = {
        user_id: userId,
        preenchido_por: 'admin',
        completado: true,
        ...(dados || {}),
        ...(arquivoUrl && { arquivo_diagnostico_url: arquivoUrl }),
        ...(observacoes && { observacoes_admin: observacoes }),
      };

      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Diagnóstico salvo",
        description: "O diagnóstico foi salvo com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-formularios"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletarArquivo = useMutation({
    mutationFn: async (userId: string) => {
      const { data: files } = await supabase.storage
        .from('diagnosticos-mentoria')
        .list(userId);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/${file.name}`);
        const { error } = await supabase.storage
          .from('diagnosticos-mentoria')
          .remove(filePaths);

        if (error) throw error;
      }

      const { error: updateError } = await supabase
        .from("formulario_diagnostico")
        .update({ arquivo_diagnostico_url: null })
        .eq("user_id", userId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin", userId] });
    },
  });

  return {
    diagnostico,
    isLoading,
    uploadArquivo: uploadArquivo.mutate,
    salvarDiagnostico: salvarDiagnostico.mutate,
    deletarArquivo: deletarArquivo.mutate,
    isUploading: uploadArquivo.isPending,
    isSaving: salvarDiagnostico.isPending,
  };
}
