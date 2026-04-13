import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

function calcTrend(current: number, previous: number): { direction: 'up' | 'down' | 'stable'; value: number } {
  if (previous === 0 && current === 0) return { direction: 'stable', value: 0 };
  if (previous === 0) return { direction: 'up', value: 100 };
  const change = Math.round(((current - previous) / previous) * 100);
  if (change > 0) return { direction: 'up', value: change };
  if (change < 0) return { direction: 'down', value: Math.abs(change) };
  return { direction: 'stable', value: 0 };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7).toISOString();
      const fourteenDaysAgo = subDays(now, 14).toISOString();
      const thirtyDaysAgo = subDays(now, 30).toISOString();
      const sixtyDaysAgo = subDays(now, 60).toISOString();

      // Buscar usuários (excluir visitantes)
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, nome_completo, plano_mentoria, created_at, conta_ativa, data_conversao, ultimo_acesso")
        .eq("is_visitante", false);
      
      if (usersError) throw usersError;

      // Buscar visitantes separadamente
      const { data: visitantes, error: visitantesError } = await supabase
        .from("profiles")
        .select("id, nome_completo, created_at, conta_ativa")
        .eq("is_visitante", true);
      
      if (visitantesError) throw visitantesError;

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

      // Métricas da Mari (chat_messages) - com try/catch para não bloquear
      let mariData: { user_id: string; created_at: string | null; role: string }[] = [];
      try {
        const { data: chatMessages, error: chatError } = await supabase
          .from("chat_messages")
          .select("user_id, created_at, role")
          .gte("created_at", sixtyDaysAgo);
        
        if (!chatError && chatMessages) {
          mariData = chatMessages;
        }
      } catch {
        // silently fail - don't block dashboard
      }

      // Calcular distribuição por plano (separando business)
      const distribuicaoPlanos = {
        academy: users?.filter(u => u.plano_mentoria === "academy").length || 0,
        skills: users?.filter(u => u.plano_mentoria === "skills").length || 0,
        business_parceria: users?.filter(u => u.plano_mentoria === "business_parceria").length || 0,
        business_sistemas: users?.filter(u => u.plano_mentoria === "business_sistemas").length || 0,
        sem_plano: users?.filter(u => !u.plano_mentoria).length || 0,
      };

      // Calcular novos usuários
      const novosUsuarios7d = users?.filter(u => u.created_at && new Date(u.created_at) >= new Date(sevenDaysAgo)).length || 0;
      const novosUsuarios30d = users?.filter(u => u.created_at && new Date(u.created_at) >= new Date(thirtyDaysAgo)).length || 0;

      // Calcular novos usuários do período anterior (14d a 7d atrás)
      const novosUsuariosPrev7d = users?.filter(u => 
        u.created_at && new Date(u.created_at) >= new Date(fourteenDaysAgo) && new Date(u.created_at) < new Date(sevenDaysAgo)
      ).length || 0;

      // Calcular conversões de visitantes
      const conversoes7d = users?.filter(u => 
        u.data_conversao && new Date(u.data_conversao) >= new Date(sevenDaysAgo)
      ).length || 0;
      const conversoes30d = users?.filter(u => 
        u.data_conversao && new Date(u.data_conversao) >= new Date(thirtyDaysAgo)
      ).length || 0;

      // Calcular métricas de visitantes
      const totalVisitantes = visitantes?.length || 0;
      const novosVisitantes7d = visitantes?.filter(v => 
        v.created_at && new Date(v.created_at) >= new Date(sevenDaysAgo)
      ).length || 0;
      const novosVisitantes30d = visitantes?.filter(v => 
        v.created_at && new Date(v.created_at) >= new Date(thirtyDaysAgo)
      ).length || 0;

      // Taxa de conversão real
      const taxaConversao = (totalVisitantes + conversoes30d) > 0
        ? Math.round((conversoes30d / (totalVisitantes + conversoes30d)) * 100)
        : 0;

      // Calcular usuários ativos
      const usuariosAtivos7d = users?.filter(u => 
        u.ultimo_acesso && new Date(u.ultimo_acesso) >= new Date(sevenDaysAgo)
      ).length || 0;

      const usuariosAtivos30d = users?.filter(u => 
        u.ultimo_acesso && new Date(u.ultimo_acesso) >= new Date(thirtyDaysAgo)
      ).length || 0;

      // Usuários ativos no período anterior (14d a 7d atrás)
      const usuariosAtivosPrev7d = users?.filter(u => 
        u.ultimo_acesso && new Date(u.ultimo_acesso) >= new Date(fourteenDaysAgo) && new Date(u.ultimo_acesso) < new Date(sevenDaysAgo)
      ).length || 0;

      // Usuários inativos (conta_ativa=true mas sem acesso em 30d)
      const usuariosInativos = users?.filter(u => 
        u.conta_ativa === true && (!u.ultimo_acesso || new Date(u.ultimo_acesso) < new Date(thirtyDaysAgo))
      ).length || 0;

      // Tendências
      const tendencias = {
        novosUsuarios: calcTrend(novosUsuarios7d, novosUsuariosPrev7d),
        usuariosAtivos: calcTrend(usuariosAtivos7d, usuariosAtivosPrev7d),
      };

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

      // Calcular métricas da Mari
      const mariUsuariosUnicos = new Set(mariData.map(m => m.user_id));
      const mariMensagens7d = mariData.filter(m => 
        m.created_at && new Date(m.created_at) >= new Date(sevenDaysAgo)
      ).length;
      const totalMariUsuarios = mariUsuariosUnicos.size;
      const totalUsuariosCount = users?.length || 0;
      const taxaAdocaoMari = totalUsuariosCount > 0 
        ? Math.round((totalMariUsuarios / totalUsuariosCount) * 100) 
        : 0;
      const mediaMensagensPorUsuario = totalMariUsuarios > 0
        ? Math.round(mariData.length / totalMariUsuarios)
        : 0;

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
          totalUsuarios: totalUsuariosCount,
          usuariosAtivos: users?.filter(u => u.conta_ativa).length || 0,
          usuariosInativos,
        },
        tendencias,
        visitantes: {
          total: totalVisitantes,
          novos7d: novosVisitantes7d,
          novos30d: novosVisitantes30d,
          conversoes7d,
          conversoes30d,
          taxaConversao,
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
        mari: {
          totalUsuarios: totalMariUsuarios,
          mensagens7d: mariMensagens7d,
          taxaAdocao: taxaAdocaoMari,
          mediaMensagensPorUsuario,
        },
      };
    },
    refetchInterval: 5 * 60 * 1000,
  });
}
