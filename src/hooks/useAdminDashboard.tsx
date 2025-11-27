import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7).toISOString();
      const thirtyDaysAgo = subDays(now, 30).toISOString();

      // Buscar todos os usuários com seus planos
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, nome_completo, plano_mentoria, created_at, conta_ativa");
      
      if (usersError) throw usersError;

      // Buscar tarefas atrasadas
      const { data: tarefasAtrasadas, error: tarefasError } = await supabase
        .from("tarefas_mentoria")
        .select("id, titulo, prazo_entrega, user_id, status")
        .lt("prazo_entrega", now.toISOString())
        .neq("status", "concluida")
        .order("prazo_entrega", { ascending: true });
      
      if (tarefasError) throw tarefasError;

      // Buscar dúvidas pendentes
      const { data: duvidasPendentes, error: duvidasError } = await supabase
        .from("duvidas_mentoria")
        .select("id, titulo, created_at, prioridade")
        .eq("status", "pendente")
        .order("created_at", { ascending: true });
      
      if (duvidasError) throw duvidasError;

      // Buscar diagnósticos incompletos
      const { data: diagnosticosIncompletos, error: diagnosticosError } = await supabase
        .from("formulario_diagnostico")
        .select("id, user_id, created_at")
        .eq("completado", false)
        .order("created_at", { ascending: false });
      
      if (diagnosticosError) throw diagnosticosError;

      // Buscar tarefas por status
      const { data: todasTarefas, error: todasTarefasError } = await supabase
        .from("tarefas_mentoria")
        .select("id, status");
      
      if (todasTarefasError) throw todasTarefasError;

      // Buscar projetos por status
      const { data: projetos, error: projetosError } = await supabase
        .from("projetos_mentoria")
        .select("id, status");
      
      if (projetosError) throw projetosError;

      // Buscar sessões agendadas
      const { data: sessoesAgendadas, error: sessoesError } = await supabase
        .from("sessoes_mentoria")
        .select("id, titulo, data_sessao")
        .eq("status", "agendada")
        .gte("data_sessao", now.toISOString())
        .order("data_sessao", { ascending: true });
      
      if (sessoesError) throw sessoesError;

      // Buscar progresso de vídeos para engajamento
      const { data: progressoVideos, error: progressoError } = await supabase
        .from("progresso_videos")
        .select("user_id, completado, created_at, updated_at");
      
      if (progressoError) throw progressoError;

      // Buscar conteúdo ativo
      const { data: trilhas, error: trilhasError } = await supabase
        .from("trilhas")
        .select("id")
        .eq("ativo", true);
      
      if (trilhasError) throw trilhasError;

      const { data: modulos, error: modulosError } = await supabase
        .from("modulos")
        .select("id")
        .eq("ativo", true);
      
      if (modulosError) throw modulosError;

      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select("id")
        .eq("ativo", true);
      
      if (videosError) throw videosError;

      const { data: ferramentas, error: ferramentasError } = await supabase
        .from("ferramentas_ia")
        .select("id")
        .eq("ativo", true);
      
      if (ferramentasError) throw ferramentasError;

      // Buscar avaliações de vídeos
      const { data: ratings, error: ratingsError } = await supabase
        .from("video_ratings")
        .select("rating");
      
      if (ratingsError) throw ratingsError;

      // Calcular distribuição por plano
      const distribuicaoPlanos = {
        academy: users?.filter(u => u.plano_mentoria === "academy").length || 0,
        lab: users?.filter(u => u.plano_mentoria === "lab").length || 0,
        skills: users?.filter(u => u.plano_mentoria === "skills").length || 0,
        club: users?.filter(u => u.plano_mentoria === "club").length || 0,
        sem_plano: users?.filter(u => !u.plano_mentoria).length || 0,
      };

      // Calcular novos usuários
      const novosUsuarios7d = users?.filter(u => u.created_at && new Date(u.created_at) >= new Date(sevenDaysAgo)).length || 0;
      const novosUsuarios30d = users?.filter(u => u.created_at && new Date(u.created_at) >= new Date(thirtyDaysAgo)).length || 0;

      // Calcular usuários ativos (que acessaram vídeos recentemente)
      const usuariosAtivos7d = new Set(
        progressoVideos?.filter(p => p.updated_at && new Date(p.updated_at) >= new Date(sevenDaysAgo)).map(p => p.user_id)
      ).size;

      const usuariosAtivos30d = new Set(
        progressoVideos?.filter(p => p.updated_at && new Date(p.updated_at) >= new Date(thirtyDaysAgo)).map(p => p.user_id)
      ).size;

      // Top 5 usuários mais engajados
      const userEngagement = progressoVideos?.reduce((acc, p) => {
        if (!acc[p.user_id]) {
          acc[p.user_id] = { total: 0, completados: 0, ultimoAcesso: p.updated_at };
        }
        acc[p.user_id].total++;
        if (p.completado) acc[p.user_id].completados++;
        if (p.updated_at && (!acc[p.user_id].ultimoAcesso || new Date(p.updated_at) > new Date(acc[p.user_id].ultimoAcesso))) {
          acc[p.user_id].ultimoAcesso = p.updated_at;
        }
        return acc;
      }, {} as Record<string, { total: number; completados: number; ultimoAcesso: string }>);

      const topUsuarios = Object.entries(userEngagement || {})
        .map(([userId, stats]) => ({
          userId,
          nome: users?.find(u => u.id === userId)?.nome_completo || "Usuário",
          videosAssistidos: stats.total,
          videosConcluidos: stats.completados,
          ultimoAcesso: stats.ultimoAcesso,
        }))
        .sort((a, b) => b.videosAssistidos - a.videosAssistidos)
        .slice(0, 5);

      // Calcular média de avaliações
      const mediaAvaliacoes = ratings && ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : "0.0";

      // Calcular tarefas por status
      const tarefasPorStatus = {
        pendente: todasTarefas?.filter(t => t.status === "pendente").length || 0,
        em_andamento: todasTarefas?.filter(t => t.status === "em_andamento").length || 0,
        concluida: todasTarefas?.filter(t => t.status === "concluida").length || 0,
      };

      // Calcular projetos em andamento
      const projetosEmAndamento = projetos?.filter(p => p.status === "em_andamento" || p.status === "planejamento").length || 0;

      return {
        alertas: {
          tarefasAtrasadas: tarefasAtrasadas?.length || 0,
          duvidasPendentes: duvidasPendentes?.length || 0,
          diagnosticosIncompletos: diagnosticosIncompletos?.length || 0,
        },
        crescimento: {
          novosUsuarios7d,
          novosUsuarios30d,
          usuariosAtivos7d,
          usuariosAtivos30d,
          totalUsuarios: users?.length || 0,
          usuariosAtivos: users?.filter(u => u.conta_ativa).length || 0,
        },
        distribuicaoPlanos,
        mentoria: {
          projetosEmAndamento,
          tarefasPorStatus,
          sessoesAgendadas: sessoesAgendadas?.length || 0,
        },
        conteudo: {
          trilhasAtivas: trilhas?.length || 0,
          modulosAtivos: modulos?.length || 0,
          videosAtivos: videos?.length || 0,
          ferramentasAtivas: ferramentas?.length || 0,
          mediaAvaliacoes,
        },
        topUsuarios,
      };
    },
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });
}
