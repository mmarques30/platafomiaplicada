import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { VideoFeedbackSection } from "@/components/video/VideoFeedbackSection";
import { VideoRatingInput } from "@/components/video/VideoRatingInput";
import { VideoMaterialsList } from "@/components/video/VideoMaterialsList";
import { useVideoRating } from "@/hooks/useVideoRating";

export default function VideoPlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { averageRating, ratingCount, userRating, setRating } = useVideoRating(id!);

  const parseMateriais = (materiais: any): any[] => {
    if (!materiais) return [];
    if (Array.isArray(materiais)) return materiais;
    if (typeof materiais === 'string') {
      try {
        const parsed = JSON.parse(materiais);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          modulo:modulos(
            id,
            titulo,
            trilha:trilhas(
              id,
              titulo
            )
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: progresso } = useQuery({
    queryKey: ["progresso", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data } = await supabase
        .from("progresso_videos")
        .select("*")
        .eq("video_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      return data;
    },
    enabled: !!user && !!id,
  });

  const salvarProgressoMutation = useMutation({
    mutationFn: async ({ tempo, completado }: { tempo: number; completado: boolean }) => {
      if (!user || !id) return;

      const { error } = await supabase
        .from("progresso_videos")
        .upsert({
          user_id: user.id,
          video_id: id,
          tempo_assistido: tempo,
          completado,
          ultima_visualizacao: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progresso", id, user?.id] });
    },
  });

  const marcarComoConcluidoMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) return;

      const { error } = await supabase
        .from("progresso_videos")
        .upsert({
          user_id: user.id,
          video_id: id,
          completado: true,
          tempo_assistido: video?.duracao || 0,
          ultima_visualizacao: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vídeo marcado como concluído!");
      queryClient.invalidateQueries({ queryKey: ["progresso", id, user?.id] });
    },
  });


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!video) {
    return <div>Vídeo não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/trilhas">Trilhas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/trilhas/${video.modulo.trilha.id}`}>
                {video.modulo.trilha.titulo}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{video.titulo}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                {video.thumbnail_customizado_url ? (
                  <div className="relative aspect-video bg-black cursor-pointer group">
                    <img 
                      src={video.thumbnail_customizado_url} 
                      alt={video.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.youtube_id}?start=${progresso?.tempo_assistido || 0}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtube_id}?start=${progresso?.tempo_assistido || 0}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{video.titulo}</CardTitle>
                <CardDescription className="space-y-2">
                  <div>{video.modulo.titulo}</div>
                  <div className="flex items-center gap-4 text-sm">
                    {video.duracao && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(video.duracao / 60)} min</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <VideoRatingInput
                        rating={userRating}
                        onRatingChange={setRating}
                      />
                      <span className="text-muted-foreground">
                        ({ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {!progresso?.completado && (
                    <Button 
                      onClick={() => marcarComoConcluidoMutation.mutate()}
                      disabled={marcarComoConcluidoMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                  )}
                  {progresso?.completado && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Vídeo concluído
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Informações da aula</TabsTrigger>
                    <TabsTrigger value="comments">Comentários</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-semibold mb-2">Descrição</h3>
                      <p className="text-muted-foreground">{video.descricao}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Materiais de Apoio</h3>
                      <VideoMaterialsList materiais={parseMateriais(video.materiais)} />
                    </div>
                  </TabsContent>
                  <TabsContent value="comments" className="mt-4">
                    <VideoFeedbackSection videoId={id!} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Próximos Vídeos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Navegação para próximos vídeos será implementada aqui
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}