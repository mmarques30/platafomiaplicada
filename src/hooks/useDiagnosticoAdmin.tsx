import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { extractEdgeFunctionError } from "@/lib/edge-functions";

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
      // Verificar se já existe registro para preservar campos de feedback
      const { data: existente } = await supabase
        .from("formulario_diagnostico")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const diagnosticoData: any = {
        preenchido_por: 'admin',
        completado: true,
        ...(dados || {}),
        ...(arquivoUrl && { arquivo_diagnostico_url: arquivoUrl }),
        ...(observacoes && { observacoes_admin: observacoes }),
      };

      let data, error;

      if (existente) {
        // UPDATE apenas os campos do diagnóstico, preservando feedback
        const result = await supabase
          .from("formulario_diagnostico")
          .update(diagnosticoData)
          .eq("user_id", userId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // INSERT novo registro
        const result = await supabase
          .from("formulario_diagnostico")
          .insert({
            user_id: userId,
            ...diagnosticoData,
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

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

  const deletarDiagnostico = useMutation({
    mutationFn: async (diagnosticoId: string) => {
      // Primeiro deletar objetivos associados (FK)
      const { error: objetivosError } = await supabase
        .from("objetivos_mentoria")
        .delete()
        .eq("formulario_id", diagnosticoId);

      if (objetivosError) throw objetivosError;

      // Deletar o diagnóstico
      const { error } = await supabase
        .from("formulario_diagnostico")
        .delete()
        .eq("id", diagnosticoId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Diagnóstico excluído",
        description: "O diagnóstico foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-formularios"] });
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Força finalização do diagnóstico mesmo com dados parciais (atende ao
  // pedido de destravar manualmente alunos presos no formulário). Marca
  // completado=true e dispara a Edge Function de geração do insight pra
  // que o aluno receba o resultado imediatamente.
  const forcarFinalizacao = useMutation({
    mutationFn: async (userId: string) => {
      // 1. Marca como completado
      const { data: updated, error: updateError } = await supabase
        .from("formulario_diagnostico")
        .update({
          completado: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!updated) throw new Error("Diagnóstico do mentorado não encontrado.");

      // 2. Dispara o insight. Antes engolíamos qualquer erro em silêncio
      // (catch console.warn) — Mari forçava finalização, a Ariane via
      // empty state e ninguém sabia que a função tinha falhado. Agora
      // capturamos o erro do invoke (que vem em `error`, não em throw)
      // e o propagamos pra UI.
      const { error: invokeError } = await supabase.functions.invoke(
        "gerar-insight-mentoria",
        { body: { formulario_id: updated.id } }
      );

      if (invokeError) {
        const msg = await extractEdgeFunctionError(invokeError);
        throw new Error(`Diagnóstico marcado como completo, mas falha ao gerar o insight: ${msg}`);
      }
      return updated;
    },
    onSuccess: () => {
      toast({
        title: "Diagnóstico finalizado",
        description:
          "Mentorado destravado. O insight será gerado em alguns segundos e ficará disponível no painel.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-formularios"] });
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao forçar finalização",
        description: error.message ?? "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  // Regenerar insight sem mexer no `completado`. Cobre o caso de quando
  // a Edge Function falhou silenciosamente na primeira tentativa e o
  // aluno fica com `completado=true` + `insight_ia=null` → empty state.
  const regenerarInsight = useMutation({
    mutationFn: async (formularioId: string) => {
      const { error: invokeError } = await supabase.functions.invoke(
        "gerar-insight-mentoria",
        { body: { formulario_id: formularioId } }
      );
      if (invokeError) {
        const msg = await extractEdgeFunctionError(invokeError);
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      toast({
        title: "Insight regenerado",
        description: "O painel do aluno foi atualizado com o novo insight.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-formularios"] });
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao regenerar insight",
        description: error.message ?? "Verifique o log da função no Supabase.",
        variant: "destructive",
      });
    },
  });

  return {
    diagnostico,
    isLoading,
    uploadArquivo: uploadArquivo.mutate,
    salvarDiagnostico: salvarDiagnostico.mutate,
    deletarArquivo: deletarArquivo.mutate,
    deletarDiagnostico: deletarDiagnostico.mutate,
    forcarFinalizacao: forcarFinalizacao.mutate,
    isForcingFinalize: forcarFinalizacao.isPending,
    regenerarInsight: regenerarInsight.mutate,
    isRegeneratingInsight: regenerarInsight.isPending,
    isUploading: uploadArquivo.isPending,
    isSaving: salvarDiagnostico.isPending,
    isDeleting: deletarDiagnostico.isPending,
  };
}
