import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Material {
  titulo: string;
  url: string;
  tipo?: string;
}

interface VideoMaterialsListProps {
  materiais: any;
}

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

  const getIcon = (tipo?: string) => {
    if (tipo === "download") return <Download className="h-4 w-4" />;
    if (tipo === "link") return <ExternalLink className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {list.map((material, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
        >
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {getIcon(material.tipo)}
            <span className="truncate">{material.titulo}</span>
          </a>
        </Button>
      ))}
    </div>
  );
}
