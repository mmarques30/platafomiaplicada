import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Clock, Flame, Target, FileText, Award } from "lucide-react";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { useMinhasRespostas } from "@/hooks/useExercicios";

export default function Evolucao() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: progressoVideos, isLoading: loadingVideos } = useQuery({
    queryKey: ["progresso-geral"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progresso_videos")
        .select("*, videos(duracao)")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: trilhas, isLoading: loadingTrilhas } = useQuery({
    queryKey: ["progresso-trilhas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("*, videos(id, duracao)")
        .eq("ativo", true);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: certificados } = useMeusCertificados();
  const { data: respostas } = useMinhasRespostas();

  const videosCompletados = progressoVideos?.filter(p => p.completado).length || 0;
  const horasEstudo = Math.round((progressoVideos?.reduce((acc, p) => {
    const duracao = p.videos?.duracao || 0;
    return acc + (p.completado ? duracao : p.tempo_assistido || 0);
  }, 0) || 0) / 3600);

  const getProgressoPorTrilha = (trilhaId: string) => {
    const videosDaTrilha = trilhas?.find(t => t.id === trilhaId)?.videos || [];
    if (videosDaTrilha.length === 0) return 0;
    
    const completados = progressoVideos?.filter(p => 
      p.completado && videosDaTrilha.some(v => v.id === p.video_id)
    ).length || 0;
    
    return Math.round((completados / videosDaTrilha.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'default';
      case 'reprovado': return 'destructive';
      case 'em_avaliacao': return 'secondary';
      default: return 'outline';
    }
  };

  if (loadingVideos || loadingTrilhas) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Evolução</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e conquistas</p>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vídeos Assistidos</p>
                <p className="text-3xl font-bold">{videosCompletados}</p>
              </div>
              <Video className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas de Estudo</p>
                <p className="text-3xl font-bold">{horasEstudo}h</p>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias Seguidos</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Flame className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso por Trilha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progresso por Trilha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {trilhas?.map((trilha) => {
            const progresso = getProgressoPorTrilha(trilha.id);
            return (
              <div key={trilha.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{trilha.titulo}</span>
                  <span className="text-sm text-muted-foreground">{progresso}%</span>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Exercícios Práticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exercícios Práticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!respostas || respostas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum exercício respondido ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {respostas.map((resposta) => (
                <div key={resposta.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{resposta.exercicios_praticos?.titulo}</p>
                    {resposta.feedback_mentor && (
                      <p className="text-sm text-muted-foreground mt-1">{resposta.feedback_mentor}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {resposta.nota !== null && (
                      <span className="font-semibold">{resposta.nota}/100</span>
                    )}
                    <Badge variant={getStatusColor(resposta.status)}>
                      {resposta.status === 'pendente' && 'Pendente'}
                      {resposta.status === 'em_avaliacao' && 'Em Avaliação'}
                      {resposta.status === 'aprovado' && 'Aprovado'}
                      {resposta.status === 'reprovado' && 'Reprovado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Meus Certificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!certificados || certificados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum certificado disponível ainda. Continue estudando!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificados.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{cert.trilhas?.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{cert.titulo}</p>
                      </div>
                      <Progress value={cert.progresso} className="h-2" />
                      <div className="flex items-center justify-between">
                        <Badge variant={cert.status === 'disponivel' ? 'default' : 'secondary'}>
                          {cert.status === 'disponivel' ? 'Disponível' : `${cert.progresso}% concluído`}
                        </Badge>
                        {cert.status === 'disponivel' && (
                          <Button size="sm">Baixar PDF</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
