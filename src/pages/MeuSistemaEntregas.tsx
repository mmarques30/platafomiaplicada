import { useState } from "react";
import { ExternalLink, FileText, Play, Monitor, Video, ClipboardList } from "lucide-react";
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

  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

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
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Processos Mapeados</h2>
          <Badge variant="secondary" className="text-xs">{processos.length}</Badge>
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
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhum processo mapeado ainda.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Telas do Sistema */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Telas do Sistema</h2>
          <Badge variant="secondary" className="text-xs">{telas.length}</Badge>
        </div>
        {telas.length > 0 ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {telas.map((tela) => (
                <motion.div
                  key={tela.id}
                  className="flex-none w-[280px] md:w-[320px]"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="cursor-pointer border-border/50 overflow-hidden hover:shadow-lg transition-shadow h-full"
                    onClick={() => setSelectedTela(tela)}
                  >
                    {tela.screenshot_url ? (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={tela.screenshot_url}
                          alt={tela.titulo}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Monitor className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <p className="font-medium text-sm text-foreground truncate">{tela.titulo}</p>
                      {tela.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{tela.descricao}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center text-muted-foreground">
              <Monitor className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma tela cadastrada ainda.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Vídeos de Instrução */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
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
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center text-muted-foreground">
              <Video className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhum vídeo de instrução ainda.</p>
            </CardContent>
          </Card>
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
          {selectedTela?.descricao && (
            <p className="text-sm text-muted-foreground">{selectedTela.descricao}</p>
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
