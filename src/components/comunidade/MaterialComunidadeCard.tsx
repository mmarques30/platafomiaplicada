import { MaterialComunidade } from "@/hooks/useMateriaisComunidade";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./RatingStars";
import { AnimatedAvatarTooltip } from "./AnimatedAvatarTooltip";
import { Paperclip, ChevronRight } from "lucide-react";

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

/** Card compacto de material criado pela comunidade (aba Criadores). */
export function MaterialComunidadeCard({ material, onClick }: MaterialComunidadeCardProps) {
  const criador = material.criador?.nome_completo || "Comunidade";

  return (
    <article
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-2.5">
        <AnimatedAvatarTooltip name={criador} avatarUrl={material.criador?.avatar_url} size="sm" />
        <span className="truncate text-xs text-muted-foreground">{criador}</span>
        <Badge className="ml-auto shrink-0 bg-primary text-[10px] uppercase tracking-wider text-primary-foreground hover:bg-primary">
          {TIPO_LABELS[material.tipo] || material.tipo}
        </Badge>
      </div>

      <div className="space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {material.titulo}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{material.descricao || "Sem descrição"}</p>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
        <Badge variant="outline" className="text-[11px]">
          {CATEGORIA_LABELS[material.categoria] || material.categoria}
        </Badge>
        {material.arquivos_url && material.arquivos_url.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            {material.arquivos_url.length}
          </span>
        )}
        {material.total_avaliacoes > 0 && (
          <span className="inline-flex items-center gap-1">
            <RatingStars rating={Number(material.media_avaliacoes)} size="sm" />({material.total_avaliacoes})
          </span>
        )}
        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </article>
  );
}
