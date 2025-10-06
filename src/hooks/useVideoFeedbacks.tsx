import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useVideoFeedbacks(videoId: string) {
  return useQuery({
    queryKey: ["video-feedbacks", videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_feedbacks")
        .select("*, profiles(nome_completo)")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleLike(videoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar se já existe like
      const { data: existingLike } = await supabase
        .from("video_feedbacks")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .eq("tipo", "like")
        .maybeSingle();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from("video_feedbacks")
          .delete()
          .eq("id", existingLike.id);
        
        if (error) throw error;
        return { action: "removed" };
      } else {
        // Adiciona like
        const { error } = await supabase
          .from("video_feedbacks")
          .insert({
            video_id: videoId,
            user_id: user.id,
            tipo: "like",
          });
        
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["video-feedbacks", videoId] });
      toast.success(data.action === "added" ? "Curtida adicionada!" : "Curtida removida!");
    },
  });
}

export function useCreateComment(videoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comentario: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("video_feedbacks")
        .insert({
          video_id: videoId,
          user_id: user.id,
          tipo: "comentario",
          comentario,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-feedbacks", videoId] });
      toast.success("Comentário adicionado!");
    },
  });
}

export function useUserLikeStatus(videoId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-like", videoId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await supabase
        .from("video_feedbacks")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .eq("tipo", "like")
        .maybeSingle();

      return !!data;
    },
    enabled: !!user,
  });
}
