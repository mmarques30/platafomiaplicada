import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMateriaisComunidade, MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { useAvaliacoesMateriais } from "@/hooks/useAvaliacoesMateriais";
import { RatingStars } from "./RatingStars";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Download, Check, FileText, Image as ImageIcon, FileSpreadsheet, Layout, File, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { downloadUrl, getFileNameFromUrl } from "@/lib/download";

const getFileName = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split("/");
    return parts[parts.length - 1];
  } catch {
    return url.split("/").pop() || "arquivo";
  }
};

interface MaterialComunidadeModalProps {
  materialId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
  prompt: <FileText className="w-5 h-5" />,
  imagem: <ImageIcon className="w-5 h-5" />,
  documento: <FileSpreadsheet className="w-5 h-5" />,
  template: <Layout className="w-5 h-5" />,
  outro: <File className="w-5 h-5" />,
};

const TIPO_LABELS: Record<string, string> = {
  prompt: "Prompt",
  imagem: "Imagem",
  documento: "Documento",
  template: "Template",
  outro: "Outro",
};

const CATEGORIA_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  midjourney: "Midjourney",
  canva: "Canva",
  notion: "Notion",
  excel: "Excel",
  outro: "Outro",
};

export function MaterialComunidadeModal({ materialId, open, onOpenChange }: MaterialComunidadeModalProps) {
  const { user } = useAuth();
  const { materiais } = useMateriaisComunidade();
  const { avaliacoes, minhaAvaliacao, submitAvaliacao } = useAvaliacoesMateriais(materialId || "");
  
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");

  const material = materiais.find((m) => m.id === materialId);

  useEffect(() => {
    if (minhaAvaliacao) {
      setRating(minhaAvaliacao.nota);
      setComentario(minhaAvaliacao.comentario || "");
    } else {
      setRating(0);
      setComentario("");
    }
  }, [minhaAvaliacao, materialId]);

  if (!material) return null;

  const handleCopy = async () => {
    if (material.conteudo_texto) {
      await navigator.clipboard.writeText(material.conteudo_texto);
      setCopied(true);
      toast.success("Conteudo copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      await downloadUrl(url, getFileNameFromUrl(url));
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível baixar este arquivo. Abrindo em nova aba...");
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmitAvaliacao = () => {
    if (rating === 0) {
      toast.error("Selecione uma nota");
      return;
    }
    submitAvaliacao.mutate({ nota: rating, comentario });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              {TIPO_ICONS[material.tipo] || TIPO_ICONS.outro}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl leading-tight">{material.titulo}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">
                  {TIPO_LABELS[material.tipo] || material.tipo}
                </Badge>
                <Badge variant="outline">
                  {CATEGORIA_LABELS[material.categoria] || material.categoria}
                </Badge>
                {material.total_avaliacoes > 0 && (
                  <div className="flex items-center gap-1.5">
                    <RatingStars rating={Number(material.media_avaliacoes)} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      ({material.total_avaliacoes} avaliacoes)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {/* Descricao */}
            {material.descricao && (
              <p className="text-muted-foreground">{material.descricao}</p>
            )}

            {/* Conteudo texto (prompt) */}
            {material.conteudo_texto && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conteudo</span>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {material.conteudo_texto}
                </div>
              </div>
            )}

            {/* Arquivos para download */}
            {material.arquivos_url && material.arquivos_url.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  {material.arquivos_url.length === 1 ? "Arquivo" : `Arquivos (${material.arquivos_url.length})`}
                </span>
                <div className="space-y-2">
                  {material.arquivos_url.map((url, index) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                    return (
                      <div key={index} className="space-y-2">
                        {isImage && (
                          <img
                            src={url}
                            alt={`${material.titulo} - ${index + 1}`}
                            className="max-h-[200px] rounded-lg object-contain bg-muted"
                          />
                        )}
                        <Button variant="outline" size="sm" onClick={() => void handleDownload(url)}>
                          <Download className="w-4 h-4 mr-2" />
                          {getFileName(url)}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Criador */}
            {material.criador && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={material.criador.avatar_url || undefined} />
                  <AvatarFallback>
                    {material.criador.nome_completo?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Criado por</p>
                  <p className="text-muted-foreground text-sm">{material.criador.nome_completo}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Avaliar */}
            {user && (
              <div className="space-y-4">
                <h4 className="font-semibold">
                  {minhaAvaliacao ? "Sua avaliacao" : "Avalie este material"}
                </h4>
                <div className="flex items-center gap-4">
                  <RatingStars
                    rating={rating}
                    size="lg"
                    interactive
                    onRatingChange={setRating}
                  />
                  <span className="text-sm text-muted-foreground">
                    {rating > 0 ? `${rating} estrela${rating > 1 ? "s" : ""}` : "Clique para avaliar"}
                  </span>
                </div>
                <Textarea
                  placeholder="Deixe um comentario (opcional)"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleSubmitAvaliacao}
                  disabled={rating === 0 || submitAvaliacao.isPending}
                  className="w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {minhaAvaliacao ? "Atualizar avaliacao" : "Enviar avaliacao"}
                </Button>
              </div>
            )}

            {/* Lista de comentarios */}
            {avaliacoes.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h4 className="font-semibold">Comentarios ({avaliacoes.length})</h4>
                <div className="space-y-4">
                  {avaliacoes
                    .filter((a) => a.comentario)
                    .map((avaliacao) => (
                      <div key={avaliacao.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avaliacao.user?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {avaliacao.user?.nome_completo?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {avaliacao.user?.nome_completo || "Usuario"}
                            </span>
                            <RatingStars rating={avaliacao.nota} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(avaliacao.created_at), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{avaliacao.comentario}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
