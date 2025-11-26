import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useMinhaEvolucao = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["minha-evolucao", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalVideos: 0,
          totalProjetos: 0,
          totalFerramentas: 0,
          totalComentarios: 0,
          ferramentas: [],
          totalVisualizacoes: 0,
          totalCurtidas: 0,
        };
      }
      
      const [videos, projetos, ferramentas, comentarios] = await Promise.all([
        supabase
          .from("progresso_videos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completado", true),
        supabase
          .from("projetos_mentoria")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "concluido"),
        (supabase as any)
          .from("ferramentas_compartilhadas")
          .select("*")
          .eq("user_id", user.id)
          .eq("ativo", true),
        (supabase as any)
          .from("comentarios_videos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
      ]);
      
      const totalVisualizacoes = ferramentas.data?.reduce((sum: number, f: any) => sum + (f.visualizacoes || 0), 0) || 0;
      const totalCurtidas = ferramentas.data?.reduce((sum: number, f: any) => sum + (f.curtidas || 0), 0) || 0;
      
      return {
        totalVideos: videos.count || 0,
        totalProjetos: projetos.count || 0,
        totalFerramentas: ferramentas.data?.length || 0,
        totalComentarios: comentarios.count || 0,
        ferramentas: ferramentas.data || [],
        totalVisualizacoes,
        totalCurtidas,
      };
    },
    enabled: !!user?.id
  });
};
