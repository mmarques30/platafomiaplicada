import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";
import { useUserRole } from "./useUserRole";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { toast } from "sonner";
import { differenceInWeeks, parseISO, isAfter } from "date-fns";

interface Membro {
  id: string;
  userId: string;
  nome: string;
  avatar: string | null;
  cargo: string | null;
  papel: string;
  ultimoAcesso: string | null;
}

interface Entrega {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  progresso: number;
  prazo: string | null;
  economiaHorasSemana: number;
  roi: number;
  avaliacaoNota: number | null;
  concluidoEm: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  backlogItemId: string | null;
}

interface MetricaSemanal {
  semana: number;
  horasEconomizadas: number;
  projetosConcluidos: number;
  entregasConcluidas: number;
  engajamentoTrilhas: number;
  indiceMaturidade: number;
  roiProjetado: number;
  roiExecutado: number;
}

interface RoadmapFase {
  id: string;
  numeroFase: number;
  nomeFase: string;
  semanaInicio: number;
  semanaFim: number;
  status: string;
}

interface RankingColaborador {
  posicao: number;
  userId: string;
  nome: string;
  avatar: string | null;
  entregasConcluidas: number;
  totalEntregas: number;
  horasEconomizadas: number;
  performanceMedia: number;
  taxaPrazo: number;
  score: number;
}

export function useSkillsLider() {
  const { equipeId: membroEquipeId, isLider, isLoading: membroLoading } = useSkillsMembro();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  let isViewingAs = false;
  let viewAs: string | null = null;
  try {
    const context = useAdminViewContext();
    isViewingAs = context.isViewingAs;
    viewAs = context.viewAs;
  } catch {
    // Context not available
  }

  // Admin pode visualizar em modo simulação Skills
  const canAccess = isLider || (isAdmin && isViewingAs && (viewAs === "skills" || viewAs === "business_iaplicada"));

  // equipeId já vem resolvido do useSkillsMembro (inclui fallback admin)
  const equipeId = membroEquipeId;

  // Buscar dados da equipe
  const { data: equipeData, isLoading: equipeLoading } = useQuery({
    queryKey: ["skills-equipe-lider", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;
      const { data, error } = await supabase
        .from("equipes_skills")
        .select("*")
        .eq("id", equipeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!equipeId,
  });

  // Buscar membros da equipe
  const { data: membros, isLoading: membrosLoading } = useQuery({
    queryKey: ["skills-membros-lider", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select(`
          id,
          user_id,
          cargo,
          papel,
          profiles!inner (
            id,
            nome_completo,
            avatar_url,
            ultimo_acesso
          )
        `)
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      if (error) throw error;
      return (data || []).map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        nome: m.profiles.nome_completo,
        avatar: m.profiles.avatar_url,
        cargo: m.cargo,
        papel: m.papel,
        ultimoAcesso: m.profiles.ultimo_acesso,
      })) as Membro[];
    },
    enabled: !!equipeId,
  });

  // Buscar entregas da equipe
  const { data: entregas, isLoading: entregasLoading } = useQuery({
    queryKey: ["skills-entregas-lider", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("entregas_skills")
        .select(`
          id,
          titulo,
          descricao,
          status,
          progresso,
          prazo,
          economia_horas_semana,
          roi,
          avaliacao_nota,
          concluido_em,
          responsavel_id,
          backlog_item_id,
          profiles:responsavel_id (nome_completo)
        `)
        .eq("equipe_id", equipeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((e: any) => ({
        id: e.id,
        titulo: e.titulo,
        descricao: e.descricao,
        status: e.status || "pendente",
        progresso: e.progresso || 0,
        prazo: e.prazo,
        economiaHorasSemana: e.economia_horas_semana || 0,
        roi: e.roi || 0,
        avaliacaoNota: e.avaliacao_nota,
        concluidoEm: e.concluido_em,
        responsavelId: e.responsavel_id,
        responsavelNome: e.profiles?.nome_completo || null,
        backlogItemId: e.backlog_item_id || null,
      })) as Entrega[];
    },
    enabled: !!equipeId,
  });

  // Buscar projetos do backlog (para fallback quando entregas estão vazias)
  const { data: projetos, isLoading: projetosLoading } = useQuery({
    queryKey: ["skills-projetos-lider", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("backlog_skills")
        .select("id, titulo, status, responsavel_id, tags, horas_estimadas_economia, tempo_atual_horas, cargo_executor, custo_hora_executor, profiles:responsavel_id(nome_completo)")
        .eq("equipe_id", equipeId)
        .neq("status", "descartado");
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        status: p.status || "levantado",
        responsavelId: p.responsavel_id,
        responsavelNome: p.profiles?.nome_completo || null,
        tags: p.tags || [],
        horasEstimadas: p.horas_estimadas_economia || 0,
        tempoAtualHoras: p.tempo_atual_horas || 0,
        cargoExecutor: p.cargo_executor || null,
        custoHoraExecutor: p.custo_hora_executor || null,
      }));
    },
    enabled: !!equipeId,
  });

  // Buscar métricas semanais
  const { data: metricas, isLoading: metricasLoading } = useQuery({
    queryKey: ["skills-metricas-lider", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("metricas_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("semana", { ascending: true });
      if (error) throw error;
      return (data || []).map((m: any) => ({
        semana: m.semana,
        horasEconomizadas: m.horas_economizadas || 0,
        projetosConcluidos: m.projetos_concluidos || 0,
        entregasConcluidas: m.entregas_concluidas || 0,
        engajamentoTrilhas: m.engajamento_trilhas || 0,
        indiceMaturidade: m.indice_maturidade || 0,
        roiProjetado: m.roi_projetado || 0,
        roiExecutado: m.roi_executado || 0,
      })) as MetricaSemanal[];
    },
    enabled: !!equipeId,
  });

  // Buscar roadmap
  const { data: roadmap, isLoading: roadmapLoading } = useQuery({
    queryKey: ["skills-roadmap-lider", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("roadmap_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("numero_fase", { ascending: true });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        numeroFase: r.numero_fase,
        nomeFase: r.nome_fase,
        semanaInicio: r.semana_inicio,
        semanaFim: r.semana_fim,
        status: r.status,
      })) as RoadmapFase[];
    },
    enabled: !!equipeId,
  });

  // Entregas aguardando validação
  const { data: entregasParaValidar } = useQuery({
    queryKey: ["entregas-validar", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("entregas_skills")
        .select(`*, responsavel:responsavel_id (id, nome_completo, avatar_url)`)
        .eq("equipe_id", equipeId)
        .eq("status", "aguardando_validacao")
        .order("prazo", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!equipeId,
  });

  // Alertas de atraso
  const { data: alertasAtraso } = useQuery({
    queryKey: ["alertas-atraso", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const hoje = new Date().toISOString();
      const { data, error } = await supabase
        .from("entregas_skills")
        .select(`*, responsavel:responsavel_id (id, nome_completo, avatar_url)`)
        .eq("equipe_id", equipeId)
        .in("status", ["pendente", "em_andamento"])
        .lt("prazo", hoje)
        .order("prazo", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!equipeId,
  });

  // Mutation para aprovar entrega
  const aprovarEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({
          status: "aprovada",
          aprovado_em: new Date().toISOString(),
          concluido_em: new Date().toISOString(),
        })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega aprovada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entregas-validar"] });
      queryClient.invalidateQueries({ queryKey: ["skills-entregas-lider"] });
      queryClient.invalidateQueries({ queryKey: ["skills-metricas-lider"] });
      queryClient.invalidateQueries({ queryKey: ["progresso-membros"] });
    },
    onError: () => {
      toast.error("Erro ao aprovar entrega");
    },
  });

  // Mutation para rejeitar entrega
  const rejeitarEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: "em_andamento" })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega devolvida para revisão");
      queryClient.invalidateQueries({ queryKey: ["entregas-validar"] });
      queryClient.invalidateQueries({ queryKey: ["skills-entregas-lider"] });
      queryClient.invalidateQueries({ queryKey: ["progresso-membros"] });
    },
    onError: () => {
      toast.error("Erro ao rejeitar entrega");
    },
  });

  // Progresso de cada membro
  const { data: progressoMembros, isLoading: loadingProgresso } = useQuery({
    queryKey: ["progresso-membros", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data: membrosData, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select(`
          id,
          user_id,
          cargo,
          papel,
          profiles:user_id (id, nome_completo, avatar_url)
        `)
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      if (membrosError) throw membrosError;

      const { data: diagnosticosData } = await supabase
        .from("diagnosticos_skills")
        .select("user_id, completado")
        .eq("equipe_id", equipeId);

      const { data: entregasData } = await supabase
        .from("entregas_skills")
        .select("responsavel_id, status")
        .eq("equipe_id", equipeId);

      return membrosData?.map((m: any) => {
        const userEntregas = entregasData?.filter(e => e.responsavel_id === m.user_id) || [];
        const entregasConcluidas = userEntregas.filter(e => e.status === "aprovada" || e.status === "concluido").length;
        const totalEntregas = userEntregas.length;
        return {
          id: m.id,
          user_id: m.user_id,
          nome: m.profiles?.nome_completo || "Usuário",
          avatar_url: m.profiles?.avatar_url,
          cargo: m.cargo,
          papel: m.papel,
          diagnostico_completo: diagnosticosData?.find(d => d.user_id === m.user_id)?.completado || false,
          entregas_concluidas: entregasConcluidas,
          total_entregas: totalEntregas,
        };
      }) || [];
    },
    enabled: !!equipeId,
  });

  // Calcular semana atual do programa
  const dataInicio = equipeData?.data_inicio;
  const semanaAtual = dataInicio
    ? Math.max(1, Math.min(12, differenceInWeeks(new Date(), parseISO(dataInicio)) + 1))
    : 1;

  // Calcular KPIs híbridos (projetos + entregas)
  const investimento = equipeData?.investimento || 0;
  const custoHora = equipeData?.custo_hora_padrao || 60;

  // Filtrar entregas vinculadas a projetos não aprovados/descartados
  const projetosExcluidos = new Set(
    (projetos || []).filter(p => ["nao_aprovado", "descartado"].includes(p.status)).map(p => p.id)
  );
  const entregasValidas = (entregas || []).filter(e => !e.backlogItemId || !projetosExcluidos.has(e.backlogItemId));
  const entregasConcluidasList = entregasValidas.filter((e) => e.status === "concluido" || e.status === "aprovada");
  const totalEntregas = entregasValidas.length;
  const horasEconomizadasEntregas = entregasConcluidasList.reduce(
    (acc, e) => acc + e.economiaHorasSemana,
    0
  );

  // Projetos ativos (excluindo não aprovado e descartado)
  const projetosAtivos = (projetos || []).filter(p => !["nao_aprovado", "descartado"].includes(p.status));
  const totalProjetosAtivos = projetosAtivos.length;
  const economiaEstimadaProjetos = projetosAtivos.reduce((acc, p) => acc + p.horasEstimadas, 0);

  // Horas economizadas combinadas: reais das entregas + estimadas dos projetos
  const horasEconomizadasTotal = horasEconomizadasEntregas + economiaEstimadaProjetos;

  // ROI projetado anualizado: economia estimada * custo hora * 52 semanas
  const custoMedioProjetos = projetosAtivos.reduce((acc, p) => acc + (p.custoHoraExecutor || custoHora), 0) / Math.max(1, projetosAtivos.length);
  const roiProjetadoAnual = economiaEstimadaProjetos * custoMedioProjetos * 52;

  const valorGerado = entregasConcluidasList.reduce((acc, e) => {
    if (!e.concluidoEm) return acc;
    const semanasConcluido = Math.max(1, differenceInWeeks(new Date(), parseISO(e.concluidoEm)));
    return acc + (e.economiaHorasSemana * semanasConcluido * custoHora);
  }, 0);

  const roiAcumulado = investimento > 0 ? (valorGerado / investimento) * 100 : 0;

  const performanceMedia = entregasConcluidasList.length > 0
    ? entregasConcluidasList.reduce((acc, e) => acc + (e.avaliacaoNota || 0), 0) / entregasConcluidasList.length
    : 0;

  // Calcular ranking híbrido de colaboradores (projetos + entregas)
  const ranking: RankingColaborador[] = (membros || [])
    .map((m) => {
      const entregasMembro = (entregas || []).filter((e) => e.responsavelId === m.userId);
      const entregasConcluidasMembro = entregasMembro.filter((e) => e.status === "concluido" || e.status === "aprovada");
      const entregasNoPrazo = entregasConcluidasMembro.filter((e) => {
        if (!e.prazo || !e.concluidoEm) return true;
        return !isAfter(parseISO(e.concluidoEm), parseISO(e.prazo));
      });

      const projetosMembro = projetosAtivos.filter((p) => p.responsavelId === m.userId);
      const projetosEmAndamento = projetosMembro.filter((p) => p.status === "em_andamento").length;

      const horasEcon = entregasConcluidasMembro.reduce((acc, e) => acc + e.economiaHorasSemana, 0);
      const horasEstimadasProjetos = projetosMembro.reduce((acc, p) => acc + p.horasEstimadas, 0);
      const perfMedia = entregasConcluidasMembro.length > 0
        ? entregasConcluidasMembro.reduce((acc, e) => acc + (e.avaliacaoNota || 0), 0) / entregasConcluidasMembro.length
        : 0;
      const taxaPrazo = entregasConcluidasMembro.length > 0
        ? (entregasNoPrazo.length / entregasConcluidasMembro.length) * 100
        : 0;

      // Score híbrido: combina projetos + entregas
      const score = (entregasConcluidasMembro.length * 30) + (horasEcon * 25) + (perfMedia * 5 * 25) + (taxaPrazo * 0.2)
        + (projetosMembro.length * 20) + (projetosEmAndamento * 15) + (horasEstimadasProjetos * 5);

      return {
        posicao: 0,
        userId: m.userId,
        nome: m.nome,
        avatar: m.avatar,
        entregasConcluidas: entregasConcluidasMembro.length,
        totalEntregas: entregasMembro.length,
        horasEconomizadas: horasEcon + horasEstimadasProjetos,
        performanceMedia: perfMedia,
        taxaPrazo,
        score,
        totalProjetos: projetosMembro.length,
        projetosEmAndamento,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, posicao: i + 1 }));

  // Dados para gráfico de ROI — usa roi_projetado/roi_executado das métricas quando disponível
  const roiChartData = Array.from({ length: 12 }, (_, i) => {
    const semana = i + 1;
    const metricaSemana = (metricas || []).find((m) => m.semana === semana);
    if (metricaSemana && (metricaSemana.roiProjetado || metricaSemana.roiExecutado)) {
      return {
        semana: `Sem ${semana}`,
        projetado: Math.round(metricaSemana.roiProjetado),
        executado: Math.round(metricaSemana.roiExecutado),
      };
    }
    // Fallback: cálculo baseado em horas
    const roiProjetado = (semana / 12) * 100;
    const horasAcumuladas = (metricas || [])
      .filter((m) => m.semana <= semana)
      .reduce((acc, m) => acc + m.horasEconomizadas, 0);
    const valorAcumulado = horasAcumuladas * custoHora;
    const roiExecutado = investimento > 0 ? (valorAcumulado / investimento) * 100 : 0;
    return {
      semana: `Sem ${semana}`,
      projetado: Math.round(roiProjetado),
      executado: Math.round(roiExecutado),
    };
  });

  // Dados para gráfico de maturidade IA
  const maturidadeChartData = Array.from({ length: 12 }, (_, i) => {
    const semana = i + 1;
    const metricaSemana = (metricas || []).find((m) => m.semana === semana);
    return {
      semana: `Sem ${semana}`,
      maturidade: metricaSemana?.indiceMaturidade || 0,
    };
  });

  // Loading state
  const isLoading = membroLoading || equipeLoading || membrosLoading || entregasLoading || projetosLoading || metricasLoading || roadmapLoading || loadingProgresso;

  // Métricas consolidadas
  const metricasConsolidadas = {
    totalEntregas,
    entregasAprovadas: entregasConcluidasList.length,
    entregasParaValidar: entregasParaValidar?.length || 0,
    entregasAtrasadas: alertasAtraso?.length || 0,
    horasEconomizadas: horasEconomizadasTotal,
  };

  return {
    // Info da equipe
    equipeId,
    equipeNome: equipeData?.nome ?? null,
    empresaNome: equipeData?.empresa_nome ?? null,
    dataInicio: equipeData?.data_inicio ?? null,
    dataFim: equipeData?.data_fim ?? null,
    investimento,
    custoHora,
    isLider,
    isAdmin,
    canAccess: canAccess || isAdmin,

    // Dados
    membros: membros || [],
    entregas: entregas || [],
    projetos: projetos || [],
    metricas: metricasConsolidadas,
    metricasSemanais: metricas || [],
    roadmap: roadmap || [],
    ranking,
    progressoMembros: progressoMembros || [],

    // Alertas e validações
    entregasParaValidar: entregasParaValidar || [],
    alertasAtraso: alertasAtraso || [],

    // KPIs calculados (híbridos)
    semanaAtual,
    horasEconomizadasTotal,
    entregasConcluidas: entregasConcluidasList.length,
    totalEntregas,
    totalProjetosAtivos,
    economiaEstimadaProjetos,
    roiProjetadoAnual,
    performanceMedia,
    valorGerado,
    roiAcumulado,

    // Dados de gráficos
    roiChartData,
    maturidadeChartData,

    // Mutations
    aprovarEntrega,
    rejeitarEntrega,

    // Loading state
    isLoading,
  };
}
