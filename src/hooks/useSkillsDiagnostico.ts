import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { useUserRole } from "./useUserRole";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface DiagnosticoSkills {
  id?: string;
  user_id?: string;
  equipe_id?: string;
  // Bloco 1
  cargo?: string;
  area_atuacao?: string;
  tempo_na_empresa?: string;
  ferramentas_atuais?: Array<{ nome: string; uso: string }>;
  // Bloco 2
  horas_repetitivas?: string;
  atividade_principal?: string;
  frequencia_atividade?: string;
  tempo_gasto?: string;
  // Bloco 3
  processos_detalhados?: Array<{
    nome: string;
    passos: string;
    frequencia: string;
    tempo: string;
    impacto: string;
    tentouAutomatizar: string;
  }>;
  // Bloco 4
  objetivos_ia?: string[];
  resultado_sucesso?: string;
  autonomia?: string;
  // Bloco 5
  nivel_tecnico?: string;
  ferramentas_automacao?: string[];
  uso_ia?: string;
  // Bloco 6
  horas_semana?: string;
  melhor_horario?: string[];
  preferencia_conteudo?: string;
  // Bloco 7
  tamanho_area?: string;
  sistemas_erp?: string[];
  iniciativas_ia?: string;
  maturidade_digital?: string;
  // Bloco 8
  desafios?: string[];
  processo_colaborativo?: string;
  automatizar_empresa?: string;
  // Bloco 9
  apoio_lideranca?: string;
  restricoes_ti?: string;
  objetivo_programa?: string[];
  areas_automacao?: string[];
  // Bloco 10
  resultado_equipe?: string;
  projeto_colaborativo?: string;
  barreiras?: string;
  // Campos legados
  tarefas_manuais?: Array<{ tarefa: string; frequencia: string; tempo_gasto_horas: number }>;
  processos_mais_demorados?: string;
  gargalos_identificados?: string[];
  onde_perde_mais_tempo?: string;
  processos_repetitivos?: string;
  onde_poderia_ser_mais_produtivo?: string;
  interesse_em_ia?: string;
  ja_usou_ia?: string;
  // Estado
  completado?: boolean;
  // Resultado IA
  insight_ia?: any;
  insight_gerado_em?: string;
  economia_horas_semana?: number;
  economia_valor_mensal?: number;
  trilha_sugerida?: any;
  processos_analisados?: any;
}

export function useSkillsDiagnostico() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<DiagnosticoSkills>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Obter contexto de simulação (admin visualizando como outro usuário)
  let impersonatedUserId: string | null = null;
  let isViewingAs = false;

  try {
    const context = useAdminViewContext();
    impersonatedUserId = context.impersonatedUserId;
    isViewingAs = context.isViewingAs;
  } catch {
    // Context não disponível
  }

  // Se admin está simulando outro usuário, usar o ID do usuário simulado
  const effectiveUserId = (isAdmin && isViewingAs && impersonatedUserId)
    ? impersonatedUserId
    : user?.id;

  // Fetch equipe do usuário
  const { data: membroEquipe } = useQuery({
    queryKey: ["membro-equipe-skills", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id")
        .eq("user_id", effectiveUserId)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId,
  });

  // Fetch diagnóstico existente
  const { data: diagnostico, isLoading } = useQuery({
    queryKey: ["diagnostico-skills", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      const { data, error } = await supabase
        .from("diagnosticos_skills")
        .select("*")
        .eq("user_id", effectiveUserId)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return mapDiagnosticoFromDB(data);
    },
    enabled: !!effectiveUserId,
  });

  // Atualizar localData quando diagnostico carregar
  useEffect(() => {
    if (diagnostico) {
      setLocalData(diagnostico);
    }
  }, [diagnostico]);

  const updateDiagnostico = (updates: Partial<DiagnosticoSkills>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  // Salvar diagnóstico no banco
  const saveMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      if (!effectiveUserId) throw new Error("Usuário não autenticado");

      const processosDetalhados = [1, 2, 3]
        .map((n) => ({
          nome: formData[`processo${n}Nome`] || "",
          passos: formData[`processo${n}Passos`] || "",
          frequencia: formData[`processo${n}Freq`] || "",
          tempo: formData[`processo${n}Tempo`] || "",
          impacto: formData[`processo${n}Impacto`] || "",
          tentouAutomatizar: formData[`processo${n}Automatizar`] || "",
        }))
        .filter((p) => p.nome);

      const desafios = [1, 2, 3]
        .map((n) => formData[`desafio${n}`] || "")
        .filter(Boolean);

      const payload = {
        user_id: effectiveUserId,
        equipe_id: membroEquipe?.equipe_id || null,
        cargo: formData.cargo || null,
        area_atuacao: formData.area || null,
        tempo_na_empresa: formData.tempoFuncao || null,
        ferramentas_atuais: (formData.ferramentas || []).map((f: string) => ({ nome: f, uso: "diário" })),
        horas_repetitivas: formData.horasRepetitivas || null,
        atividade_principal: formData.atividadePrincipal || null,
        frequencia_atividade: formData.frequencia || null,
        tempo_gasto: formData.tempoGasto || null,
        processos_detalhados: processosDetalhados,
        objetivos_ia: formData.objetivosIA || [],
        resultado_sucesso: formData.resultadoSucesso || null,
        autonomia: formData.autonomia || null,
        nivel_tecnico: formData.nivelTecnico || null,
        ferramentas_automacao: formData.ferramentasAutomacao || [],
        uso_ia: formData.usoIA || null,
        horas_semana: formData.horasSemana || null,
        melhor_horario: formData.melhorHorario || [],
        preferencia_conteudo: formData.preferenciaConteudo || null,
        tamanho_area: formData.tamanhoArea || null,
        sistemas_erp: formData.sistemasERP || [],
        iniciativas_ia: formData.iniciativasIA || null,
        maturidade_digital: formData.maturidadeDigital || null,
        desafios: desafios,
        processo_colaborativo: formData.processoColaborativo || null,
        automatizar_empresa: formData.automatizarEmpresa || null,
        apoio_lideranca: formData.apoioLideranca || null,
        restricoes_ti: formData.restricoesTI || null,
        objetivo_programa: formData.objetivoPrograma || [],
        areas_automacao: formData.areasAutomacao || [],
        resultado_equipe: formData.resultadoEquipe || null,
        projeto_colaborativo: formData.projetoColaborativo || null,
        barreiras: formData.barreiras || null,
        completado: true,
        updated_at: new Date().toISOString(),
      };

      if (diagnostico?.id) {
        const { data, error } = await supabase
          .from("diagnosticos_skills")
          .update(payload)
          .eq("id", diagnostico.id)
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      } else {
        const { data, error } = await supabase
          .from("diagnosticos_skills")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      }
    },
  });

  // Processar com IA
  const processarComIA = async (diagnosticoId: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("processar-diagnostico-skills", {
        body: { diagnostico_id: diagnosticoId },
      });

      if (error) throw error;

      if (data?.resultado) {
        setLocalData((prev) => ({
          ...prev,
          insight_ia: data.resultado,
          processos_analisados: data.resultado.processos,
          trilha_sugerida: data.resultado.trilha,
          economia_horas_semana: data.resultado.economia?.horasSemana || 0,
          economia_valor_mensal: data.resultado.economia?.valorMensal || 0,
        }));
      }

      queryClient.invalidateQueries({ queryKey: ["diagnostico-skills"] });
      toast.success("Diagnóstico processado com sucesso!");
      return data?.resultado;
    } catch (err: any) {
      console.error("Erro ao processar diagnóstico:", err);
      toast.error(err?.message || "Erro ao processar diagnóstico com IA");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // Salvar e processar
  const saveAndProcess = async (formData: Record<string, any>) => {
    const id = await saveMutation.mutateAsync(formData);
    return processarComIA(id);
  };

  return {
    diagnostico: localData,
    isLoading,
    isProcessing,
    isSaving: saveMutation.isPending,
    updateDiagnostico,
    saveDiagnostico: saveMutation.mutateAsync,
    saveAndProcess,
    hasInsight: !!localData.insight_ia,
  };
}

function mapDiagnosticoFromDB(data: any): DiagnosticoSkills {
  return {
    id: data.id,
    user_id: data.user_id,
    equipe_id: data.equipe_id || undefined,
    cargo: data.cargo || undefined,
    area_atuacao: data.area_atuacao || undefined,
    tempo_na_empresa: data.tempo_na_empresa || undefined,
    ferramentas_atuais: Array.isArray(data.ferramentas_atuais) ? data.ferramentas_atuais as any[] : [],
    horas_repetitivas: data.horas_repetitivas || undefined,
    atividade_principal: data.atividade_principal || undefined,
    frequencia_atividade: data.frequencia_atividade || undefined,
    tempo_gasto: data.tempo_gasto || undefined,
    processos_detalhados: Array.isArray(data.processos_detalhados) ? data.processos_detalhados as any[] : [],
    objetivos_ia: Array.isArray(data.objetivos_ia) ? data.objetivos_ia as string[] : [],
    resultado_sucesso: data.resultado_sucesso || undefined,
    autonomia: data.autonomia || undefined,
    nivel_tecnico: data.nivel_tecnico || undefined,
    ferramentas_automacao: Array.isArray(data.ferramentas_automacao) ? data.ferramentas_automacao as string[] : [],
    uso_ia: data.uso_ia || undefined,
    horas_semana: data.horas_semana || undefined,
    melhor_horario: Array.isArray(data.melhor_horario) ? data.melhor_horario as string[] : [],
    preferencia_conteudo: data.preferencia_conteudo || undefined,
    tamanho_area: data.tamanho_area || undefined,
    sistemas_erp: Array.isArray(data.sistemas_erp) ? data.sistemas_erp as string[] : [],
    iniciativas_ia: data.iniciativas_ia || undefined,
    maturidade_digital: data.maturidade_digital || undefined,
    desafios: Array.isArray(data.desafios) ? data.desafios as string[] : [],
    processo_colaborativo: data.processo_colaborativo || undefined,
    automatizar_empresa: data.automatizar_empresa || undefined,
    apoio_lideranca: data.apoio_lideranca || undefined,
    restricoes_ti: data.restricoes_ti || undefined,
    objetivo_programa: Array.isArray(data.objetivo_programa) ? data.objetivo_programa as string[] : [],
    areas_automacao: Array.isArray(data.areas_automacao) ? data.areas_automacao as string[] : [],
    resultado_equipe: data.resultado_equipe || undefined,
    projeto_colaborativo: data.projeto_colaborativo || undefined,
    barreiras: data.barreiras || undefined,
    tarefas_manuais: Array.isArray(data.tarefas_manuais) ? data.tarefas_manuais as any[] : [],
    processos_mais_demorados: data.processos_mais_demorados || undefined,
    gargalos_identificados: Array.isArray(data.gargalos_identificados) ? data.gargalos_identificados as string[] : [],
    onde_perde_mais_tempo: data.onde_perde_mais_tempo || undefined,
    processos_repetitivos: data.processos_repetitivos || undefined,
    onde_poderia_ser_mais_produtivo: data.onde_poderia_ser_mais_produtivo || undefined,
    interesse_em_ia: data.interesse_em_ia || undefined,
    ja_usou_ia: data.ja_usou_ia || undefined,
    completado: data.completado || false,
    insight_ia: data.insight_ia || undefined,
    insight_gerado_em: data.insight_gerado_em || undefined,
    economia_horas_semana: data.economia_horas_semana || 0,
    economia_valor_mensal: data.economia_valor_mensal || 0,
    trilha_sugerida: data.trilha_sugerida || undefined,
    processos_analisados: data.processos_analisados || undefined,
  };
}
