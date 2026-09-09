import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, Globe, Lightbulb, FileText, ExternalLink, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConteudoDashboard } from "@/hooks/useConteudosDashboard";
import { cn } from "@/lib/utils";

interface ConteudoCardProps {
  conteudo: ConteudoDashboard;
  /** Sem onClick, o card leva para a Central na aba do tipo. */
  onClick?: () => void;
  className?: string;
}

const TIPO: Record<string, { label: string; icon: LucideIcon }> = {
  newsletter: { label: "Newsletter", icon: Newspaper },
  noticia: { label: "Notícia", icon: Globe },
  dica: { label: "Dica prática", icon: Lightbulb },
  material: { label: "Material", icon: FileText },
};

/**
 * Card compacto de conteúdo (Notícias IA, Dicas, Newsletter).
 * Capa 16:9 com a imagem da notícia; sem imagem, a capa vira o resumo.
 */
export function ConteudoCard({ conteudo, onClick, className }: ConteudoCardProps) {
  const navigate = useNavigate();
  const [imgQuebrada, setImgQuebrada] = useState(false);
  const tipo = TIPO[conteudo.tipo] ?? TIPO.noticia;
  const Icon = tipo.icon;
  const temImagem = !!conteudo.imagem_url && !imgQuebrada;

  const handleClick = onClick ?? (() => navigate(`/central?tab=${conteudo.tipo}`));

  return (
    <article
      onClick={handleClick}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50",
        className
      )}
    >
      {/* Capa: imagem da notícia ou, na falta dela, o resumo */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {temImagem ? (
          <img
            src={conteudo.imagem_url as string}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgQuebrada(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-start bg-gradient-to-br from-muted to-card px-4 pb-3 pt-11">
            <p className="line-clamp-3 text-[13px] leading-snug text-foreground/85">{conteudo.resumo}</p>
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-chrome/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-chrome-foreground backdrop-blur">
          <Icon className="h-3 w-3" />
          {tipo.label}
        </span>
        {conteudo.destaque && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            Destaque
          </span>
        )}
      </div>

      {/* Texto */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {conteudo.titulo}
        </h3>
        {temImagem && conteudo.resumo && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{conteudo.resumo}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
          <span>{format(new Date(conteudo.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
          {conteudo.link_externo && (
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              Abrir
              <ExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
