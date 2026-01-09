import { useState } from "react";
import { Download, ExternalLink, FileText, File, Table, FileCode, ChevronDown, Link2, FolderOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Material {
  titulo: string;
  url: string;
  tipo?: string;
}

interface VideoMaterialsListProps {
  materiais: any;
}

const getFileExtension = (url: string) => {
  return url.split('.').pop()?.toLowerCase() || '';
};

const getFileIcon = (url: string, tipo?: string) => {
  if (tipo === "link") return { icon: ExternalLink, color: "text-primary", bg: "bg-primary/10" };
  
  const ext = getFileExtension(url);
  switch (ext) {
    case 'pdf':
      return { icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" };
    case 'xlsx':
    case 'xls':
    case 'csv':
      return { icon: Table, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" };
    case 'doc':
    case 'docx':
      return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" };
    case 'html':
    case 'xml':
      return { icon: FileCode, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" };
    default:
      return { icon: File, color: "text-muted-foreground", bg: "bg-muted/50" };
  }
};

export function VideoMaterialsList({ materiais }: VideoMaterialsListProps) {
  const [linksOpen, setLinksOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

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
      <div className="text-sm text-muted-foreground py-4 text-center">
        Nenhum material disponível para esta aula.
      </div>
    );
  }

  // Separate links from documents
  const links = list.filter(m => m.tipo === "link");
  const documents = list.filter(m => m.tipo !== "link");

  const VISIBLE_COUNT = 3;

  const MaterialItem = ({ material, isLink }: { material: Material; isLink: boolean }) => {
    const { icon: Icon, color, bg } = getFileIcon(material.url, material.tipo);
    const fileName = material.url.split('/').pop() || material.titulo;

    return (
      <a
        href={material.url}
        target={isLink ? "_blank" : undefined}
        rel={isLink ? "noopener noreferrer" : undefined}
        download={!isLink ? fileName : undefined}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border/50",
          "hover:border-border hover:bg-accent/50 transition-all duration-200",
          "group"
        )}
      >
        <div className={cn("p-2 rounded-md", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">
          {material.titulo}
        </span>
        {isLink ? (
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        ) : (
          <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </a>
    );
  };

  const MaterialSection = ({ 
    title, 
    items, 
    isLink, 
    icon: SectionIcon,
    isOpen,
    onToggle 
  }: { 
    title: string; 
    items: Material[]; 
    isLink: boolean;
    icon: React.ElementType;
    isOpen: boolean;
    onToggle: (open: boolean) => void;
  }) => {
    if (items.length === 0) return null;

    const visibleItems = items.slice(0, VISIBLE_COUNT);
    const hiddenItems = items.slice(VISIBLE_COUNT);
    const hasMore = hiddenItems.length > 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SectionIcon className="h-4 w-4" />
          <span>{title}</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        
        <div className="space-y-2">
          {visibleItems.map((material, index) => (
            <MaterialItem key={index} material={material} isLink={isLink} />
          ))}

          {hasMore && (
            <Collapsible open={isOpen} onOpenChange={onToggle}>
              <CollapsibleContent className="space-y-2">
                {hiddenItems.map((material, index) => (
                  <MaterialItem key={index + VISIBLE_COUNT} material={material} isLink={isLink} />
                ))}
              </CollapsibleContent>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 mt-2",
                    "text-sm text-muted-foreground hover:text-primary",
                    "border border-dashed border-border/50 rounded-lg",
                    "hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  )}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} />
                  {isOpen 
                    ? "Mostrar menos" 
                    : `Ver mais ${hiddenItems.length} ${isLink ? 'link' : 'documento'}${hiddenItems.length > 1 ? 's' : ''}`
                  }
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <MaterialSection 
        title="Links" 
        items={links} 
        isLink={true}
        icon={Link2}
        isOpen={linksOpen}
        onToggle={setLinksOpen}
      />
      <MaterialSection 
        title="Documentos" 
        items={documents} 
        isLink={false}
        icon={FolderOpen}
        isOpen={docsOpen}
        onToggle={setDocsOpen}
      />
    </div>
  );
}
