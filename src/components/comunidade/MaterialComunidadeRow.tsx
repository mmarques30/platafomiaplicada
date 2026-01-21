import { MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "./RatingStars";
import { FileText, Image as ImageIcon, FileSpreadsheet, Layout, File, ChevronRight, Paperclip } from "lucide-react";

interface MaterialComunidadeRowProps {
  material: MaterialComunidade;
  onClick: () => void;
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

export function MaterialComunidadeRow({ material, onClick }: MaterialComunidadeRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {TIPO_ICONS[material.tipo] || TIPO_ICONS.outro}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{material.titulo}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {material.descricao || "Sem descricao"}
        </p>
      </div>

      {/* Badges (desktop) */}
      <div className="hidden lg:flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {TIPO_LABELS[material.tipo] || material.tipo}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {CATEGORIA_LABELS[material.categoria] || material.categoria}
        </Badge>
        {material.arquivos_url && material.arquivos_url.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Paperclip className="w-3 h-3 mr-1" />
            {material.arquivos_url.length}
          </Badge>
        )}
      </div>

      {/* Criador (desktop) */}
      {material.criador && (
        <div className="hidden md:flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={material.criador.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {material.criador.nome_completo?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {material.criador.nome_completo}
          </span>
        </div>
      )}

      {/* Rating */}
      {material.total_avaliacoes > 0 && (
        <div className="hidden sm:flex items-center gap-1.5">
          <RatingStars rating={Number(material.media_avaliacoes)} size="sm" />
          <span className="text-xs text-muted-foreground">
            ({material.total_avaliacoes})
          </span>
        </div>
      )}

      {/* Action */}
      <Button variant="ghost" size="sm" className="shrink-0">
        Ver
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
