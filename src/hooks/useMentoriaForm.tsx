import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { FormData } from "@/components/mentoria/schema";

export const useMentoriaForm = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verificar se já existe formulário
  const { data: formulario, isLoading } = useQuery({
    queryKey: ["formulario-diagnostico", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos - evita refetch desnecessário
    gcTime: 10 * 60 * 1000, // 10 minutos - mantém em cache
  });

  // Salvar/Atualizar formulário usando upsert para evitar erro de chave duplicada
  const salvarMutation = useMutation({
    mutationFn: async (dados: Partial<FormData>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: user.id,
        ...dados,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Não invalida queries no rascunho para evitar re-render que fecha o Select
  });

  // Finalizar formulário (marcar como completado) usando upsert
  const finalizarMutation = useMutation({
    mutationFn: async (dados: FormData) => {
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: user.id,
        ...dados,
        completado: true,
        updated_at: new Date().toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ["formulario-diagnostico"] });
      queryClient.invalidateQueries({ queryKey: ["admin-formularios"] });
      toast({
        title: "Formulário enviado com sucesso!",
        description: "Obrigado por compartilhar suas informações.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar formulário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    formulario,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["formulario-diagnostico"] }),
    salvarRascunho: salvarMutation.mutate,
    finalizarFormulario: finalizarMutation.mutateAsync,
    isSaving: salvarMutation.isPending || finalizarMutation.isPending,
  };
};
