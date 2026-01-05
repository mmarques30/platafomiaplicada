import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface TopAluno {
  id: string;
  nome: string;
  totalVideos: number;
  percentual: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface TopAula {
  id: string;
  titulo: string;
  visualizacoes: number;
  percentual: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface TopFerramenta {
  id: string;
  nome: string;
  avaliacao: number;
}

export interface DashboardRanking {
  topAlunos: TopAluno[];
  topAulas: TopAula[];
  topFerramentas: TopFerramenta[];
}

export function useDashboardRanking() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["dashboard-ranking"],
    queryFn: async (): Promise<DashboardRanking> => {
      // Buscar todas as queries em paralelo
      const [rankingResult, aulasResult, ferramentasResult] = await Promise.all([
        // Top aluno via view pública (bypass RLS)
        supabase
          .from("ranking_dashboard")
          .select("*")
          .order("total_videos", { ascending: false })
          .limit(1),
        
        // Top aulas mais assistidas (últimas 24h e 24h anteriores)
        supabase
          .from("progresso_videos")
          .select("video_id, videos!inner(id, titulo), created_at")
          .eq("completado", true),
        
        // Top 1 ferramenta mais bem avaliada
        supabase
          .from("ferramentas_ia")
          .select("id, nome, avaliacao")
          .eq("ativo", true)
          .order("avaliacao", { ascending: false })
          .limit(1),
      ]);

      // Processar top alunos da view
      const topAlunos: TopAluno[] = (rankingResult.data || []).map((item: any) => {
        const atual = item.videos_24h || 0;
        const anterior = item.videos_24h_anterior || 0;
        const percentual = anterior > 0 ? Math.round(((atual - anterior) / anterior) * 100) : (atual > 0 ? 100 : 0);
        const tendencia: 'up' | 'down' | 'stable' = percentual > 0 ? 'up' : percentual < 0 ? 'down' : 'stable';
        
        return {
          id: item.user_id,
          nome: abreviarNome(item.nome_completo || "Usuário"),
          totalVideos: item.total_videos || 0,
          percentual: Math.abs(percentual),
          tendencia,
        };
      });

      // Processar top aulas com cálculo de tendência
      const now = new Date();
      const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      
      const aulasCount: Record<string, { id: string; titulo: string; count: number; count24h: number; countAnterior: number }> = {};
      if (aulasResult.data) {
        aulasResult.data.forEach((item: any) => {
          const videoId = item.video_id;
          const titulo = item.videos?.titulo || "Vídeo";
          const createdAt = new Date(item.created_at);
          
          if (!aulasCount[videoId]) {
            aulasCount[videoId] = { id: videoId, titulo, count: 0, count24h: 0, countAnterior: 0 };
          }
          aulasCount[videoId].count++;
          
          if (createdAt >= h24ago) {
            aulasCount[videoId].count24h++;
          } else if (createdAt >= h48ago) {
            aulasCount[videoId].countAnterior++;
          }
        });
      }
      
      const topAulas = Object.values(aulasCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 1)
        .map((a) => {
          const percentual = a.countAnterior > 0 
            ? Math.round(((a.count24h - a.countAnterior) / a.countAnterior) * 100) 
            : (a.count24h > 0 ? 100 : 0);
          const tendencia: 'up' | 'down' | 'stable' = percentual > 0 ? 'up' : percentual < 0 ? 'down' : 'stable';
          
          return {
            id: a.id,
            titulo: truncarTexto(a.titulo, 20),
            visualizacoes: a.count,
            percentual: Math.abs(percentual),
            tendencia,
          };
        });

      // Top ferramentas
      const topFerramentas: TopFerramenta[] = (ferramentasResult.data || []).map((f: any) => ({
        id: f.id,
        nome: truncarTexto(f.nome, 15),
        avaliacao: f.avaliacao || 0,
      }));

      return { topAlunos, topAulas, topFerramentas };
    },
  });

  // Realtime subscription para atualizações em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('ranking-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'progresso_videos' },
        () => queryClient.invalidateQueries({ queryKey: ['dashboard-ranking'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ferramentas_ia' },
        () => queryClient.invalidateQueries({ queryKey: ['dashboard-ranking'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

function abreviarNome(nome: string): string {
  const partes = nome.trim().split(" ");
  if (partes.length === 1) return partes[0];
  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];
  return `${primeiro} ${ultimo.charAt(0)}.`;
}

function truncarTexto(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return texto.substring(0, max - 3) + "...";
}
