import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Target, ExternalLink, Clock, Save, Loader2, ClipboardList, Video, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  const [isFormatting, setIsFormatting] = useState(false);

  // Sincronizar estado com dados do banco quando carregar
  useEffect(() => {
    if (diagnostico) {
      setVideoCallUrl(diagnostico.video_call_url || "");
      setTranscricaoUrl(diagnostico.transcricao_call_url || "");
      setPlanoExecucaoUrl(diagnostico.link_plano_execucao || "");
      setDirecionalEntregas((diagnostico as any).direcional_entregas || "");
    }
  }, [diagnostico]);

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

  // Função para formatar texto com IA
  const formatarComIA = async () => {
    if (!direcionalEntregas.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite algum texto antes de formatar.",
        variant: "destructive",
      });
      return;
    }

    setIsFormatting(true);
    try {
      const { data, error } = await supabase.functions.invoke("formatar-direcional", {
        body: { texto: direcionalEntregas },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setDirecionalEntregas(data.texto_formatado);
      toast({
        title: "Texto formatado!",
        description: "Revise o resultado no preview abaixo.",
      });
    } catch (error: any) {
      console.error("Erro ao formatar:", error);
      toast({
        title: "Erro ao formatar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
    }
  };

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
            <Label htmlFor="plano-url">Link do Plano de Execução</Label>
            <Input
              id="plano-url"
              placeholder="https://..."
              value={planoExecucaoUrl}
              onChange={(e) => setPlanoExecucaoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="direcional">Direcional de Entregas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={formatarComIA}
                disabled={isFormatting || !direcionalEntregas.trim()}
              >
                {isFormatting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Formatar com IA
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole o texto bruto e clique em "Formatar com IA" para estruturar automaticamente
            </p>
            <Textarea
              id="direcional"
              placeholder="Cole aqui o texto do direcional de entregas e clique em 'Formatar com IA' para estruturar automaticamente..."
              value={direcionalEntregas}
              onChange={(e) => setDirecionalEntregas(e.target.value)}
              rows={8}
              className="resize-y font-mono text-sm"
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
                  <div className="bg-muted/50 rounded-lg p-4 text-sm prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {direcionalEntregas}
                    </ReactMarkdown>
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
