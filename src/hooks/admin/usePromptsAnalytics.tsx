import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Periodo = '7d' | '30d' | '90d';

export interface PromptCopyStat {
  id: string;
  titulo: string;
  copias: number;
  percentualMudanca: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface PromptsAnalyticsData {
  totalCopias: number;
  mediaDiaria: number;
  tendenciaGeral: number;
  topPrompts: PromptCopyStat[];
  copiasPorDia: { data: string; copias: number }[];
}

function getDaysFromPeriodo(periodo: Periodo): number {
  switch (periodo) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
}

export function usePromptsAnalytics(periodo: Periodo) {
  return useQuery({
    queryKey: ['prompts-analytics', periodo],
    queryFn: async (): Promise<PromptsAnalyticsData> => {
      const days = getDaysFromPeriodo(periodo);
      const now = new Date();
      const periodoInicio = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const periodoAnteriorInicio = new Date(periodoInicio.getTime() - days * 24 * 60 * 60 * 1000);

      // Buscar logs do período atual (usar any para tabela nova)
      const { data: logsAtuais, error } = await (supabase
        .from('prompt_copy_logs' as any) as any)
        .select('prompt_id, prompt_titulo, copied_at')
        .gte('copied_at', periodoInicio.toISOString());

      if (error) throw error;

      // Buscar logs do período anterior para comparação
      const { data: logsAnteriores } = await (supabase
        .from('prompt_copy_logs' as any) as any)
        .select('prompt_id, prompt_titulo, copied_at')
        .gte('copied_at', periodoAnteriorInicio.toISOString())
        .lt('copied_at', periodoInicio.toISOString());

      // Calcular total e média
      const totalCopias = logsAtuais?.length || 0;
      const totalAnteriores = logsAnteriores?.length || 0;
      const mediaDiaria = Math.round(totalCopias / days);

      // Calcular tendência geral
      const tendenciaGeral = totalAnteriores > 0 
        ? Math.round(((totalCopias - totalAnteriores) / totalAnteriores) * 100)
        : (totalCopias > 0 ? 100 : 0);

      // Agrupar por prompt
      const promptsCount: Record<string, { id: string; titulo: string; count: number }> = {};
      const promptsCountAnterior: Record<string, number> = {};

      logsAtuais?.forEach(log => {
        if (!promptsCount[log.prompt_id]) {
          promptsCount[log.prompt_id] = { id: log.prompt_id, titulo: log.prompt_titulo, count: 0 };
        }
        promptsCount[log.prompt_id].count++;
      });

      logsAnteriores?.forEach(log => {
        promptsCountAnterior[log.prompt_id] = (promptsCountAnterior[log.prompt_id] || 0) + 1;
      });

      // Top prompts com tendência
      const topPrompts: PromptCopyStat[] = Object.values(promptsCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(p => {
          const anterior = promptsCountAnterior[p.id] || 0;
          const percentualMudanca = anterior > 0 
            ? Math.round(((p.count - anterior) / anterior) * 100)
            : (p.count > 0 ? 100 : 0);
          
          return {
            id: p.id,
            titulo: p.titulo,
            copias: p.count,
            percentualMudanca: Math.abs(percentualMudanca),
            tendencia: percentualMudanca > 0 ? 'up' : percentualMudanca < 0 ? 'down' : 'stable',
          };
        });

      // Agrupar cópias por dia
      const copiasPorDiaMap: Record<string, number> = {};
      logsAtuais?.forEach(log => {
        const data = new Date(log.copied_at).toISOString().split('T')[0];
        copiasPorDiaMap[data] = (copiasPorDiaMap[data] || 0) + 1;
      });

      const copiasPorDia = Object.entries(copiasPorDiaMap)
        .map(([data, copias]) => ({ data, copias }))
        .sort((a, b) => a.data.localeCompare(b.data));

      return {
        totalCopias,
        mediaDiaria,
        tendenciaGeral,
        topPrompts,
        copiasPorDia,
      };
    },
  });
}
