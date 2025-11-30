import { useState } from "react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useCommunityComments } from "@/hooks/useCommunityComments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pin, ChevronDown, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ModeracaoTab() {
  const { posts, isLoading, deletePost } = useCommunityPosts();
  const queryClient = useQueryClient();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const togglePin = useMutation({
    mutationFn: async ({ postId, pinned }: { postId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({ pinned: !pinned })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post atualizado!");
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Moderação de Posts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie posts da comunidade - fixar ou excluir
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum post na comunidade ainda
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">
                      {post.profiles.nome_completo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    {post.pinned && (
                      <Badge variant="secondary">Fixado</Badge>
                    )}
                  </div>

                  {post.title && (
                    <h4 className="font-semibold text-foreground mb-1">
                      {post.title}
                    </h4>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{post.likes_count} likes</span>
                    <span>{post.comments_count} comentários</span>
                  </div>

                  {post.comments_count > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedPostId(
                          expandedPostId === post.id ? null : post.id
                        )
                      }
                      className="mt-2 gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ver {post.comments_count} comentários
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedPostId === post.id ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      togglePin.mutate({
                        postId: post.id,
                        pinned: post.pinned,
                      })
                    }
                    className={
                      post.pinned
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Comments Section */}
              {expandedPostId === post.id && (
                <CommentsSection postId={post.id} />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const { comments, isLoading, deleteComment } = useCommunityComments(postId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground pl-4">Carregando comentários...</div>;
  }

  if (comments.length === 0) {
    return <div className="text-sm text-muted-foreground pl-4">Nenhum comentário</div>;
  }

  return (
    <div className="pl-4 mt-3 space-y-2 border-l-2 border-border">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start justify-between gap-2 p-2 rounded bg-muted/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {comment.profiles.nome_completo}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <p className="text-sm text-foreground">{comment.content}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteComment(comment.id)}
            className="text-red-500 hover:text-red-600 shrink-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
