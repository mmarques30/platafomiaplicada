import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Heart, Pencil, X, Check } from "lucide-react";
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
  const { comments, createComment, deleteComment, updateComment, toggleCommentLike, isCreating, isUpdating } =
    useCommunityComments(postId);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment({ content: newComment });
    setNewComment("");
  };

  const handleStartEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditValue(content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditValue("");
  };

  const handleSaveEdit = () => {
    if (!editingCommentId || !editValue.trim()) return;
    updateComment(
      { commentId: editingCommentId, content: editValue },
      { onSuccess: () => handleCancelEdit() }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isEdited = (comment: { created_at: string; updated_at: string }) => {
    return comment.updated_at && new Date(comment.updated_at) > new Date(comment.created_at);
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="min-h-[80px]"
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isCreating}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Comentar
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const canModify = user?.id === comment.user_id || isAdmin;
          const isEditingThis = editingCommentId === comment.id;

          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {getInitials(comment.profiles.nome_completo)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {comment.profiles.nome_completo}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Nível {comment.profiles.nivel_comunidade}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                  {isEdited(comment) && (
                    <span className="text-xs text-muted-foreground italic">(editado)</span>
                  )}

                  {canModify && !isEditingThis && (
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(comment.id, comment.content)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditingThis ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editValue.trim() || isUpdating}
                        className="h-7 px-2"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-7 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground">{comment.content}</p>
                )}
                
                {/* Like button */}
                {!isEditingThis && (
                  <button
                    onClick={() => toggleCommentLike(comment.id)}
                    className="flex items-center gap-1 mt-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart 
                      className={`h-3.5 w-3.5 ${comment.user_has_liked ? 'fill-primary text-primary' : ''}`} 
                    />
                    {comment.likes_count > 0 && (
                      <span className="text-xs">{comment.likes_count}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
