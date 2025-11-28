import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string | null;
  content: string;
  media: any[];
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    nome_completo: string;
    avatar_url: string | null;
    nivel_comunidade: number;
  };
  community_categories: {
    name: string;
    emoji: string | null;
  } | null;
  user_has_liked?: boolean;
}

export function useCommunityPosts(categoryId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["community-posts", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select(`
          *,
          profiles!community_posts_user_id_fkey(nome_completo, avatar_url, nivel_comunidade),
          community_categories(name, emoji)
        `)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check if user has liked each post
      if (user) {
        const postIds = data.map((p: any) => p.id);
        const { data: reactions } = await supabase
          .from("community_reactions")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        const likedPostIds = new Set(reactions?.map((r) => r.post_id) || []);
        return data.map((post: any) => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id),
        }));
      }

      return data;
    },
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: async (newPost: {
      title?: string;
      content: string;
      category_id?: string;
      media?: any[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          user_id: user.id,
          title: newPost.title,
          content: newPost.content,
          category_id: newPost.category_id,
          media: newPost.media || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Award points for creating post
      await supabase.rpc("add_community_points" as any, {
        p_user_id: user.id,
        p_points: 10,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar post");
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir post");
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("community_reactions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from("community_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("community_reactions")
          .insert({
            post_id: postId,
            user_id: user.id,
            type: "like",
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  return {
    posts: posts || [],
    isLoading,
    createPost: createPost.mutate,
    deletePost: deletePost.mutate,
    toggleLike: toggleLike.mutate,
    isCreating: createPost.isPending,
  };
}
