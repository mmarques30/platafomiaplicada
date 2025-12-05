import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useVideoRating(videoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar rating médio do vídeo
  const { data: averageRating } = useQuery({
    queryKey: ["video-average-rating", videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_ratings")
        .select("rating")
        .eq("video_id", videoId);

      if (error) throw error;

      if (!data || data.length === 0) return { average: 0, count: 0 };

      const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
      return {
        average: Math.round(sum / data.length),
        count: data.length,
      };
    },
    enabled: !!videoId,
  });

  // Buscar rating do usuário atual
  const { data: userRating } = useQuery({
    queryKey: ["video-user-rating", videoId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("video_ratings")
        .select("*")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!videoId,
  });

  // Mutation para criar/atualizar rating
  const setRating = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: existing } = await supabase
        .from("video_ratings")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("video_ratings")
          .update({ rating })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("video_ratings")
          .insert({
            video_id: videoId,
            user_id: user.id,
            rating,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-average-rating", videoId] });
      queryClient.invalidateQueries({ queryKey: ["video-user-rating", videoId, user?.id] });
      toast.success("Avaliação salva com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar avaliação");
    },
  });

  return {
    averageRating: averageRating?.average || 0,
    ratingCount: averageRating?.count || 0,
    userRating: userRating?.rating || 0,
    setRating: setRating.mutate,
    isLoading: setRating.isPending,
  };
}
