import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { Material } from "@/types/video";

interface MaterialListProps {
  materiais: Material[];
  onRemove: (index: number) => void;
}

export function MaterialList({ materiais, onRemove }: MaterialListProps) {
  const getMaterialIcon = (tipo: string) => {
    switch (tipo) {
      case 'download': return <Download className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      case 'documento': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (materiais.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
      <p className="text-sm font-medium">Materiais ({materiais.length})</p>
      {materiais.map((material, index) => (
        <div key={index} className="flex items-center justify-between gap-2 p-2 bg-background rounded border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getMaterialIcon(material.tipo)}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate font-medium">{material.titulo}</p>
              {material.arquivo_nome && (
                <p className="text-xs text-muted-foreground truncate">
                  {material.arquivo_nome} {material.arquivo_tamanho && `• ${formatFileSize(material.arquivo_tamanho)}`}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
