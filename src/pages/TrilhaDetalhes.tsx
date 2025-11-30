import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { useContentVisibility } from "@/hooks/useContentVisibility";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, Play, CheckCircle2, Clock } from "lucide-react";
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
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { isVisitante, isLoading: loadingRole } = useContentVisibility();

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
      let query = supabase
        .from("trilhas")
        .select(`
          *,
          modulos:modulos!inner(
            *,
            videos:videos!inner(*)
          )
        `)
        .eq("id", id)
        .eq("ativo", true)
        .eq("modulos.ativo", true)
        .eq("modulos.videos.ativo", true)
        .order("ordem", { foreignTable: "modulos" })
        .order("ordem", { foreignTable: "modulos.videos" });
      
      if (isVisitante) {
        query = query
          .eq("visivel_visitantes", true)
          .eq("modulos.visivel_visitantes", true)
          .eq("modulos.videos.visivel_visitantes", true);
      } else {
        query = query
          .eq("visivel_mentorados", true)
          .eq("modulos.visivel_mentorados", true)
          .eq("modulos.videos.visivel_mentorados", true);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
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

  // Filter modules that have videos
  const modulosComVideos = trilha?.modulos?.filter(
    (modulo: any) => modulo.videos && modulo.videos.length > 0
  ) || [];

  // Get all videos from all modules
  const allVideos = modulosComVideos.flatMap(modulo => 
    modulo.videos?.map(video => ({ ...video, modulo })) || []
  ) || [];

  // Filter videos based on search
  const filteredVideos = allVideos.filter(video =>
    video.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-selecionar primeiro vídeo não concluído (ou primeiro vídeo se todos concluídos)
  useEffect(() => {
    const videoIdFromUrl = searchParams.get("video");
    
    // Se tem vídeo na URL, usar ele
    if (videoIdFromUrl && allVideos.some(v => v.id === videoIdFromUrl)) {
      setCurrentVideoId(videoIdFromUrl);
      return;
    }
    
    // Se não tem vídeo selecionado e tem vídeos disponíveis, auto-selecionar
    if (!currentVideoId && allVideos.length > 0) {
      // Encontrar primeiro vídeo não concluído
      const firstIncompleteVideo = allVideos.find(video => 
        !progressData?.find(p => p.video_id === video.id)?.completado
      );
      
      // Usar primeiro não concluído, ou primeiro vídeo se todos concluídos
      const videoToSelect = firstIncompleteVideo || allVideos[0];
      setCurrentVideoId(videoToSelect.id);
      setSearchParams({ video: videoToSelect.id });
    }
  }, [searchParams, allVideos, currentVideoId, progressData]);

  // Scroll to active video in sidebar
  useEffect(() => {
    if (currentVideoId && videoRefs.current[currentVideoId]) {
      videoRefs.current[currentVideoId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentVideoId]);

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideoId(videoId);
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

  // Mutation para toggle de conclusão de vídeo
  const toggleConcluidoMutation = useMutation({
    mutationFn: async () => {
      if (!user || !currentVideoId) return;

      const { data: existing } = await supabase
        .from("progresso_videos")
        .select("id, completado")
        .eq("user_id", user.id)
        .eq("video_id", currentVideoId)
        .maybeSingle();

      if (existing) {
        // Toggle: inverte o estado atual
        const { error } = await supabase
          .from("progresso_videos")
          .update({ completado: !existing.completado })
          .eq("id", existing.id);

        if (error) throw error;
        return !existing.completado;
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
        return true;
      }
    },
    onSuccess: (novoEstado) => {
      toast.success(
        novoEstado 
          ? "Vídeo marcado como concluído!" 
          : "Vídeo desmarcado como concluído"
      );
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
    <div className="container py-6">
        <Link to="/trilhas">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Academy
          </Button>
        </Link>

        {/* Layout com métricas + player + sidebar (vídeo auto-selecionado) */}
        {currentVideoId && (
          <div className="space-y-6">
            {/* Cabeçalho com Métricas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">{trilha.categoria}</Badge>
                <h1 className="text-3xl font-bold">{trilha.titulo}</h1>
                {trilha.descricao && (
                  <p className="text-muted-foreground text-lg">{trilha.descricao}</p>
                )}
              </div>

              {/* Métricas */}
              <div className="flex flex-wrap gap-4">
                <Card className="flex-1 min-w-[200px]">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Total de Vídeos</div>
                    <div className="text-2xl font-bold">{allVideos.length}</div>
                  </CardContent>
                </Card>
                <Card className="flex-1 min-w-[200px]">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Progresso</div>
                    <div className="text-2xl font-bold">
                      {allVideos.length > 0 
                        ? Math.round((allVideos.filter(v => progressData?.find(p => p.video_id === v.id)?.completado).length / allVideos.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {allVideos.filter(v => progressData?.find(p => p.video_id === v.id)?.completado).length}/{allVideos.length} concluídos
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex-1 min-w-[200px]">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Duração Total</div>
                    <div className="text-2xl font-bold">
                      {Math.round(allVideos.reduce((sum, v) => sum + (v.duracao || 0), 0) / 60)}h
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Player e Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Left: Video Player e Informações */}
          <div className="flex-1 lg:w-[65%] flex flex-col">
            {currentVideo ? (
              <div className="flex flex-col gap-6">
                {/* Player */}
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex-shrink-0">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?start=${getVideoProgress(currentVideo.id)?.tempo_assistido || 0}&modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1&fs=1&playsinline=1`}
                    title={currentVideo.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Título e duração */}
              <div>
                <h1 className="text-2xl font-bold mb-2">{currentVideo.titulo}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDuration(currentVideo.duracao)}</span>
                  {formatDataAula(currentVideo.data_aula) && (
                    <span>• Data da aula: {formatDataAula(currentVideo.data_aula)}</span>
                  )}
                </div>
              </div>

                {/* Card Unificado: Avaliação + Informações */}
                <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex-1 flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Avaliação e Botão Concluir */}
                    <div className="space-y-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
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
                      
                      <Button
                        size="lg"
                        variant="default"
                        onClick={() => toggleConcluidoMutation.mutate()}
                        disabled={toggleConcluidoMutation.isPending}
                        className="w-full transition-colors !bg-[#2F302B] hover:!bg-[#3D3E39] !text-white"
                      >
                        {getVideoProgress(currentVideoId || '')?.completado 
                          ? <CheckCircle2 className="h-5 w-5 mr-2" />
                          : <Clock className="h-5 w-5 mr-2" />
                        }
                        {getVideoProgress(currentVideoId || '')?.completado ? "Concluída" : "Marcar como Concluída"}
                      </Button>
                    </div>

                    {/* Tabs: Descrição e Comentários */}
                    <Tabs defaultValue="descricao" className="w-full mt-6 flex-1 flex flex-col">
                      <TabsList className="w-full justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-700 rounded-none p-0 h-auto">
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

                      <TabsContent value="descricao" className="space-y-6 mt-4">
                        <div>
                          <h3 className="font-semibold mb-3">Descrição</h3>
                          <p className="text-muted-foreground">
                            {currentVideo.descricao || "Sem descrição disponível."}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3">LINKS IMPORTANTES</h3>
                          <VideoMaterialsList 
                            materiais={parseMateriais(currentVideo?.materiais)} 
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="comentarios" className="mt-4">
                        {currentVideoId && (
                          <VideoFeedbackSection videoId={currentVideoId} />
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Selecione um vídeo para assistir</p>
              </div>
            )}
          </div>

          {/* Right: Sidebar with video list */}
          <div className="lg:w-[35%] flex flex-col gap-4 flex-1">
            <div className="sticky top-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar vídeos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Header */}
              <h2 className="font-semibold text-foreground">Trilha de conhecimento</h2>

              {/* Video List */}
            <div className="flex-1 min-h-[400px] max-h-[calc(100vh-180px)] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
              <div className="p-4 pb-6 space-y-2">
                  <Accordion 
                    type="multiple" 
                    defaultValue={
                      searchParams.get("modulo") 
                        ? [`modulo-${searchParams.get("modulo")}`]
                        : modulosComVideos.map(m => `modulo-${m.id}`) || []
                    }
                  >
                    {modulosComVideos.map((modulo, modIndex) => {
                        const moduloVideos = searchTerm 
                          ? filteredVideos.filter(v => v.modulo.id === modulo.id)
                          : modulo.videos || [];
                        
                        if (searchTerm && moduloVideos.length === 0) return null;

                        const completedVideos = moduloVideos.filter(v => 
                          getVideoProgress(v.id)?.completado
                        ).length;

                        return (
                          <AccordionItem key={modulo.id} value={`modulo-${modulo.id}`} className="border-b-0">
                            <AccordionTrigger className="hover:no-underline py-3">
                              <div className="flex items-start gap-3 w-full text-left">
                                <Badge variant="secondary" className="mt-0.5">{modIndex + 1}</Badge>
                                <div className="flex-1">
                                  <h3 className="font-medium text-sm">{modulo.titulo}</h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {completedVideos}/{moduloVideos.length} vídeos concluídos
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pl-2">
                                {moduloVideos.map((video) => {
                                  const progress = getVideoProgress(video.id);
                                  const isPlaying = currentVideoId === video.id;
                                  const isCompleted = progress?.completado;

                                  return (
                                     <div
                                      key={video.id}
                                      ref={(el) => { videoRefs.current[video.id] = el; }}
                                      onClick={() => handleVideoSelect(video.id)}
                                      className={cn(
                                        "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors border",
                                        isPlaying 
                                          ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" 
                                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
                                      )}
                                    >
                                      <div className="relative w-24 h-14 flex-shrink-0 rounded overflow-hidden">
                            <img
                              src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_customizado_url)}
                              alt={video.titulo}
                                          className="w-full h-full object-cover"
                                        />
                                        {isPlaying && (
                                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Play className="h-6 w-6 text-white fill-white" />
                                          </div>
                                        )}
                                      </div>
                                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isCompleted && <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />}
                          <h4 className="text-sm font-medium line-clamp-2">
                            {video.titulo}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDuration(video.duracao)}</span>
                          <FavoriteButton 
                            tipo="video" 
                            itemId={video.id}
                            variant="ghost"
                            size="sm"
                          />
                        </div>
                        {formatDataAula(video.data_aula) && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatDataAula(video.data_aula)}
                          </div>
                        )}
                        {isPlaying && (
                          <Badge variant="secondary" className="mt-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            Tocando agora
                          </Badge>
                        )}
                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                </div>
              </div>
              </div>
            </div>
          </div>
          </div>
        )}
        
        {/* Loading state enquanto seleciona vídeo */}
        {!currentVideoId && allVideos.length > 0 && (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
    </div>
  );
}