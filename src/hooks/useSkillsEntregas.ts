import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSkillsMembro } from "./useSkillsMembro";
import { toast } from "sonner";

export function useSkillsEntregas() {
  const { user } = useAuth();
  const { equipeId, isLider } = useSkillsMembro();
  const queryClient = useQueryClient();

  // Buscar entregas - líder vê todas, membro vê apenas as suas
  const { data: entregas, isLoading } = useQuery({
    queryKey: ["entregas-skills", user?.id, equipeId, isLider],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("entregas_skills")
        .select(`
          *,
          responsavel:responsavel_id (id, nome, avatar_url)
        `)
        .order("prazo", { ascending: true, nullsFirst: false });

      if (isLider && equipeId) {
        // Líder vê todas as entregas da equipe
        query = query.eq("equipe_id", equipeId);
      } else {
        // Membro vê apenas as próprias entregas
        query = query.eq("responsavel_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Mutation para submeter entrega para validação
  const submeterEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: "aguardando_validacao" })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega enviada para validação!");
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
    },
    onError: () => {
      toast.error("Erro ao enviar entrega");
    },
  });

  // Mutation para iniciar entrega
  const iniciarEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: "em_andamento" })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega iniciada!");
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
    },
    onError: () => {
      toast.error("Erro ao iniciar entrega");
    },
  });

  return {
    entregas,
    isLoading,
    isLider,
    submeterEntrega,
    iniciarEntrega,
  };
}
