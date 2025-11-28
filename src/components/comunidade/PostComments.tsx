import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCommunityComments } from "@/hooks/useCommunityComments";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { comments, createComment, deleteComment, isCreating } =
    useCommunityComments(postId);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment({ content: newComment });
    setNewComment("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-800">
      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="bg-zinc-800 border-zinc-700 text-zinc-200 min-h-[80px]"
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isCreating}
          size="sm"
          className="bg-[#9EB038] hover:bg-[#8a9d32] text-[#2F302B]"
        >
          Comentar
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const canDelete = user?.id === comment.user_id || isAdmin;

          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                  {getInitials(comment.profiles.nome_completo)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">
                    {comment.profiles.nome_completo}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Nível {comment.profiles.nivel_comunidade}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteComment(comment.id)}
                      className="ml-auto h-6 w-6 p-0 text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-zinc-300">{comment.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
