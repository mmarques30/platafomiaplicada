import { Cpu } from "lucide-react";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ChipMeta } from "./ChipsRecurso";
import { LinhaRecurso } from "./LinhaRecurso";

interface IACopieUseRowProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    ia_recomendada?: string | null;
  };
  onClick: () => void;
}

/**
 * Uma linha dos modelos prontos.
 *
 * Sai o ícone de faísca dentro do quadrado lime, que era igual em
 * todas as linhas e por isso não distinguia nada, e sai o botão "Ver",
 * que repetia o clique na linha. Fica a ferramenta recomendada, que é
 * a informação que decide se o modelo serve para quem está lendo.
 */
export function IACopieUseRow({ ia, onClick }: IACopieUseRowProps) {
  return (
    <LinhaRecurso
      titulo={ia.titulo}
      descricao={ia.descricao}
      meta={
        <>
          <ChipMeta>{ia.categoria}</ChipMeta>
          {ia.ia_recomendada && (
            <ChipMeta>
              <Cpu className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="max-w-[140px] truncate">{ia.ia_recomendada}</span>
            </ChipMeta>
          )}
        </>
      }
      acoes={<FavoriteButton tipo="ia_copie_use" itemId={ia.id} variant="icon-only" size="sm" />}
      aoClicar={onClick}
    />
  );
}
