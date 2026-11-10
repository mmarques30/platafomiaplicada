import { useState } from "react";
import { Check, Copy, Layers } from "lucide-react";
import { toast } from "sonner";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { CartaoRecurso, MarcadorCapa } from "./CartaoRecurso";

export interface LogoDaFerramenta {
  logoUrl: string | null;
  linkFerramenta: string | null;
}

interface IACopieUseCardProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    conteudo?: string | null;
    ia_recomendada?: string | null;
  };
  /** Resolve o logo da ferramenta pelo nome, com o cadastro da Biblioteca. */
  logoDe?: (nome: string) => LogoDaFerramenta;
  onClick: () => void;
}

/**
 * Um cartão de modelo pronto.
 *
 * O que identifica um modelo não é como o texto dele começa, é para que
 * ferramenta ele é e de que tipo. A capa diz isso, e o botão de copiar fica
 * no cartão porque a biblioteca chama "copie e use".
 *
 * A forma veio para `CartaoRecurso` e agora serve as quatro bibliotecas.
 */
export function IACopieUseCard({ ia, logoDe, onClick }: IACopieUseCardProps) {
  const [copiado, setCopiado] = useState(false);

  const ferramenta = ia.ia_recomendada?.trim() || null;
  const logo = ferramenta && logoDe ? logoDe(ferramenta) : null;

  const copiar = async () => {
    if (!ia.conteudo) return;
    try {
      await navigator.clipboard.writeText(ia.conteudo);
      setCopiado(true);
      toast.success("Modelo copiado");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Abra o modelo e copie de lá.");
    }
  };

  return (
    <CartaoRecurso
      chaveCapa={ia.titulo}
      marcador={
        ferramenta ? (
          <ToolLogo
            logoUrl={logo?.logoUrl ?? null}
            toolName={ferramenta}
            linkFerramenta={logo?.linkFerramenta ?? null}
            size="lg"
            className="border border-border/70 bg-card/80 backdrop-blur"
          />
        ) : (
          <MarcadorCapa>
            <Layers className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </MarcadorCapa>
        )
      }
      capaRotulo={ia.categoria}
      capaTitulo={ferramenta ?? "Qualquer ferramenta"}
      titulo={ia.titulo}
      descricao={ia.descricao}
      favorito={
        <FavoriteButton tipo="ia_copie_use" itemId={ia.id} variant="icon-only" size="sm" />
      }
      acoes={
        ia.conteudo ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copiar();
            }}
            aria-label={`Copiar o modelo ${ia.titulo}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {copiado ? (
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
            )}
            {copiado ? "Copiado" : "Copiar"}
          </button>
        ) : null
      }
      aoClicar={onClick}
    />
  );
}
