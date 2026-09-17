import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConteudoDashboard } from "@/hooks/useConteudosDashboard";
import { tipoInfo, tempoLeitura } from "@/lib/conteudoTipos";
import { cn } from "@/lib/utils";

interface ConteudoCardProps {
  conteudo: ConteudoDashboard;
  /** Sem onClick, o card leva para a Central. */
  onClick?: () => void;
  className?: string;
}

/**
 * Card de conteúdo curado.
 *
 * Cada informação aparece uma vez só: a capa é imagem ou arte da marca (nunca
 * texto), o título é o título, e o resumo é a frase de por que aquilo importa.
 */
export function ConteudoCard({ conteudo, onClick, className }: ConteudoCardProps) {
  const navigate = useNavigate();
  const [imgQuebrada, setImgQuebrada] = useState(false);

  const info = tipoInfo(conteudo.tipo);
  const Icon = info.icon;
  const temImagem = !!conteudo.imagem_url && !imgQuebrada;
  const minutos = tempoLeitura(conteudo.conteudo);

  const handleClick = onClick ?? (() => navigate("/central"));

  return (
    <article
      onClick={handleClick}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg",
        className
      )}
    >
      {/* Capa: imagem do conteúdo ou arte da marca. Nunca texto. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {temImagem ? (
          <img
            src={conteudo.imagem_url as string}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgQuebrada(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn("relative h-full w-full bg-gradient-to-br", info.capa)}>
            <div className="absolute inset-0 dot-grid-bg opacity-40" />
            <Icon
              className="absolute -bottom-3 -right-2 h-24 w-24 text-foreground/[0.14]"
              strokeWidth={1.25}
            />
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-chrome/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-chrome-foreground backdrop-blur">
          <Icon className="h-3 w-3" />
          {info.label}
        </span>
        {conteudo.destaque && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {conteudo.titulo}
        </h3>

        {/* Por que isso importa. Aparece uma vez só. */}
        {conteudo.resumo && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {conteudo.resumo}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
          <span>
            {minutos
              ? `${minutos} min de leitura`
              : format(new Date(conteudo.created_at), "dd MMM yyyy", { locale: ptBR })}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-primary/70 transition-colors group-hover:text-primary">
            {info.acao}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
