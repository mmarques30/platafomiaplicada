import { useQuery } from "@tanstack/react-query";
import { Trophy, Eye, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TickerStat {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function FreeUsersTicker() {
  // Buscar estatísticas de visitantes
  const { data: stats } = useQuery({
    queryKey: ['free-users-stats'],
    queryFn: async () => {
      // Buscar top visitante engajado (com mais posts/comentários)
      const { data: topVisitante } = await supabase
        .from('profiles')
        .select(`
          id,
          nome_completo,
          pontos_comunidade
        `)
        .eq('is_visitante', true)
        .eq('conta_ativa', true)
        .order('pontos_comunidade', { ascending: false })
        .limit(1)
        .single();

      // Buscar material mais acessado
      const { data: topMaterial } = await supabase
        .from('content_access_logs')
        .select('content_title, content_id')
        .eq('content_type', 'material_gratuito')
        .limit(100);

      // Contar acessos por material
      const materialCounts: Record<string, { title: string; count: number }> = {};
      topMaterial?.forEach((log) => {
        if (log.content_title) {
          if (!materialCounts[log.content_id]) {
            materialCounts[log.content_id] = { title: log.content_title, count: 0 };
          }
          materialCounts[log.content_id].count++;
        }
      });

      const topMaterialEntry = Object.values(materialCounts).sort((a, b) => b.count - a.count)[0];

      // Buscar total de visitantes ativos
      const { count: totalVisitantes } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_visitante', true)
        .eq('conta_ativa', true);

      // Buscar conteúdo mais visualizado
      const { data: topConteudo } = await supabase
        .from('content_access_logs')
        .select('content_title, content_id')
        .eq('content_type', 'conteudo_dashboard')
        .limit(100);

      const conteudoCounts: Record<string, { title: string; count: number }> = {};
      topConteudo?.forEach((log) => {
        if (log.content_title) {
          if (!conteudoCounts[log.content_id]) {
            conteudoCounts[log.content_id] = { title: log.content_title, count: 0 };
          }
          conteudoCounts[log.content_id].count++;
        }
      });

      const topConteudoEntry = Object.values(conteudoCounts).sort((a, b) => b.count - a.count)[0];

      return {
        topVisitante: topVisitante ? {
          nome: topVisitante.nome_completo?.split(' ')[0] || 'Visitante',
          pontos: topVisitante.pontos_comunidade || 0
        } : null,
        topMaterial: topMaterialEntry ? {
          titulo: topMaterialEntry.title,
          acessos: topMaterialEntry.count
        } : null,
        totalVisitantes: totalVisitantes || 0,
        topConteudo: topConteudoEntry ? {
          titulo: topConteudoEntry.title,
          views: topConteudoEntry.count
        } : null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const tickerStats: TickerStat[] = [
    {
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      label: stats?.topVisitante?.nome || 'Top Visitante',
      value: `${stats?.topVisitante?.pontos || 0} pts`,
    },
    {
      icon: <Eye className="h-4 w-4 text-blue-500" />,
      label: stats?.topMaterial?.titulo?.slice(0, 20) || 'Material',
      value: `${stats?.topMaterial?.acessos || 0} acessos`,
    },
    {
      icon: <Star className="h-4 w-4 text-primary" />,
      label: stats?.topConteudo?.titulo?.slice(0, 20) || 'Conteúdo',
      value: `${stats?.topConteudo?.views || 0} views`,
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      label: 'Comunidade',
      value: `${stats?.totalVisitantes || 0} membros`,
    },
  ];

  return (
    <section className="mt-6">
      <div className="bg-card/50 border rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 p-4">
          {tickerStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg"
            >
              {stat.icon}
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {stat.label}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
