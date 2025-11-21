import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type FaseProcesso = {
  id: string;
  user_id: string;
  fase_numero: number;
  nome_fase: string;
  descricao?: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada';
  data_inicio?: string;
  data_conclusao?: string;
  projeto_associado_id?: string;
  sessao_associada_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Dados enriquecidos
  projeto?: any;
  sessao?: any;
  tarefas?: any[];
  progresso_tarefas?: number;
};

export const useFasesProcesso = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: fases, isLoading } = useQuery({
    queryKey: ["fases-processo", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      // Primeiro, tentar buscar fases existentes
      const { data: existingFases, error: fetchError } = await supabase
        .from("fases_processo_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("fase_numero", { ascending: true });

      if (fetchError) throw fetchError;

      // Se não houver fases, inicializar
      if (!existingFases || existingFases.length === 0) {
        const { error: initError } = await supabase.rpc("inicializar_fases_processo", {
          p_user_id: targetUserId,
        });

        if (initError) {
          console.error("Erro ao inicializar fases:", initError);
          throw initError;
        }

        // Buscar novamente após inicialização
        const { data: newFases, error: refetchError } = await supabase
          .from("fases_processo_mentoria")
          .select("*")
          .eq("user_id", targetUserId)
          .order("fase_numero", { ascending: true });

        if (refetchError) throw refetchError;
        return await enrichFasesData(newFases || [], targetUserId);
      }

      return await enrichFasesData(existingFases, targetUserId);
    },
    enabled: !!targetUserId,
  });

  // Enriquecer dados das fases com projetos, sessões e tarefas
  const enrichFasesData = async (fases: any[], userId: string) => {
    const enrichedFases = await Promise.all(
      fases.map(async (fase) => {
        let projeto = null;
        let sessao = null;
        let tarefas: any[] = [];
        let progresso_tarefas = 0;

        // Buscar projeto associado
        if (fase.projeto_associado_id) {
          const { data: projetoData } = await supabase
            .from("projetos_mentoria")
            .select("*")
            .eq("id", fase.projeto_associado_id)
            .single();
          projeto = projetoData;

          // Buscar tarefas do projeto
          const { data: tarefasData } = await supabase
            .from("tarefas_mentoria")
            .select("*")
            .eq("projeto_id", fase.projeto_associado_id);

          tarefas = tarefasData || [];

          // Calcular progresso das tarefas
          if (tarefas.length > 0) {
            const tarefasConcluidas = tarefas.filter((t) => t.status === "concluida").length;
            progresso_tarefas = Math.round((tarefasConcluidas / tarefas.length) * 100);
          }
        }

        // Buscar sessão associada
        if (fase.sessao_associada_id) {
          const { data: sessaoData } = await supabase
            .from("sessoes_mentoria")
            .select("*")
            .eq("id", fase.sessao_associada_id)
            .single();
          sessao = sessaoData;
        }

        // Calcular progresso automático baseado em dados
        let progressoCalculado = 0;
        if (fase.status === "concluida") {
          progressoCalculado = 100;
        } else if (fase.status === "em_andamento") {
          // Fase 1: Diagnóstico
          if (fase.fase_numero === 1) {
            const { data: diagnostico } = await supabase
              .from("formulario_diagnostico")
              .select("completado")
              .eq("user_id", userId)
              .single();
            progressoCalculado = diagnostico?.completado ? 100 : 50;
          }
          // Fase 2: Onboarding
          else if (fase.fase_numero === 2) {
            if (sessao?.status === "realizada") progressoCalculado = 100;
            else if (sessao?.status === "agendada") progressoCalculado = 50;
          }
          // Fases 3-8: Projetos
          else if (fase.fase_numero >= 3 && fase.fase_numero <= 8) {
            if (projeto) {
              if (projeto.status === "concluido") progressoCalculado = 100;
              else if (progresso_tarefas > 0) progressoCalculado = progresso_tarefas;
              else progressoCalculado = projeto.progresso_preparacao || 0;
            }
          }
        }

        return {
          ...fase,
          projeto,
          sessao,
          tarefas,
          progresso_tarefas: progressoCalculado,
        };
      })
    );

    return enrichedFases as FaseProcesso[];
  };

  const updateFase = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FaseProcesso> & { id: string }) => {
      const { data, error } = await supabase
        .from("fases_processo_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fases-processo"] });
      toast({
        title: "Fase atualizada!",
        description: "As informações foram salvas com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar fase",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const inicializarFases = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("inicializar_fases_processo", {
        p_user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fases-processo"] });
      toast({
        title: "Fases inicializadas!",
        description: "Roadmap do processo criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao inicializar fases",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    fases: fases || [],
    isLoading,
    updateFase: updateFase.mutate,
    inicializarFases: inicializarFases.mutate,
    isUpdating: updateFase.isPending,
  };
};
