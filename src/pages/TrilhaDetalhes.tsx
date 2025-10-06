import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, BookOpen, Play, CheckCircle2, Circle, Clock } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function TrilhaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { data: trilha, isLoading } = useQuery({
    queryKey: ["trilha", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          cursos:cursos(
            *,
            modulos:modulos(
              *,
              videos:videos(*)
            )
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
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

  // Get all videos from all modules
  const allVideos = trilha?.cursos?.flatMap(curso => 
    curso.modulos?.flatMap(modulo => 
      modulo.videos?.map(video => ({ ...video, modulo, curso })) || []
    ) || []
  ) || [];

  // Filter videos based on search
  const filteredVideos = allVideos.filter(video =>
    video.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set initial video from URL or first video
  useEffect(() => {
    const videoIdFromUrl = searchParams.get("video");
    if (videoIdFromUrl && allVideos.some(v => v.id === videoIdFromUrl)) {
      setCurrentVideoId(videoIdFromUrl);
    } else if (allVideos.length > 0 && !currentVideoId) {
      setCurrentVideoId(allVideos[0].id);
      setSearchParams({ video: allVideos[0].id });
    }
  }, [allVideos, searchParams, currentVideoId, setSearchParams]);

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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <Link to="/trilhas">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Trilhas
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Video Player */}
          <div className="flex-1 lg:w-[65%]">
            {currentVideo ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?start=${getVideoProgress(currentVideo.id)?.tempo_assistido || 0}`}
                    title={currentVideo.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold mb-2">{currentVideo.titulo}</h1>
                  <p className="text-muted-foreground mb-4">{currentVideo.descricao}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(currentVideo.duracao)}
                    </span>
                    <span>{currentVideo.modulo.titulo}</span>
                    <span>{currentVideo.curso.titulo}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/videos/${currentVideo.id}`)}
                  className="w-full"
                >
                  Ir para página completa do vídeo
                </Button>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Selecione um vídeo para assistir</p>
              </div>
            )}
          </div>

          {/* Right: Sidebar with video list */}
          <div className="lg:w-[35%] flex flex-col gap-4">
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
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h2 className="font-semibold">Trilha de conhecimento</h2>
              </div>

              {/* Video List */}
              <ScrollArea className="h-[600px] rounded-lg border bg-card">
                <div className="p-4 space-y-2">
                  <Accordion type="multiple" defaultValue={trilha.cursos?.flatMap(c => c.modulos?.map(m => `modulo-${m.id}`) || [])}>
                    {trilha.cursos?.map((curso) => (
                      curso.modulos?.map((modulo, modIndex) => {
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
                                        "flex gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                        isPlaying ? "bg-primary/10 border-2 border-primary" : "hover:bg-muted",
                                      )}
                                    >
                                      <div className="relative w-24 h-14 flex-shrink-0 rounded overflow-hidden">
                                        <img
                                          src={video.thumbnail_customizado_url || getYouTubeThumbnail(video.youtube_id)}
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
                                        <h4 className="text-sm font-medium line-clamp-2 mb-1">
                                          {video.titulo}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span>{formatDuration(video.duracao)}</span>
                                          {isCompleted ? (
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Circle className="h-3 w-3" />
                                          )}
                                        </div>
                                        {isPlaying && (
                                          <Badge variant="default" className="mt-1 text-xs">
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
                      })
                    ))}
                  </Accordion>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}