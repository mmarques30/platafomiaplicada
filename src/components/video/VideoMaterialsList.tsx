import { Download, ExternalLink, FileText, File, Table, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Material {
  titulo: string;
  url: string;
  tipo?: string;
}

interface VideoMaterialsListProps {
  materiais: any;
}

const getFileIcon = (url: string, tipo?: string) => {
  if (tipo === "link") return <ExternalLink className="h-4 w-4" />;
  
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-500" />;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <Table className="h-4 w-4 text-green-600" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'html':
    case 'xml':
      return <FileCode className="h-4 w-4 text-orange-500" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

export function VideoMaterialsList({ materiais }: VideoMaterialsListProps) {
  const normalize = (m: any): Material[] => {
    if (!m) return [];
    if (Array.isArray(m)) return m as Material[];
    if (typeof m === "string") {
      try {
        const parsed = JSON.parse(m);
        return Array.isArray(parsed) ? (parsed as Material[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const list = normalize(materiais);

  if (list.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhum material disponível para esta aula.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((material, index) => {
        const isLink = material.tipo === "link";
        const fileName = material.url.split('/').pop() || material.titulo;
        
        return (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-between"
            asChild
          >
            <a
              href={material.url}
              target={isLink ? "_blank" : undefined}
              rel={isLink ? "noopener noreferrer" : undefined}
              download={!isLink ? fileName : undefined}
            >
              <div className="flex items-center gap-2">
                {getFileIcon(material.url, material.tipo)}
                <span className="truncate">{material.titulo}</span>
              </div>
              {!isLink && <Download className="h-4 w-4 text-muted-foreground" />}
            </a>
          </Button>
        );
      })}
    </div>
  );
}
