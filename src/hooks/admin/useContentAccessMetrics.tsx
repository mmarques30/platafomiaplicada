import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useContentAccessMetrics() {
  return useQuery({
    queryKey: ["content-access-metrics"],
    queryFn: async () => {
      // Buscar todos os logs
      const { data: allLogs, error } = await supabase
        .from('content_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false });

      if (error) throw error;

      // Métricas gerais
      const totalAccesses = allLogs?.length || 0;
      const uniqueEmails = new Set(
        allLogs?.filter(l => l.user_email !== 'anônimo').map(l => l.user_email)
      );
      const uniqueUsers = uniqueEmails.size;

      // Acessos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const accessesLast7Days = allLogs?.filter(l => 
        new Date(l.accessed_at) >= sevenDaysAgo
      ).length || 0;

      // Média por usuário
      const averagePerUser = uniqueUsers > 0 
        ? Math.round((totalAccesses / uniqueUsers) * 10) / 10 
        : 0;

      // TOP 10 conteúdos mais acessados (agregado)
      const contentCounts: Record<string, { 
        count: number; 
        title: string; 
        type: string;
      }> = {};
      
      allLogs?.forEach(log => {
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

      // Acessos por usuário (para coluna na tabela de visitantes)
      const accessesByUser: Record<string, number> = {};
      allLogs?.forEach(log => {
        accessesByUser[log.user_email] = (accessesByUser[log.user_email] || 0) + 1;
      });

      // Ranking de visitantes com mais acessos
      const userStats: Record<string, {
        email: string;
        totalAccesses: number;
        lastAccess: string;
        videoCount: number;
        materialCount: number;
      }> = {};

      allLogs?.forEach(log => {
        if (log.user_email === 'anônimo') return;
        
        if (!userStats[log.user_email]) {
          userStats[log.user_email] = {
            email: log.user_email,
            totalAccesses: 0,
            lastAccess: log.accessed_at,
            videoCount: 0,
            materialCount: 0,
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
      });

      const topVisitors = Object.values(userStats)
        .sort((a, b) => b.totalAccesses - a.totalAccesses)
        .slice(0, 10);

      return {
        totalAccesses,
        uniqueUsers,
        accessesLast7Days,
        averagePerUser,
        topContent,
        accessesByUser,
        topVisitors,
        allLogs: allLogs || [],
      };
    },
  });
}
