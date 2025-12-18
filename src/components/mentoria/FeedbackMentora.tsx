import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Target, ExternalLink, Clock, Play } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FeedbackMentoraProps {
  formulario: {
    video_call_url?: string | null;
    transcricao_call_url?: string | null;
    link_plano_execucao?: string | null;
    feedback_mentora_em?: string | null;
  } | null;
}

// Função para extrair embed URL de vídeo
function getEmbedUrl(url: string): string {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }
  return url;
}

export function FeedbackMentora({ formulario }: FeedbackMentoraProps) {
  const hasVideo = formulario?.video_call_url;
  const hasTranscricao = formulario?.transcricao_call_url;
  const hasPlano = formulario?.link_plano_execucao;
  const hasFeedback = hasVideo || hasTranscricao || hasPlano;
  const feedbackDate = formulario?.feedback_mentora_em
    ? format(new Date(formulario.feedback_mentora_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  if (!hasFeedback) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Aguardando Feedback</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Após a call de diagnóstico com a mentora, o vídeo da gravação, transcrição e seu plano de execução personalizado aparecerão aqui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vídeo da Call */}
      {hasVideo && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Gravação da Call de Diagnóstico</CardTitle>
            </div>
            {feedbackDate && (
              <CardDescription>
                Realizada em {feedbackDate}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={getEmbedUrl(formulario.video_call_url!)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materiais */}
      {(hasTranscricao || hasPlano) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Transcrição */}
          {hasTranscricao && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Transcrição da Call</h4>
                    <p className="text-sm text-muted-foreground">
                      Documento completo da call realizada
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(formulario.transcricao_call_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plano de Execução */}
          {hasPlano && (
            <Card className="hover:shadow-md transition-shadow border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Plano de Execução</h4>
                    <p className="text-sm text-muted-foreground">
                      Seu roadmap personalizado de aprendizado
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => window.open(formulario.link_plano_execucao!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Plano
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
