import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSquadMembro } from "./useSquadMembro";
import { differenceInWeeks, differenceInDays, parseISO, isAfter, isBefore } from "date-fns";

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
  avaliacaoNota: number | null;
  concluidoEm: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
}

interface MetricaSemanal {
  semana: number;
  horasEconomizadas: number;
  processosAutomatizados: number;
  entregasConcluidas: number;
  engajamentoTrilhas: number;
  indiceMaturidade: number;
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

export function useSquadLider() {
  const {
    squadId,
    squadNome,
    empresaNome,
    dataInicio,
    dataFim,
    investimento,
    custoHora,
    isLider,
    isLoading: membroLoading,
  } = useSquadMembro();

  // Buscar membros do squad
  const { data: membros, isLoading: membrosLoading } = useQuery({
    queryKey: ["squad-membros", squadId],
    queryFn: async () => {
      if (!squadId) return [];
      
      const { data, error } = await supabase
        .from("membros_squad")
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
        .eq("squad_id", squadId)
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
    enabled: !!squadId && isLider,
  });

  // Buscar entregas do squad
  const { data: entregas, isLoading: entregasLoading } = useQuery({
    queryKey: ["squad-entregas", squadId],
    queryFn: async () => {
      if (!squadId) return [];
      
      const { data, error } = await supabase
        .from("entregas_squad")
        .select(`
          id,
          titulo,
          descricao,
          status,
          progresso,
          prazo,
          economia_horas_semana,
          avaliacao_nota,
          concluido_em,
          responsavel_id,
          profiles:responsavel_id (nome_completo)
        `)
        .eq("squad_id", squadId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((e: any) => ({
        id: e.id,
        titulo: e.titulo,
        descricao: e.descricao,
        status: e.status,
        progresso: e.progresso || 0,
        prazo: e.prazo,
        economiaHorasSemana: e.economia_horas_semana || 0,
        avaliacaoNota: e.avaliacao_nota,
        concluidoEm: e.concluido_em,
        responsavelId: e.responsavel_id,
        responsavelNome: e.profiles?.nome_completo || null,
      })) as Entrega[];
    },
    enabled: !!squadId && isLider,
  });

  // Buscar métricas semanais
  const { data: metricas, isLoading: metricasLoading } = useQuery({
    queryKey: ["squad-metricas", squadId],
    queryFn: async () => {
      if (!squadId) return [];
      
      const { data, error } = await supabase
        .from("metricas_squad")
        .select("*")
        .eq("squad_id", squadId)
        .order("semana", { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((m: any) => ({
        semana: m.semana,
        horasEconomizadas: m.horas_economizadas || 0,
        processosAutomatizados: m.processos_automatizados || 0,
        entregasConcluidas: m.entregas_concluidas || 0,
        engajamentoTrilhas: m.engajamento_trilhas || 0,
        indiceMaturidade: m.indice_maturidade || 0,
      })) as MetricaSemanal[];
    },
    enabled: !!squadId && isLider,
  });

  // Buscar roadmap
  const { data: roadmap, isLoading: roadmapLoading } = useQuery({
    queryKey: ["squad-roadmap", squadId],
    queryFn: async () => {
      if (!squadId) return [];
      
      const { data, error } = await supabase
        .from("roadmap_squad")
        .select("*")
        .eq("squad_id", squadId)
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
    enabled: !!squadId && isLider,
  });

  // Calcular semana atual do programa
  const semanaAtual = dataInicio
    ? Math.max(1, Math.min(12, differenceInWeeks(new Date(), parseISO(dataInicio)) + 1))
    : 1;

  // Calcular KPIs
  const entregasConcluidas = (entregas || []).filter((e) => e.status === "concluido");
  const totalEntregas = (entregas || []).length;
  const horasEconomizadasTotal = entregasConcluidas.reduce(
    (acc, e) => acc + e.economiaHorasSemana,
    0
  );
  
  // Calcular valor gerado (horas * semanas desde conclusão * custo hora)
  const valorGerado = entregasConcluidas.reduce((acc, e) => {
    if (!e.concluidoEm) return acc;
    const semanasConcluido = Math.max(1, differenceInWeeks(new Date(), parseISO(e.concluidoEm)));
    return acc + (e.economiaHorasSemana * semanasConcluido * (custoHora || 60));
  }, 0);
  
  const roiAcumulado = investimento > 0 ? (valorGerado / investimento) * 100 : 0;
  
  const performanceMedia = entregasConcluidas.length > 0
    ? entregasConcluidas.reduce((acc, e) => acc + (e.avaliacaoNota || 0), 0) / entregasConcluidas.length
    : 0;

  // Calcular ranking de colaboradores
  const ranking: RankingColaborador[] = (membros || [])
    .map((m) => {
      const entregasMembro = (entregas || []).filter((e) => e.responsavelId === m.userId);
      const entregasConcluidasMembro = entregasMembro.filter((e) => e.status === "concluido");
      const entregasNoPrazo = entregasConcluidasMembro.filter((e) => {
        if (!e.prazo || !e.concluidoEm) return true;
        return !isAfter(parseISO(e.concluidoEm), parseISO(e.prazo));
      });
      
      const horasEcon = entregasConcluidasMembro.reduce((acc, e) => acc + e.economiaHorasSemana, 0);
      const perfMedia = entregasConcluidasMembro.length > 0
        ? entregasConcluidasMembro.reduce((acc, e) => acc + (e.avaliacaoNota || 0), 0) / entregasConcluidasMembro.length
        : 0;
      const taxaPrazo = entregasConcluidasMembro.length > 0
        ? (entregasNoPrazo.length / entregasConcluidasMembro.length) * 100
        : 0;
      
      // Score: (entregas * 30) + (horas * 25) + (performance * 25) + (prazo * 20)
      const score = 
        (entregasConcluidasMembro.length * 30) +
        (horasEcon * 25) +
        (perfMedia * 5 * 25) + // perfMedia é 0-5, normalizar para 0-100
        (taxaPrazo * 0.2);
      
      return {
        posicao: 0,
        userId: m.userId,
        nome: m.nome,
        avatar: m.avatar,
        entregasConcluidas: entregasConcluidasMembro.length,
        totalEntregas: entregasMembro.length,
        horasEconomizadas: horasEcon,
        performanceMedia: perfMedia,
        taxaPrazo,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, posicao: i + 1 }));

  // Dados para gráfico de ROI (projetado vs executado)
  const roiChartData = Array.from({ length: 12 }, (_, i) => {
    const semana = i + 1;
    const metricaSemana = (metricas || []).find((m) => m.semana === semana);
    
    // ROI projetado: crescimento linear até 100% no final
    const roiProjetado = (semana / 12) * 100;
    
    // ROI executado: baseado nas métricas reais
    const horasAcumuladas = (metricas || [])
      .filter((m) => m.semana <= semana)
      .reduce((acc, m) => acc + m.horasEconomizadas, 0);
    const valorAcumulado = horasAcumuladas * (custoHora || 60);
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

  const isLoading = membroLoading || membrosLoading || entregasLoading || metricasLoading || roadmapLoading;

  return {
    // Info do squad
    squadId,
    squadNome,
    empresaNome,
    dataInicio,
    dataFim,
    investimento,
    custoHora,
    isLider,
    
    // Dados
    membros: membros || [],
    entregas: entregas || [],
    metricas: metricas || [],
    roadmap: roadmap || [],
    ranking,
    
    // KPIs calculados
    semanaAtual,
    horasEconomizadasTotal,
    entregasConcluidas: entregasConcluidas.length,
    totalEntregas,
    performanceMedia,
    valorGerado,
    roiAcumulado,
    
    // Dados de gráficos
    roiChartData,
    maturidadeChartData,
    
    // Loading state
    isLoading,
  };
}
