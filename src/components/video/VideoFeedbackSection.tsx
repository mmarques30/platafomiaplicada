import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useVideoFeedbacks, useCreateComment } from "@/hooks/useVideoFeedbacks";

interface VideoFeedbackSectionProps {
  videoId: string;
}

export function VideoFeedbackSection({ videoId }: VideoFeedbackSectionProps) {
  const [comentario, setComentario] = useState("");
  const { data: feedbacks } = useVideoFeedbacks(videoId);
  const createComment = useCreateComment(videoId);

  const comentarios = feedbacks?.filter((f) => f.tipo === "comentario") || [];

  const handleComment = () => {
    if (comentario.trim()) {
      createComment.mutate(comentario, {
        onSuccess: () => setComentario(""),
      });
    }
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
            <div key={c.id} className="flex gap-3 pb-4 border-b last:border-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {((c as any).profiles?.nome_completo?.charAt(0)) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
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
                  </p>
                </div>
                <p className="text-sm">
                  {c.comentario}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
