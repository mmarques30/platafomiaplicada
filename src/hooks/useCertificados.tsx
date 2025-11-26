import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export function useMeusCertificados() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["meus-certificados", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("certificados")
        .select("*, trilhas(titulo)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useAtualizarProgressoCertificado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ trilhaId }: { trilhaId: string }) => {
      // Calculate progress based on videos completed and exercises approved
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      // Get total videos in trilha
      const { data: videos } = await supabase
        .from("videos")
        .select("id")
        .eq("trilha_id", trilhaId)
        .eq("ativo", true);

      if (!videos) return;

      // Get completed videos
      const { data: progresso } = await supabase
        .from("progresso_videos")
        .select("video_id")
        .eq("user_id", user.user.id)
        .eq("completado", true)
        .in("video_id", videos.map(v => v.id));

      const videosProgress = videos.length > 0 
        ? ((progresso?.length || 0) / videos.length) * 100 
        : 0;

      // Get exercises stats (simplified - can be enhanced)
      const exercisesProgress = 80; // Placeholder - implement actual calculation

      const totalProgress = Math.min(100, Math.round((videosProgress + exercisesProgress) / 2));
      const newStatus = totalProgress >= 100 ? 'disponivel' : 'em_progresso';

      // Update or create certificado
      const { error } = await supabase
        .from("certificados")
        .upsert({
          user_id: user.user.id,
          trilha_id: trilhaId,
          titulo: "Certificado de Conclusão",
          progresso: totalProgress,
          status: newStatus,
          data_emissao: newStatus === 'disponivel' ? new Date().toISOString() : null,
          codigo_verificacao: newStatus === 'disponivel' ? `IAP-${Date.now()}` : null,
        }, {
          onConflict: 'user_id,trilha_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meus-certificados"] });
    },
    onError: (error: any) => toast.error("Erro ao atualizar certificado: " + error.message),
  });
}
