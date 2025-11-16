import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2, X, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useVideoFeedbacks, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/useVideoFeedbacks";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface VideoFeedbackSectionProps {
  videoId: string;
}

export function VideoFeedbackSection({ videoId }: VideoFeedbackSectionProps) {
  const [comentario, setComentario] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  
  const { data: feedbacks } = useVideoFeedbacks(videoId);
  const createComment = useCreateComment(videoId);
  const updateComment = useUpdateComment(videoId);
  const deleteComment = useDeleteComment(videoId);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const comentarios = feedbacks?.filter((f) => f.tipo === "comentario") || [];

  const handleComment = () => {
    if (comentario.trim()) {
      createComment.mutate(comentario, {
        onSuccess: () => setComentario(""),
      });
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.comentario);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedText("");
  };

  const handleSaveEdit = (commentId: string) => {
    if (editedText.trim()) {
      updateComment.mutate(
        { commentId, comentario: editedText },
        {
          onSuccess: () => {
            setEditingCommentId(null);
            setEditedText("");
          },
        }
      );
    }
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate(commentId);
  };

  const canModifyComment = (comment: any) => {
    return user && (comment.user_id === user.id || isAdmin);
  };

  const isEdited = (comment: any) => {
    const createdTime = new Date(comment.created_at).getTime();
    const updatedTime = new Date(comment.updated_at).getTime();
    return updatedTime - createdTime > 60000; // Mais de 1 minuto
  };

  return (
    <div className="space-y-4">
      {/* Formulário para adicionar comentário */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Adicione um comentário..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          className="flex-1"
        />
        <Button
          onClick={handleComment}
          disabled={!comentario.trim() || createComment.isPending}
          className="self-start"
        >
          Enviar
        </Button>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-4 mt-6">
        {comentarios.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Seja o primeiro a comentar!
          </p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 pb-4 border-b last:border-0 group">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {((c as any).profiles?.nome_completo?.charAt(0)) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {((c as any).profiles?.nome_completo) || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {isEdited(c) && " (editado)"}
                    </p>
                  </div>
                  
                  {canModifyComment(c) && editingCommentId !== c.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStartEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O comentário será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(c.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                
                {editingCommentId === c.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={3}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(c.id)}
                        disabled={!editedText.trim() || updateComment.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{c.comentario}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
