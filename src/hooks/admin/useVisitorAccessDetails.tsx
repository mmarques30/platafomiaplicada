import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVisitorAccessDetails(userEmail: string | null) {
  return useQuery({
    queryKey: ["visitor-access-details", userEmail],
    queryFn: async () => {
      if (!userEmail) return null;

      const { data: logs, error } = await supabase
        .from('content_access_logs')
        .select('*')
        .eq('user_email', userEmail)
        .order('accessed_at', { ascending: false });

      if (error) throw error;

      // Agregar: quantas vezes cada conteúdo foi acessado
      const contentDetails: Record<string, {
        content_id: string;
        content_title: string;
        content_type: string;
        access_count: number;
        first_access: string;
        last_access: string;
      }> = {};

      logs?.forEach(log => {
        if (!contentDetails[log.content_id]) {
          contentDetails[log.content_id] = {
            content_id: log.content_id,
            content_title: log.content_title || 'Sem título',
            content_type: log.content_type,
            access_count: 0,
            first_access: log.accessed_at,
            last_access: log.accessed_at,
          };
        }
        contentDetails[log.content_id].access_count++;
        
        if (new Date(log.accessed_at) < new Date(contentDetails[log.content_id].first_access)) {
          contentDetails[log.content_id].first_access = log.accessed_at;
        }
        if (new Date(log.accessed_at) > new Date(contentDetails[log.content_id].last_access)) {
          contentDetails[log.content_id].last_access = log.accessed_at;
        }
      });

      return {
        totalAccesses: logs?.length || 0,
        uniqueContents: Object.keys(contentDetails).length,
        contentDetails: Object.values(contentDetails).sort((a, b) => b.access_count - a.access_count),
        recentLogs: logs?.slice(0, 20) || [], // Últimos 20 acessos
      };
    },
    enabled: !!userEmail,
  });
}
