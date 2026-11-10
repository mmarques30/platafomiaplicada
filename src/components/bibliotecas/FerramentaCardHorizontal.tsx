import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { ChipMeta, ChipVeredito, NotaMari } from "./ChipsRecurso";
import { LinhaRecurso } from "./LinhaRecurso";

interface FerramentaCardHorizontalProps {
  ferramenta: {
    id: string;
    nome: string;
    logo_url: string | null;
    categoria: string;
    objetivo: string;
    avaliacao_mari: number | null;
    avaliacao_comunidade: number | null;
    total_avaliacoes_comunidade: number | null;
    gratuito: boolean;
    vale_a_pena: boolean | null;
    link_ferramenta: string | null;
  };
  onVerMais: () => void;
}

/**
 * Uma linha da biblioteca de ferramentas.
 *
 * Esta era a pior da plataforma. Cada linha trazia dois botões
 * sólidos, "Ver Detalhes" em lime cheio e "Acessar" contornado, mais
 * três pílulas sólidas, mais a nota dentro de uma caixa cinza. Oito
 * linhas assim davam dezesseis botões e vinte e quatro pílulas na
 * mesma tela: uma parede de lime onde nada chamava atenção porque
 * tudo chamava.
 *
 * Agora a linha inteira abre os detalhes, que era o que o primeiro
 * botão fazia. "Acessar" vira um ícone, porque sair da plataforma é a
 * ação secundária, não a principal. As pílulas viraram chips de
 * contorno, e a nota ficou em mono, sem caixa.
 */
export function FerramentaCardHorizontal({ ferramenta, onVerMais }: FerramentaCardHorizontalProps) {
  return (
    <LinhaRecurso
      marcador={
        <ToolLogo
          logoUrl={ferramenta.logo_url}
          toolName={ferramenta.nome}
          linkFerramenta={ferramenta.link_ferramenta}
          size="lg"
        />
      }
      titulo={ferramenta.nome}
      descricao={ferramenta.objetivo}
      meta={
        <>
          <ChipMeta>{ferramenta.categoria}</ChipMeta>
          <ChipMeta>{ferramenta.gratuito ? "Gratuita" : "Paga"}</ChipMeta>
          <ChipVeredito valeAPena={ferramenta.vale_a_pena} />
        </>
      }
      direita={
        ferramenta.avaliacao_mari !== null ? (
          <div className="pr-1">
            <NotaMari nota={ferramenta.avaliacao_mari} className="justify-end" />
            <span className="rotulo-mono block text-[9px]">Nota da Mari</span>
          </div>
        ) : undefined
      }
      acoes={
        <>
          {ferramenta.link_ferramenta && (
            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <a
                      href={ferramenta.link_ferramenta}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${ferramenta.nome}`}
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Abrir o site</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <FavoriteButton tipo="ferramenta" itemId={ferramenta.id} variant="ghost" size="sm" />
        </>
      }
      aoClicar={onVerMais}
    />
  );
}
