import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Sparkles, Cpu, Download, ExternalLink, FileText, Image, Table, FileCode } from "lucide-react";

interface IACopieUseDetalhesModalProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    conteudo: string;
    ia_recomendada?: string | null;
    ferramentas_recomendadas?: string[] | null;
    arquivos_url?: any;
    links_url?: any;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getFileIcon = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="h-4 w-4 shrink-0 text-red-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="h-4 w-4 shrink-0 text-purple-500" />;
    case 'csv':
    case 'xlsx':
    case 'xls':
      return <Table className="h-4 w-4 shrink-0 text-green-600" />;
    case 'html':
    case 'htm':
      return <FileCode className="h-4 w-4 shrink-0 text-orange-500" />;
    default:
      return <FileText className="h-4 w-4 shrink-0" />;
  }
};

const getFileName = (url: string) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const cleanName = filename.replace(/^[a-f0-9-]{36}_/, '');
  return decodeURIComponent(cleanName);
};

const getArquivoUrls = (arquivosUrl: any): string[] => {
  if (!arquivosUrl) return [];
  if (Array.isArray(arquivosUrl)) return arquivosUrl;
  if (typeof arquivosUrl === 'string') return [arquivosUrl];
  return [];
};

const getLinksUrls = (linksUrl: any): string[] => {
  if (!linksUrl) return [];
  if (Array.isArray(linksUrl)) return linksUrl;
  if (typeof linksUrl === 'string') return [linksUrl];
  return [];
};

const getDomainFromUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
};

export function IACopieUseDetalhesModal({ ia, open, onOpenChange }: IACopieUseDetalhesModalProps) {
  if (!ia) return null;

  const arquivos = getArquivoUrls(ia.arquivos_url);
  const links = getLinksUrls(ia.links_url);
  const ferramentas = Array.isArray(ia.ferramentas_recomendadas) ? ia.ferramentas_recomendadas : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{ia.titulo}</DialogTitle>
              <p className="text-muted-foreground mt-1">{ia.descricao}</p>
            </div>
            <FavoriteButton 
              tipo="ia_copie_use" 
              itemId={ia.id}
              variant="icon-only"
            />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{ia.categoria}</Badge>
            {ia.ia_recomendada && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {ia.ia_recomendada}
              </Badge>
            )}
          </div>

          {/* Ferramentas Recomendadas */}
          {ferramentas.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                Ferramentas onde aplicar:
              </p>
              <div className="flex gap-2 flex-wrap">
                {ferramentas.map((ferramenta: string) => (
                  <Badge 
                    key={ferramenta} 
                    variant="default" 
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {ferramenta}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo */}
          <div>
            <p className="text-sm font-medium mb-2">Conteúdo para copiar:</p>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm whitespace-pre-wrap break-all">{ia.conteudo}</code>
            </div>
            <CopyButton
              content={ia.conteudo}
              variant="default"
              size="default"
              className="w-full mt-3"
            />
          </div>

          {/* Links Externos */}
          {links.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                Links externos:
              </p>
              <div className="flex flex-col gap-2">
                {links.map((url, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{getDomainFromUrl(url)}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Arquivos */}
          {arquivos.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Download className="w-4 h-4" />
                Arquivos para download:
              </p>
              <div className="flex flex-col gap-2">
                {arquivos.map((url, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(url)}
                      <span className="text-sm truncate">{getFileName(url)}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0">
                      <a href={url} download={getFileName(url)}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
