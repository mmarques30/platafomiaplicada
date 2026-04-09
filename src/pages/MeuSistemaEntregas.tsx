import { useState, useCallback } from "react";
import { ExternalLink, FileText, Play, Monitor, Video, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
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
  const [showAllProcessos, setShowAllProcessos] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });
  const [emblaRefVideos, emblaApiVideos] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollPrevVideos = useCallback(() => emblaApiVideos?.scrollPrev(), [emblaApiVideos]);
  const scrollNextVideos = useCallback(() => emblaApiVideos?.scrollNext(), [emblaApiVideos]);

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
    <div className="p-4 md:p-6 space-y-8 overflow-hidden">
      <PageTitle primary="Entregas" />

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
          <div className="space-y-2">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2 w-10">Tipo</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2">Título</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2 hidden sm:table-cell">Descrição</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2 w-24">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllProcessos ? processos : processos.slice(0, 2)).map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="rounded-lg bg-primary/10 p-1.5 w-fit">
                          {p.tipo === "link" ? (
                            <ExternalLink className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.titulo}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs line-clamp-1 hidden sm:table-cell">{p.descricao || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleDownloadProcesso(p)}>
                          {p.tipo === "link" ? (
                            <><ExternalLink className="h-3 w-3 mr-1" /> Acessar</>
                          ) : (
                            <><FileText className="h-3 w-3 mr-1" /> Baixar</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {processos.length > 2 && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAllProcessos(!showAllProcessos)}>
                  {showAllProcessos ? "Ver menos" : `Ver mais (${processos.length - 2})`}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="opacity-50 pointer-events-none">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2 w-10">Tipo</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2">Título</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2 hidden sm:table-cell">Descrição</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2 w-24">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { titulo: "Processo de exemplo 1", tipo: "link", descricao: "Instrução de trabalho documentada" },
                    { titulo: "Processo de exemplo 2", tipo: "arquivo", descricao: "SOP do fluxo operacional" },
                  ].map((p, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="rounded-lg bg-primary/10 p-1.5 w-fit">
                          {p.tipo === "link" ? (
                            <ExternalLink className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.titulo}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{p.descricao}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" className="text-xs h-7" disabled>
                          {p.tipo === "link" ? (
                            <><ExternalLink className="h-3 w-3 mr-1" /> Acessar</>
                          ) : (
                            <><FileText className="h-3 w-3 mr-1" /> Baixar</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">Nenhum processo mapeado ainda.</p>
          </div>
        )}
      </section>

      {/* Telas do Sistema */}
      <section className="space-y-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Telas do Sistema</h2>
            <Badge variant="secondary" className="text-xs">{telas.length}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {telas.length > 0 ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {telas.map((tela) => (
                <motion.div
                  key={tela.id}
                  className="flex-none w-[240px] md:w-[300px] lg:w-[340px]"
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
          <div className="opacity-50">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
{["Dashboard Principal", "Gestão de Clientes", "Relatórios", "Configurações", "Kanban de Tarefas", "Módulo Financeiro"].map((nome, i) => (
                  <motion.div key={i} className="flex-none w-[240px] md:w-[300px] lg:w-[340px]">
                    <div className="relative rounded-xl overflow-hidden shadow-md border border-border/50">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Monitor className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                        <p className="text-white text-sm font-medium truncate">{nome}</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Vídeos de Instrução</h2>
            <Badge variant="secondary" className="text-xs">{videos.length}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollPrevVideos}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollNextVideos}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {videos.length > 0 ? (
          <div className="overflow-hidden" ref={emblaRefVideos}>
            <div className="flex gap-4">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  className="flex-none w-[220px] md:w-[280px] lg:w-[320px]"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Card
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
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="opacity-50">
            <div className="overflow-hidden" ref={emblaRefVideos}>
              <div className="flex gap-4">
{[
                    { nome: "Introdução ao Sistema", desc: "Visão geral das funcionalidades" },
                    { nome: "Como Cadastrar Clientes", desc: "Passo a passo do cadastro" },
                    { nome: "Gerando Relatórios", desc: "Exportação e análise de dados" },
                    { nome: "Configurações Avançadas", desc: "Personalizando o sistema" },
                    { nome: "Fluxo de Vendas", desc: "Pipeline e gestão comercial" },
                    { nome: "Integrações e APIs", desc: "Conectando com outros sistemas" },
                  ].map((video, i) => (
                  <motion.div key={i} className="flex-none w-[220px] md:w-[280px] lg:w-[320px]">
                    <Card className="border-border/50 overflow-hidden">
                      <Lens zoomFactor={1.4} lensSize={140} className="aspect-video bg-muted">
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <div className="text-center">
                            <Play className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground mt-1">Vídeo</p>
                          </div>
                        </div>
                      </Lens>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm text-foreground truncate">{video.nome}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
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
