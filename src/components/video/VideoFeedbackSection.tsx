import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useVideoFeedbacks, useToggleLike, useCreateComment, useUserLikeStatus } from "@/hooks/useVideoFeedbacks";

interface VideoFeedbackSectionProps {
  videoId: string;
}

export function VideoFeedbackSection({ videoId }: VideoFeedbackSectionProps) {
  const [comentario, setComentario] = useState("");
  const { data: feedbacks } = useVideoFeedbacks(videoId);
  const { data: userLiked } = useUserLikeStatus(videoId);
  const toggleLike = useToggleLike(videoId);
  const createComment = useCreateComment(videoId);

  const likes = feedbacks?.filter((f) => f.tipo === "like") || [];
  const comentarios = feedbacks?.filter((f) => f.tipo === "comentario") || [];

  const handleLike = () => {
    toggleLike.mutate();
  };

  const handleComment = () => {
    if (comentario.trim()) {
      createComment.mutate(comentario, {
        onSuccess: () => setComentario(""),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Seção de Like */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant={userLiked ? "default" : "outline"}
            size="lg"
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className="w-full transition-all hover:scale-105"
          >
            <Heart
              className={`h-5 w-5 mr-2 ${userLiked ? "fill-current" : ""}`}
            />
            {likes.length} {likes.length === 1 ? "Curtida" : "Curtidas"}
          </Button>
        </CardContent>
      </Card>

      {/* Seção de Comentários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários ({comentarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário para adicionar comentário */}
          <div className="space-y-2">
            <Textarea
              placeholder="Adicione um comentário..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleComment}
              disabled={!comentario.trim() || createComment.isPending}
            >
              Comentar
            </Button>
          </div>

          {/* Lista de comentários */}
          <div className="space-y-4">
            {comentarios.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {((c as any).profiles?.nome_completo?.charAt(0)) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {((c as any).profiles?.nome_completo) || "Usuário"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {c.comentario}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
            {comentarios.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Seja o primeiro a comentar!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
