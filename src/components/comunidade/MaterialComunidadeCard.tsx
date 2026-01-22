import { MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./RatingStars";
import { AnimatedAvatarTooltip } from "./AnimatedAvatarTooltip";
import { Paperclip } from "lucide-react";

interface MaterialComunidadeCardProps {
  material: MaterialComunidade;
  onClick: () => void;
}

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
      className="min-h-[280px] hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-primary/50 relative group flex flex-col"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Avatar + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0">
            <AnimatedAvatarTooltip
              name={material.criador?.nome_completo || "Comunidade"}
              avatarUrl={material.criador?.avatar_url}
              size="md"
            />
          </div>
          <h3 className="font-semibold text-base md:text-lg line-clamp-3 leading-tight">
            {material.titulo}
          </h3>
        </div>

        {/* Descricao */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-auto">
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
          {material.arquivos_url && material.arquivos_url.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <Paperclip className="w-3 h-3 mr-1" />
              {material.arquivos_url.length}
            </Badge>
          )}
        </div>

        {/* Footer: Rating */}
        {material.total_avaliacoes > 0 && (
          <div className="flex items-center justify-end mt-3 pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <RatingStars rating={Number(material.media_avaliacoes)} size="sm" />
              <span className="text-xs text-muted-foreground">
                ({material.total_avaliacoes})
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
