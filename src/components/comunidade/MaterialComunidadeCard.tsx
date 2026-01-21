import { MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "./RatingStars";
import { FileText, Image, FileSpreadsheet, Layout, File } from "lucide-react";

interface MaterialComunidadeCardProps {
  material: MaterialComunidade;
  onClick: () => void;
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
  prompt: <FileText className="w-5 h-5" />,
  imagem: <Image className="w-5 h-5" />,
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

export function MaterialComunidadeCard({ material, onClick }: MaterialComunidadeCardProps) {
  return (
    <Card
      className="min-h-[220px] hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-primary/50 relative group"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            {TIPO_ICONS[material.tipo] || TIPO_ICONS.outro}
          </div>
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">
            {material.titulo}
          </h3>
        </div>

        {/* Descricao */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-auto">
          {material.descricao || "Sem descricao"}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="text-xs">
            {TIPO_LABELS[material.tipo] || material.tipo}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {CATEGORIA_LABELS[material.categoria] || material.categoria}
          </Badge>
        </div>

        {/* Footer: Criador + Avaliacao */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          {material.criador ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={material.criador.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {material.criador.nome_completo?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {material.criador.nome_completo}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Comunidade</span>
          )}

          {material.total_avaliacoes > 0 && (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={Number(material.media_avaliacoes)} size="sm" />
              <span className="text-xs text-muted-foreground">
                ({material.total_avaliacoes})
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
