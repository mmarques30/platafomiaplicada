import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFerramentaRating = (ferramentaId: string | undefined) => {
  const queryClient = useQueryClient();

  // Verificar se usuário é admin
  const { data: isAdmin } = useQuery({
    queryKey: ["user-is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      return !!data;
    },
  });

  // Buscar avaliação do usuário atual (para mentorados)
  const { data: userRating, isLoading: isLoadingUserRating } = useQuery({
    queryKey: ["ferramenta-rating", ferramentaId],
    queryFn: async () => {
      if (!ferramentaId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("avaliacoes_ferramentas_ia")
        .select("*")
        .eq("ferramenta_id", ferramentaId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!ferramentaId,
  });

  // Buscar estatísticas da ferramenta (incluindo avaliação do mentor)
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["ferramenta-stats", ferramentaId],
    queryFn: async () => {
      if (!ferramentaId) return null;

      const { data, error } = await supabase
        .from("ferramentas_ia")
        .select("avaliacao, avaliacao_comunidade, total_avaliacoes_comunidade")
        .eq("id", ferramentaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!ferramentaId,
  });

  // Mutation para ADMIN: atualizar avaliacao diretamente na ferramentas_ia (peso 60%)
  const rateAsAdminMutation = useMutation({
    mutationFn: async (nota: number) => {
      if (!ferramentaId) throw new Error("Ferramenta ID é obrigatório");

      const { error } = await supabase
        .from("ferramentas_ia")
        .update({ 
          avaliacao: nota,
          updated_at: new Date().toISOString() 
        })
        .eq("id", ferramentaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramenta-stats", ferramentaId] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas-ia"] });
      toast.success("Avaliação do mentor salva com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao avaliar como admin:", error);
      toast.error("Erro ao salvar avaliação do mentor");
    },
  });

  // Mutation para MENTORADO: criar/atualizar em avaliacoes_ferramentas_ia (peso 40%)
  const rateAsMentoradoMutation = useMutation({
    mutationFn: async (nota: number) => {
      if (!ferramentaId) throw new Error("Ferramenta ID é obrigatório");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar se já existe avaliação
      const { data: existing } = await supabase
        .from("avaliacoes_ferramentas_ia")
        .select("id")
        .eq("ferramenta_id", ferramentaId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Atualizar
        const { error } = await supabase
          .from("avaliacoes_ferramentas_ia")
          .update({ nota, updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from("avaliacoes_ferramentas_ia")
          .insert({
            ferramenta_id: ferramentaId,
            user_id: user.id,
            nota,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramenta-rating", ferramentaId] });
      queryClient.invalidateQueries({ queryKey: ["ferramenta-stats", ferramentaId] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas-ia"] });
      toast.success("Avaliação da comunidade salva com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao avaliar:", error);
      if (error.message?.includes("policy")) {
        toast.error("Apenas membros com plano ativo podem avaliar ferramentas");
      } else {
        toast.error("Erro ao salvar avaliação");
      }
    },
  });

  // Função rate que escolhe a mutation correta baseada no role
  const rate = (nota: number) => {
    if (isAdmin) {
      rateAsAdminMutation.mutate(nota);
    } else {
      rateAsMentoradoMutation.mutate(nota);
    }
  };

  return {
    userRating,
    stats,
    isAdmin,
    isLoading: isLoadingUserRating || isLoadingStats,
    rate,
    isRating: rateAsAdminMutation.isPending || rateAsMentoradoMutation.isPending,
  };
};
