import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TopAluno {
  id: string;
  nome: string;
  totalVideos: number;
}

export interface TopAula {
  id: string;
  titulo: string;
  visualizacoes: number;
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
  return useQuery({
    queryKey: ["dashboard-ranking"],
    queryFn: async (): Promise<DashboardRanking> => {
      // Buscar todas as queries em paralelo
      const [alunosResult, aulasResult, ferramentasResult] = await Promise.all([
        // Top 3 alunos mais engajados (baseado em vídeos assistidos)
        supabase
          .from("progresso_videos")
          .select("user_id, profiles!inner(id, nome_completo)")
          .eq("completado", true),
        
        // Top 3 aulas mais assistidas
        supabase
          .from("progresso_videos")
          .select("video_id, videos!inner(id, titulo)")
          .eq("completado", true),
        
        // Top 3 ferramentas mais bem avaliadas
        supabase
          .from("ferramentas_ia")
          .select("id, nome, avaliacao")
          .eq("ativo", true)
          .order("avaliacao", { ascending: false })
          .limit(3),
      ]);

      // Processar top alunos
      const alunosCount: Record<string, { id: string; nome: string; count: number }> = {};
      if (alunosResult.data) {
        alunosResult.data.forEach((item: any) => {
          const userId = item.user_id;
          const nome = item.profiles?.nome_completo || "Usuário";
          if (!alunosCount[userId]) {
            alunosCount[userId] = { id: userId, nome, count: 0 };
          }
          alunosCount[userId].count++;
        });
      }
      const topAlunos = Object.values(alunosCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((a) => ({
          id: a.id,
          nome: abreviarNome(a.nome),
          totalVideos: a.count,
        }));

      // Processar top aulas
      const aulasCount: Record<string, { id: string; titulo: string; count: number }> = {};
      if (aulasResult.data) {
        aulasResult.data.forEach((item: any) => {
          const videoId = item.video_id;
          const titulo = item.videos?.titulo || "Vídeo";
          if (!aulasCount[videoId]) {
            aulasCount[videoId] = { id: videoId, titulo, count: 0 };
          }
          aulasCount[videoId].count++;
        });
      }
      const topAulas = Object.values(aulasCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((a) => ({
          id: a.id,
          titulo: truncarTexto(a.titulo, 20),
          visualizacoes: a.count,
        }));

      // Top ferramentas
      const topFerramentas: TopFerramenta[] = (ferramentasResult.data || []).map((f: any) => ({
        id: f.id,
        nome: f.nome,
        avaliacao: f.avaliacao || 0,
      }));

      return { topAlunos, topAulas, topFerramentas };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  });
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
