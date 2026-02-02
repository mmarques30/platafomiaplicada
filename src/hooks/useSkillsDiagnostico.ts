import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface DiagnosticoSkills {
  id?: string;
  user_id?: string;
  equipe_id?: string;
  cargo?: string;
  area_atuacao?: string;
  tempo_na_empresa?: string;
  tarefas_manuais?: Array<{ tarefa: string; frequencia: string; tempo_gasto_horas: number }>;
  ferramentas_atuais?: Array<{ nome: string; uso: string }>;
  processos_mais_demorados?: string;
  gargalos_identificados?: string[];
  onde_perde_mais_tempo?: string;
  processos_repetitivos?: string;
  onde_poderia_ser_mais_produtivo?: string;
  interesse_em_ia?: string;
  ja_usou_ia?: string;
  completado?: boolean;
}

export function useSkillsDiagnostico() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<DiagnosticoSkills>({});

  // Fetch equipe do usuário
  const { data: membroEquipe } = useQuery({
    queryKey: ["membro-equipe-skills", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id")
        .eq("user_id", user.id)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch diagnóstico existente
  const { data: diagnostico, isLoading } = useQuery({
    queryKey: ["diagnostico-skills", user?.id, membroEquipe?.equipe_id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("diagnosticos_skills")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return {
        id: data.id,
        user_id: data.user_id,
        equipe_id: data.equipe_id || undefined,
        cargo: data.cargo || undefined,
        area_atuacao: data.area_atuacao || undefined,
        tempo_na_empresa: data.tempo_na_empresa || undefined,
        tarefas_manuais: Array.isArray(data.tarefas_manuais) ? data.tarefas_manuais as any[] : [],
        ferramentas_atuais: Array.isArray(data.ferramentas_atuais) ? data.ferramentas_atuais as any[] : [],
        processos_mais_demorados: data.processos_mais_demorados || undefined,
        gargalos_identificados: Array.isArray(data.gargalos_identificados) ? data.gargalos_identificados as string[] : [],
        onde_perde_mais_tempo: data.onde_perde_mais_tempo || undefined,
        processos_repetitivos: data.processos_repetitivos || undefined,
        onde_poderia_ser_mais_produtivo: data.onde_poderia_ser_mais_produtivo || undefined,
        interesse_em_ia: data.interesse_em_ia || undefined,
        ja_usou_ia: data.ja_usou_ia || undefined,
        completado: data.completado || false,
      } as DiagnosticoSkills;
    },
    enabled: !!user?.id,
  });

  // Atualizar localData quando diagnostico carregar
  useEffect(() => {
    if (diagnostico) {
      setLocalData({
        ...diagnostico,
        tarefas_manuais: (diagnostico.tarefas_manuais as any) || [],
        ferramentas_atuais: (diagnostico.ferramentas_atuais as any) || [],
        gargalos_identificados: (diagnostico.gargalos_identificados as any) || [],
      });
    }
  }, [diagnostico]);

  const updateDiagnostico = (updates: Partial<DiagnosticoSkills>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      
      const payload = {
        user_id: user.id,
        equipe_id: membroEquipe?.equipe_id || null,
        cargo: localData.cargo,
        area_atuacao: localData.area_atuacao,
        tempo_na_empresa: localData.tempo_na_empresa,
        tarefas_manuais: localData.tarefas_manuais || [],
        ferramentas_atuais: localData.ferramentas_atuais || [],
        processos_mais_demorados: localData.processos_mais_demorados,
        gargalos_identificados: localData.gargalos_identificados || [],
        onde_perde_mais_tempo: localData.onde_perde_mais_tempo,
        processos_repetitivos: localData.processos_repetitivos,
        onde_poderia_ser_mais_produtivo: localData.onde_poderia_ser_mais_produtivo,
        interesse_em_ia: localData.interesse_em_ia,
        ja_usou_ia: localData.ja_usou_ia,
        completado: true,
        updated_at: new Date().toISOString(),
      };

      if (diagnostico?.id) {
        const { error } = await supabase
          .from("diagnosticos_skills")
          .update(payload)
          .eq("id", diagnostico.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("diagnosticos_skills")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostico-skills"] });
      toast.success("Diagnóstico salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar diagnóstico:", error);
      toast.error("Erro ao salvar diagnóstico");
    },
  });

  return {
    diagnostico: localData,
    isLoading,
    updateDiagnostico,
    saveDiagnostico: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
