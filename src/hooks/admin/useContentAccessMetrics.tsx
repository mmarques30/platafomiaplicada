import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VisitorStat {
  email: string;
  totalAccesses: number;
  lastAccess: string;
  videoCount: number;
  materialCount: number;
  contentsList: string[];
}

export function useContentAccessMetrics() {
  return useQuery({
    queryKey: ["content-access-metrics"],
    queryFn: async () => {
      // Buscar emails de visitantes reais
      const { data: visitantes, error: visitantesError } = await supabase
        .from('profiles')
        .select('email')
        .eq('is_visitante', true);

      if (visitantesError) throw visitantesError;

      const visitanteEmails = new Set(visitantes?.map(v => v.email) || []);

      // Buscar todos os logs
      const { data: allLogs, error } = await supabase
        .from('content_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false });

      if (error) throw error;

      // Filtrar apenas logs de visitantes reais
      const logsVisitantes = allLogs?.filter(log => visitanteEmails.has(log.user_email)) || [];

      // Métricas gerais (apenas visitantes)
      const totalAccesses = logsVisitantes.length;
      const uniqueEmails = new Set(
        logsVisitantes.filter(l => l.user_email !== 'anônimo').map(l => l.user_email)
      );
      const uniqueUsers = uniqueEmails.size;

      // Acessos últimos 7 dias (apenas visitantes)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const accessesLast7Days = logsVisitantes.filter(l => 
        new Date(l.accessed_at) >= sevenDaysAgo
      ).length;

      // Média por usuário
      const averagePerUser = uniqueUsers > 0 
        ? Math.round((totalAccesses / uniqueUsers) * 10) / 10 
        : 0;

      // TOP 10 conteúdos mais acessados por visitantes (agregado)
      const contentCounts: Record<string, { 
        count: number; 
        title: string; 
        type: string;
      }> = {};
      
      logsVisitantes.forEach(log => {
        if (!contentCounts[log.content_id]) {
          contentCounts[log.content_id] = { 
            count: 0, 
            title: log.content_title || 'Sem título', 
            type: log.content_type 
          };
        }
        contentCounts[log.content_id].count++;
      });
      
      const topContent = Object.entries(contentCounts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Acessos por visitante (para coluna na tabela de visitantes)
      const accessesByUser: Record<string, number> = {};
      logsVisitantes.forEach(log => {
        accessesByUser[log.user_email] = (accessesByUser[log.user_email] || 0) + 1;
      });

      // TODOS os visitantes com estatísticas detalhadas (não só top 10)
      const userStats: Record<string, VisitorStat> = {};

      logsVisitantes.forEach(log => {
        if (log.user_email === 'anônimo') return;
        
        if (!userStats[log.user_email]) {
          userStats[log.user_email] = {
            email: log.user_email,
            totalAccesses: 0,
            lastAccess: log.accessed_at,
            videoCount: 0,
            materialCount: 0,
            contentsList: [],
          };
        }
        
        userStats[log.user_email].totalAccesses++;
        
        // Atualizar último acesso se mais recente
        if (new Date(log.accessed_at) > new Date(userStats[log.user_email].lastAccess)) {
          userStats[log.user_email].lastAccess = log.accessed_at;
        }
        
        // Contar por tipo
        if (log.content_type === 'video') {
          userStats[log.user_email].videoCount++;
        } else {
          userStats[log.user_email].materialCount++;
        }

        // Adicionar conteúdo à lista (sem duplicatas)
        const contentTitle = log.content_title || 'Sem título';
        if (!userStats[log.user_email].contentsList.includes(contentTitle)) {
          userStats[log.user_email].contentsList.push(contentTitle);
        }
      });

      // Ordenar todos os visitantes por total de acessos
      const allVisitors = Object.values(userStats)
        .sort((a, b) => b.totalAccesses - a.totalAccesses);

      // Top 10 para exibição inicial
      const topVisitors = allVisitors.slice(0, 10);

      return {
        totalAccesses,
        uniqueUsers,
        accessesLast7Days,
        averagePerUser,
        topContent,
        accessesByUser,
        topVisitors,
        allVisitors, // Todos os visitantes para exportação e tabela expandida
        allLogs: logsVisitantes,
      };
    },
  });
}
