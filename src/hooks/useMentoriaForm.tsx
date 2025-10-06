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
  });

  // Salvar/Atualizar formulário
  const salvarMutation = useMutation({
    mutationFn: async (dados: Partial<FormData>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: user.id,
        ...dados,
        updated_at: new Date().toISOString(),
      };

      if (formulario) {
        // Update
        const { data, error } = await supabase
          .from("formulario_diagnostico")
          .update(payload)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("formulario_diagnostico")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulario-diagnostico"] });
    },
  });

  // Finalizar formulário (marcar como completado)
  const finalizarMutation = useMutation({
    mutationFn: async (dados: FormData) => {
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: user.id,
        ...dados,
        completado: true,
        updated_at: new Date().toISOString(),
      };

      if (formulario) {
        const { data, error } = await supabase
          .from("formulario_diagnostico")
          .update(payload)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("formulario_diagnostico")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulario-diagnostico"] });
      queryClient.invalidateQueries({ queryKey: ["admin-formularios"] });
      toast({
        title: "Formulário enviado com sucesso! 🎉",
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
