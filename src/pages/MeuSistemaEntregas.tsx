import { useState, useCallback } from "react";
import { ExternalLink, FileText, Play, Monitor, Video, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useEntregasBusinessView } from "@/hooks/useEntregasBusinessView";
import { getGoogleDriveEmbedUrl, isGoogleDriveUrl } from "@/lib/google-drive";
import { supabase } from "@/integrations/supabase/client";
import { downloadUrl } from "@/lib/download";
import { toast } from "sonner";
import { Lens } from "@/components/ui/lens";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

export default function MeuSistemaEntregas() {
  const userId = useBusinessUserId();
  const { contrato, isLoading: loadingContrato } = useContratosBusiness(userId);
  const { processos, telas, videos, isLoading: loadingEntregas } = useEntregasBusinessView(contrato?.id);

  const [selectedTela, setSelectedTela] = useState<any | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const isLoading = loadingContrato || loadingEntregas;

  const handleDownloadProcesso = async (processo: any) => {
    if (processo.url) {
      window.open(processo.url, "_blank");
      return;
    }
    if (processo.arquivo_path) {
      try {
        const { data } = await supabase.storage
          .from("contratos-business")
          .createSignedUrl(processo.arquivo_path, 3600);
        if (data?.signedUrl) {
          downloadUrl(data.signedUrl, processo.titulo);
        } else {
          toast.error("Não foi possível gerar link de download");
        }
      } catch {
        toast.error("Erro ao baixar documento");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhum contrato ativo encontrado.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Processos mapeados, telas do sistema e vídeos de instrução
        </p>
      </div>

      {/* Processos Mapeados */}
      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Processos Mapeados</h2>
            <Badge variant="secondary" className="text-xs">{processos.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Instruções de trabalho · SOPs</p>
        </div>
        {processos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {processos.map((p) => (
              <Card key={p.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 rounded-lg bg-primary/10 p-2">
                      {p.tipo === "link" ? (
                        <ExternalLink className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground">{p.titulo}</p>
                      {p.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleDownloadProcesso(p)}
                    >
                      {p.tipo === "link" ? (
                        <><ExternalLink className="h-3 w-3 mr-1" /> Acessar</>
                      ) : (
                        <><FileText className="h-3 w-3 mr-1" /> Baixar</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="opacity-50 pointer-events-none">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { titulo: "Processo de exemplo 1", tipo: "link", descricao: "Instrução de trabalho documentada" },
                { titulo: "Processo de exemplo 2", tipo: "arquivo", descricao: "SOP do fluxo operacional" },
              ].map((p, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-lg bg-primary/10 p-2">
                        {p.tipo === "link" ? (
                          <ExternalLink className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground">{p.titulo}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.descricao}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="text-xs h-7" disabled>
                        {p.tipo === "link" ? (
                          <><ExternalLink className="h-3 w-3 mr-1" /> Acessar</>
                        ) : (
                          <><FileText className="h-3 w-3 mr-1" /> Baixar</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">Nenhum processo mapeado ainda.</p>
          </div>
        )}
      </section>

      {/* Telas do Sistema */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Telas do Sistema</h2>
            <Badge variant="secondary" className="text-xs">{telas.length}</Badge>
          </div>
          {telas.length > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {telas.length > 0 ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {telas.map((tela) => (
                <motion.div
                  key={tela.id}
                  className="flex-none w-[300px] md:w-[360px]"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div
                    className="relative cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group border border-border/50"
                    onClick={() => setSelectedTela(tela)}
                  >
                    {tela.screenshot_url ? (
                      <div className="aspect-video bg-muted">
                        <img
                          src={tela.screenshot_url}
                          alt={tela.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Monitor className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                      <p className="text-white text-sm font-medium truncate">{tela.titulo}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="opacity-50 pointer-events-none">
            <div className="overflow-hidden">
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} className="flex-none w-[300px] md:w-[360px]">
                    <div className="relative rounded-xl overflow-hidden shadow-md border border-border/50">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Monitor className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                        <p className="text-white text-sm font-medium truncate">Tela de exemplo {i}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">Nenhuma tela cadastrada ainda.</p>
          </div>
        )}
      </section>

      {/* Vídeos de Instrução */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Vídeos de Instrução</h2>
          <Badge variant="secondary" className="text-xs">{videos.length}</Badge>
        </div>
        {videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer border-border/50 overflow-hidden hover:shadow-lg transition-shadow"
                onClick={() => setSelectedVideo(video)}
              >
                <Lens zoomFactor={1.4} lensSize={140} className="aspect-video bg-muted">
                  {video.thumbnail_url ? (
                    <div className="relative w-full h-full">
                      <img
                        src={video.thumbnail_url}
                        alt={video.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="rounded-full bg-white/90 p-3 shadow-lg">
                          <Play className="h-6 w-6 text-primary fill-primary" />
                        </div>
                      </div>
                    </div>
                  ) : video.video_url && isGoogleDriveUrl(video.video_url) ? (
                    <div className="relative w-full h-full">
                      <iframe
                        src={getGoogleDriveEmbedUrl(video.video_url) || ""}
                        className="w-full h-full pointer-events-none"
                        allow="autoplay"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="rounded-full bg-white/90 p-3 shadow-lg">
                          <Play className="h-6 w-6 text-primary fill-primary" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <Play className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Vídeo</p>
                      </div>
                    </div>
                  )}
                </Lens>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-foreground truncate">{video.titulo}</p>
                  {video.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.descricao}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="opacity-50 pointer-events-none">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50 overflow-hidden">
                  <Lens zoomFactor={1.4} lensSize={140} className="aspect-video bg-muted">
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <Play className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Vídeo</p>
                      </div>
                    </div>
                  </Lens>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm text-foreground truncate">Vídeo de exemplo {i}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">Descrição do vídeo de instrução</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">Nenhum vídeo de instrução ainda.</p>
          </div>
        )}
      </section>

      {/* Dialog: Tela do Sistema */}
      <Dialog open={!!selectedTela} onOpenChange={() => setSelectedTela(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTela?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedTela?.screenshot_url && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={selectedTela.screenshot_url}
                alt={selectedTela.titulo}
                className="w-full object-contain max-h-[50vh]"
              />
            </div>
          )}
          {selectedTela?.link_sistema && (
            <Button onClick={() => window.open(selectedTela.link_sistema, "_blank")} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" /> Acessar Sistema
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Vídeo */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedVideo?.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              {isGoogleDriveUrl(selectedVideo.video_url) ? (
                <iframe
                  src={getGoogleDriveEmbedUrl(selectedVideo.video_url) || ""}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <iframe
                  src={selectedVideo.video_url}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          )}
          {selectedVideo?.descricao && (
            <p className="text-sm text-muted-foreground">{selectedVideo.descricao}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
