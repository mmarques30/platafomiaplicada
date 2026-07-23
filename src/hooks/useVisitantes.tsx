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

  const updateVisitante = useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: {
        nome_completo?: string;
        email?: string;
        telefone?: string | null;
        conta_ativa?: boolean;
      };
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast.success("Visitante atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar visitante");
    },
  });

  const createVisitante = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      nome_completo: string;
      telefone?: string;
    }) => {
      const { data: result, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: data.email,
          password: data.password,
          nome_completo: data.nome_completo,
          telefone: data.telefone,
          is_visitante: true
        }
      });
      
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast.success("Visitante cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cadastrar visitante");
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

      // Atualizar flag is_visitante e registrar data de conversão
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          is_visitante: false,
          data_conversao: new Date().toISOString()
        })
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
      const { data, error } = await supabase.rpc("admin_delete_user", {
        p_user_id: userId,
      });

      if (error) throw new Error(error.message);
      if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
        throw new Error(String((data as { error?: string }).error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast.success("Visitante excluído permanentemente!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir visitante");
    },
  });

  return {
    visitantes: visitantes || [],
    isLoading,
    updateVisitante,
    createVisitante,
    convertToMentorado,
    deleteVisitante,
  };
}
