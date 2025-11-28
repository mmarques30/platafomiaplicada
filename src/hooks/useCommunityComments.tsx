import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles: {
    nome_completo: string;
    avatar_url: string | null;
    nivel_comunidade: number;
  };
}

export function useCommunityComments(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["community-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_comments")
        .select(`
          *,
          profiles!community_comments_user_id_fkey(nome_completo, avatar_url, nivel_comunidade)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CommunityComment[];
    },
    enabled: !!postId,
  });

  const createComment = useMutation({
    mutationFn: async (newComment: {
      content: string;
      parent_id?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("community_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.content,
          parent_id: newComment.parent_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Award points for commenting
      await supabase.rpc("add_community_points" as any, {
        p_user_id: user.id,
        p_points: 5,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comentário adicionado!");
    },
    onError: () => {
      toast.error("Erro ao adicionar comentário");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comentário excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir comentário");
    },
  });

  return {
    comments: comments || [],
    isLoading,
    createComment: createComment.mutate,
    deleteComment: deleteComment.mutate,
    isCreating: createComment.isPending,
  };
}
