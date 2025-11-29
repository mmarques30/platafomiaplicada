import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useVisitantes() {
  const queryClient = useQueryClient();

  const { data: visitantes, isLoading } = useQuery({
    queryKey: ["visitantes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_visitante", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const convertToMentorado = useMutation({
    mutationFn: async (userId: string) => {
      // Remover role visitante
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "visitante");

      if (deleteError) throw deleteError;

      // Adicionar role mentorado
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "mentorado" });

      if (insertError) throw insertError;

      // Atualizar flag is_visitante
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_visitante: false })
        .eq("id", userId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast.success("Visitante convertido em mentorado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao converter visitante");
    },
  });

  const deleteVisitante = useMutation({
    mutationFn: async (userId: string) => {
      // Supabase admin API deve ser usado aqui via edge function
      // Por enquanto, apenas desativar a conta
      const { error } = await supabase
        .from("profiles")
        .update({ conta_ativa: false })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast.success("Visitante desativado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao desativar visitante");
    },
  });

  return {
    visitantes: visitantes || [],
    isLoading,
    convertToMentorado,
    deleteVisitante,
  };
}
