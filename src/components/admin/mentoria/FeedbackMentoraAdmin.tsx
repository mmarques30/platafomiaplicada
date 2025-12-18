import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Target, ExternalLink, Clock, Save, Loader2, ClipboardList, Video } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FeedbackMentoraAdminProps {
  userId: string;
}

export function FeedbackMentoraAdmin({ userId }: FeedbackMentoraAdminProps) {
  const { diagnostico, isLoading } = useDiagnosticoAdmin(userId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [videoCallUrl, setVideoCallUrl] = useState("");
  const [transcricaoUrl, setTranscricaoUrl] = useState("");
  const [planoExecucaoUrl, setPlanoExecucaoUrl] = useState("");
  const [direcionalEntregas, setDirecionalEntregas] = useState("");

  // Sincronizar estado com dados do banco
  useState(() => {
    if (diagnostico) {
      setVideoCallUrl(diagnostico.video_call_url || "");
      setTranscricaoUrl(diagnostico.transcricao_call_url || "");
      setPlanoExecucaoUrl(diagnostico.link_plano_execucao || "");
      setDirecionalEntregas((diagnostico as any).direcional_entregas || "");
    }
  });

  // Mutation para salvar feedback
  const salvarFeedback = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("formulario_diagnostico")
        .upsert({
          user_id: userId,
          video_call_url: videoCallUrl || null,
          transcricao_call_url: transcricaoUrl || null,
          link_plano_execucao: planoExecucaoUrl || null,
          direcional_entregas: direcionalEntregas || null,
          feedback_mentora_em: new Date().toISOString(),
        } as any, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Feedback salvo",
        description: "Os materiais de feedback foram salvos com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Atualizar campos quando dados carregarem
  if (diagnostico && !videoCallUrl && !transcricaoUrl && !planoExecucaoUrl && !direcionalEntregas) {
    if (diagnostico.video_call_url) setVideoCallUrl(diagnostico.video_call_url);
    if (diagnostico.transcricao_call_url) setTranscricaoUrl(diagnostico.transcricao_call_url);
    if (diagnostico.link_plano_execucao) setPlanoExecucaoUrl(diagnostico.link_plano_execucao);
    if ((diagnostico as any).direcional_entregas) setDirecionalEntregas((diagnostico as any).direcional_entregas);
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasVideo = videoCallUrl || diagnostico?.video_call_url;
  const feedbackDate = diagnostico?.feedback_mentora_em
    ? format(new Date(diagnostico.feedback_mentora_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  return (
    <div className="space-y-6">
      {/* Formulário de Edição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Materiais de Feedback
          </CardTitle>
          <CardDescription>
            Adicione os links do vídeo da call, transcrição e plano de execução para o mentorado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">Link do Vídeo da Call (Google Drive)</Label>
            <Input
              id="video-url"
              placeholder="https://drive.google.com/file/d/..."
              value={videoCallUrl}
              onChange={(e) => setVideoCallUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcricao-url">Link da Transcrição (Google Drive)</Label>
            <Input
              id="transcricao-url"
              placeholder="https://drive.google.com/file/d/..."
              value={transcricaoUrl}
              onChange={(e) => setTranscricaoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plano-url">Link do Plano de Execução (Google Drive)</Label>
            <Input
              id="plano-url"
              placeholder="https://drive.google.com/file/d/..."
              value={planoExecucaoUrl}
              onChange={(e) => setPlanoExecucaoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direcional">Direcional de Entregas</Label>
            <Textarea
              id="direcional"
              placeholder="Descreva as próximas entregas, prazos e expectativas para o mentorado..."
              value={direcionalEntregas}
              onChange={(e) => setDirecionalEntregas(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <Button
            onClick={() => salvarFeedback.mutate()}
            disabled={salvarFeedback.isPending}
            className="w-full"
          >
            {salvarFeedback.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Preview do que o mentorado verá */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visualização do Mentorado</CardTitle>
          <CardDescription>
            Como o mentorado verá o feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasVideo && !transcricaoUrl && !planoExecucaoUrl && !direcionalEntregas ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum material adicionado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackDate && (
                <p className="text-sm text-muted-foreground">
                  Feedback enviado em {feedbackDate}
                </p>
              )}

              {/* Links - todos como botões externos */}
              <div className="grid gap-3 md:grid-cols-2">
                {hasVideo && (
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => window.open(videoCallUrl || diagnostico?.video_call_url || '', '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Gravação da Call
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                )}
                {transcricaoUrl && (
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => window.open(transcricaoUrl, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Transcrição da Call
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                )}
                {planoExecucaoUrl && (
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => window.open(planoExecucaoUrl, '_blank')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Plano de Execução
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </div>

              {/* Direcional de Entregas */}
              {direcionalEntregas && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Direcional de Entregas
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {direcionalEntregas}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
