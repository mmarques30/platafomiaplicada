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

function dominio(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Card compacto de conteúdo (Notícias IA, Dicas, Newsletter): capa 16:9 com
 * a imagem do conteúdo ou, na falta dela, o favicon da fonte sobre um fundo
 * neutro; abaixo, título, resumo curto, data e ação.
 */
export function ConteudoCard({ conteudo, onClick, className }: ConteudoCardProps) {
  const navigate = useNavigate();
  const tipo = TIPO[conteudo.tipo] ?? TIPO.noticia;
  const Icon = tipo.icon;
  const host = dominio(conteudo.link_externo);

  const handleClick = onClick ?? (() => navigate(`/central?tab=${conteudo.tipo}`));

  return (
    <article
      onClick={handleClick}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50",
        className
      )}
    >
      {/* Capa */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {conteudo.imagem_url ? (
          <img
            src={conteudo.imagem_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-card">
            {host ? (
              <img
                src={`https://www.google.com/s2/favicons?sz=128&domain_url=${host}`}
                alt=""
                loading="lazy"
                className="h-12 w-12 rounded-xl object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            )}
            {host && <span className="text-[11px] text-muted-foreground">{host}</span>}
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
        {conteudo.resumo && <p className="line-clamp-2 text-xs text-muted-foreground">{conteudo.resumo}</p>}
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
