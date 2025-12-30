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
  updated_at: string;
  likes_count: number;
  user_has_liked: boolean;
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
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("community_comments")
        .select(`
          *,
          profiles!community_comments_user_id_fkey(nome_completo, avatar_url, nivel_comunidade)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch likes for comments
      const commentIds = commentsData.map(c => c.id);
      
      const { data: likesData } = await supabase
        .from("community_reactions")
        .select("comment_id, user_id")
        .in("comment_id", commentIds);

      // Map likes to comments
      const commentsWithLikes = commentsData.map(comment => {
        const commentLikes = likesData?.filter(l => l.comment_id === comment.id) || [];
        return {
          ...comment,
          likes_count: commentLikes.length,
          user_has_liked: user ? commentLikes.some(l => l.user_id === user.id) : false,
        };
      });

      return commentsWithLikes as CommunityComment[];
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

  const updateComment = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) throw new Error("Conteúdo não pode estar vazio");
      if (trimmedContent.length > 2000) throw new Error("Comentário muito longo");

      const { error } = await supabase
        .from("community_comments")
        .update({ content: trimmedContent })
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
      toast.success("Comentário atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar comentário");
    },
  });

  const toggleCommentLike = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Check if user already liked this comment
      const { data: existingLike } = await supabase
        .from("community_reactions")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from("community_reactions")
          .delete()
          .eq("id", existingLike.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from("community_reactions")
          .insert({
            comment_id: commentId,
            user_id: user.id,
            type: "like",
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
    },
  });

  return {
    comments: comments || [],
    isLoading,
    createComment: createComment.mutate,
    deleteComment: deleteComment.mutate,
    updateComment: updateComment.mutate,
    toggleCommentLike: toggleCommentLike.mutate,
    isCreating: createComment.isPending,
    isUpdating: updateComment.isPending,
  };
}
