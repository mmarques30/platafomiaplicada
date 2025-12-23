import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { useContentVisibility } from "@/hooks/useContentVisibility";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Play, CheckCircle2, Clock, ChevronDown } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { VideoFeedbackSection } from "@/components/video/VideoFeedbackSection";
import { VideoRatingInput } from "@/components/video/VideoRatingInput";
import { VideoMaterialsList } from "@/components/video/VideoMaterialsList";
import { useVideoRating } from "@/hooks/useVideoRating";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { toast } from "sonner";
import { TrilhaOverview } from "@/components/shared/TrilhaOverview";

export default function TrilhaDetalhes() {
  const { id: rawId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Sanitiza o ID: decodifica e extrai apenas o UUID, removendo query strings corrompidas
  const decodedRawId = decodeURIComponent(rawId || '');
  const id = decodedRawId.split('?')[0];
  
  // Se a URL estava corrompida (%3Fvideo= no path), extrai o videoId de lá
  const videoIdFromCorruptedPath = decodedRawId.includes('?video=') 
    ? decodedRawId.split('?video=')[1]?.split('?')[0] 
    : null;
  
  // Prioriza searchParams, fallback para videoId extraído de path corrompido
  const currentVideoId = searchParams.get("video") || videoIdFromCorruptedPath;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const videoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { isVisitante, isLoading: loadingRole } = useContentVisibility();
  const [videosExpanded, setVideosExpanded] = useState(true);
  const [infoExpanded, setInfoExpanded] = useState(true);

  // Helper para garantir que materiais seja sempre um array
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

  const { data: trilha, isLoading } = useQuery({
    queryKey: ["trilha", id, isVisitante],
    queryFn: async () => {
      // Busca trilha sem !inner para evitar erro quando módulos não têm vídeos
      const { data, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          modulos(
            *,
            videos(*)
          )
        `)
        .eq("id", id)
        .eq("ativo", true)
        .order("ordem", { foreignTable: "modulos" })
        .order("ordem", { foreignTable: "modulos.videos" })
        .single();
      
      if (error) throw error;
      
      // Visitantes podem ver todas as trilhas (conteúdo é filtrado por vídeos/módulos)
      // Mentorados verificam visivel_mentorados
      if (!isVisitante && !data.visivel_mentorados) return null;
      
      return data;
    },
    enabled: !loadingRole,
  });

  const { data: progressData } = useQuery({
    queryKey: ["video-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("progresso_videos")
        .select("video_id, completado, tempo_assistido")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Filtra módulos e vídeos no JavaScript baseado em visibilidade e status ativo
  const modulosComVideos = (trilha?.modulos || [])
    .filter((modulo: any) => {
      if (!modulo.ativo) return false;
      if (isVisitante && !modulo.visivel_visitantes) return false;
      if (!isVisitante && !modulo.visivel_mentorados) return false;
      return true;
    })
    .map((modulo: any) => ({
      ...modulo,
      videos: (modulo.videos || []).filter((video: any) => {
        if (!video.ativo) return false;
        if (isVisitante && !video.visivel_visitantes) return false;
        if (!isVisitante && !video.visivel_mentorados) return false;
        return true;
      })
    }))
    .filter((modulo: any) => modulo.videos && modulo.videos.length > 0);

  // Get all videos from all modules
  const allVideos = modulosComVideos.flatMap(modulo => 
    modulo.videos?.map(video => ({ ...video, modulo })) || []
  ) || [];

  // Scroll to active video
  useEffect(() => {
    if (currentVideoId && videoRefs.current[currentVideoId]) {
      videoRefs.current[currentVideoId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentVideoId]);

  const handleVideoSelect = (videoId: string) => {
    setSearchParams({ video: videoId });
  };

  const currentVideo = allVideos.find(v => v.id === currentVideoId);

  const getVideoProgress = (videoId: string) => {
    return progressData?.find(p => p.video_id === videoId);
  };

  const formatDuration = (minutos?: number) => {
    if (!minutos) return "N/A";
    return `${minutos} min`;
  };

  const formatDataAula = (dataAula?: string | null) => {
    if (!dataAula) return null;
    try {
      return format(new Date(dataAula), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  };

  const { averageRating, ratingCount, userRating, setRating } = useVideoRating(currentVideoId || "");

  // Mutation para MARCAR como concluído (não toggle - apenas marca)
  const marcarConcluidoMutation = useMutation({
    mutationFn: async () => {
      if (!user || !currentVideoId) return;

      const { data: existing } = await supabase
        .from("progresso_videos")
        .select("id, completado")
        .eq("user_id", user.id)
        .eq("video_id", currentVideoId)
        .maybeSingle();

      // Se já está concluído, não fazer nada (evita toggle acidental)
      if (existing?.completado) {
        return true;
      }

      if (existing) {
        // Atualiza para concluído
        const { error } = await supabase
          .from("progresso_videos")
          .update({ completado: true })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Primeiro acesso: marca como concluído
        const { error } = await supabase
          .from("progresso_videos")
          .insert({
            user_id: user.id,
            video_id: currentVideoId,
            completado: true,
            tempo_assistido: 0,
          });

        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      toast.success("Vídeo marcado como concluído!");
      queryClient.invalidateQueries({ queryKey: ["video-progress", user?.id] });
    },
    onError: () => {
      toast.error("Erro ao atualizar status do vídeo");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trilha) {
    return <div>Trilha não encontrada</div>;
  }

  return (
    <div className="container py-4 md:py-6 px-4">
      <Link to="/trilhas">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Academy
        </Button>
      </Link>

      {/* Se não tem vídeo selecionado → TrilhaOverview */}
      {!currentVideoId && (
        <TrilhaOverview
          trilha={{
            titulo: trilha.titulo,
            descricao: trilha.descricao,
            categoria: trilha.categoria,
            bloqueada: trilha.bloqueada || false,
          }}
          videos={allVideos}
          progressData={progressData}
          onSelectVideo={handleVideoSelect}
        />
      )}

      {/* Se tem vídeo selecionado → Layout Lateral (Player + Sidebar) */}
      {currentVideoId && currentVideo && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Coluna Esquerda: Player + Info + Avaliação + Tabs */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* 1. Player de Vídeo */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?start=${getVideoProgress(currentVideo.id)?.tempo_assistido || 0}&modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1&fs=1&playsinline=1`}
                title={currentVideo.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* 2. Título e Informações do Vídeo */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-lg font-semibold line-clamp-2">{currentVideo.titulo}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(currentVideo.duracao)}
                    </span>
                    {formatDataAula(currentVideo.data_aula) && (
                      <span>• {formatDataAula(currentVideo.data_aula)}</span>
                    )}
                  </div>
                </div>
                <FavoriteButton 
                  tipo="video" 
                  itemId={currentVideo.id}
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>

            {/* 3. Avaliação + Botão Concluir */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Avaliação */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Avalie esta aula</div>
                    <div className="flex items-center gap-3">
                      <VideoRatingInput
                        rating={userRating}
                        onRatingChange={setRating}
                      />
                      <span className="text-sm text-muted-foreground">
                        ({ratingCount} {ratingCount === 1 ? "avaliação" : "avaliações"})
                      </span>
                    </div>
                  </div>
                  
                  {/* Botão Concluir */}
                  <div className="w-full sm:w-auto">
                    {getVideoProgress(currentVideoId || '')?.completado ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium text-sm">Concluída</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => marcarConcluidoMutation.mutate()}
                        disabled={marcarConcluidoMutation.isPending}
                        className="w-full sm:w-auto transition-colors bg-aplicada-dark hover:bg-aplicada-dark/90 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Concluída
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Tabs de Descrição e Comentários */}
            <Card className="border-border">
              <CardContent className="p-4 md:p-6">
                <Tabs defaultValue="descricao" className="w-full">
                  <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto mb-4">
                    <TabsTrigger 
                      value="descricao"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
                    >
                      Informações da aula
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comentarios"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
                    >
                      Comentários
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="descricao" className="mt-0">
                    <Collapsible open={infoExpanded} onOpenChange={setInfoExpanded}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Descrição</h3>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8">
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              infoExpanded && "rotate-180"
                            )} />
                            {infoExpanded ? "Ocultar" : "Expandir"}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent className="space-y-6">
                        <p className="text-muted-foreground">
                          {currentVideo.descricao || "Sem descrição disponível."}
                        </p>

                        <div>
                          <h3 className="font-semibold mb-3">LINKS IMPORTANTES</h3>
                          <VideoMaterialsList 
                            materiais={parseMateriais(currentVideo?.materiais)} 
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TabsContent>

                  <TabsContent value="comentarios" className="mt-0">
                    {currentVideoId && (
                      <VideoFeedbackSection videoId={currentVideoId} />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Lista de vídeos para mobile (colapsável) */}
            <div className="lg:hidden">
              <Collapsible open={videosExpanded} onOpenChange={setVideosExpanded}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold">
                    Vídeos da trilha ({allVideos.length})
                  </h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        videosExpanded && "rotate-180"
                      )} />
                      {videosExpanded ? "Ocultar" : "Expandir"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allVideos.map((video) => {
                      const progress = getVideoProgress(video.id);
                      const isPlaying = currentVideoId === video.id;
                      const isCompleted = progress?.completado;

                      return (
                        <div
                          key={video.id}
                          onClick={() => handleVideoSelect(video.id)}
                          className={cn(
                            "cursor-pointer rounded-lg overflow-hidden transition-all border group",
                            isPlaying 
                              ? "ring-2 ring-primary border-primary bg-primary/5" 
                              : "hover:bg-muted/50 border-border bg-card"
                          )}
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_customizado_url)}
                              alt={video.titulo}
                              className="w-full h-full object-cover"
                            />
                            {isPlaying && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Play className="h-5 w-5 text-white fill-white" />
                              </div>
                            )}
                            {isCompleted && !isPlaying && (
                              <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
                              {formatDuration(video.duracao)}
                            </div>
                          </div>
                          <div className="p-2">
                            <h4 className="text-xs font-medium line-clamp-2">{video.titulo}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Sidebar Direita: Lista de Vídeos (apenas desktop) */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <Card className="sticky top-4 border-border overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm">
                  Vídeos da trilha ({allVideos.length})
                </h3>
              </div>
              <ScrollArea className="h-[calc(100vh-200px)] max-h-[600px]">
                <div className="flex flex-col">
                  {allVideos.map((video, index) => {
                    const progress = getVideoProgress(video.id);
                    const isPlaying = currentVideoId === video.id;
                    const isCompleted = progress?.completado;

                    return (
                      <div
                        key={video.id}
                        ref={(el) => { videoRefs.current[video.id] = el; }}
                        onClick={() => handleVideoSelect(video.id)}
                        className={cn(
                          "flex gap-3 p-2 cursor-pointer transition-all border-l-2",
                          isPlaying 
                            ? "border-l-primary bg-primary/10" 
                            : "border-l-transparent hover:bg-muted/50"
                        )}
                      >
                        {/* Número do vídeo */}
                        <div className="flex-shrink-0 w-6 text-center text-xs text-muted-foreground pt-1">
                          {isPlaying ? (
                            <Play className="h-4 w-4 text-primary fill-primary mx-auto" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-28 flex-shrink-0">
                          <img
                            src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_customizado_url)}
                            alt={video.titulo}
                            className="w-full h-16 rounded object-cover"
                          />
                          <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[10px] px-1 rounded">
                            {formatDuration(video.duracao)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 py-0.5">
                          <p className={cn(
                            "text-sm font-medium line-clamp-2 leading-tight",
                            isPlaying && "text-primary"
                          )}>
                            {video.titulo}
                          </p>
                          {isPlaying && (
                            <Badge variant="secondary" className="mt-1.5 text-[10px] px-1.5 py-0">
                              Tocando
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}

      {/* Fallback se vídeo não encontrado */}
      {currentVideoId && !currentVideo && (
        <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Vídeo não encontrado</p>
        </div>
      )}
    </div>
  );
}
