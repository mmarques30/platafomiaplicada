import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChipMeta, ChipNivel } from "./ChipsRecurso";
import { LinhaRecurso } from "./LinhaRecurso";
import { splitTitulo } from "@/lib/titulos";

interface PromptRowProps {
  prompt: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel_complexidade: string | null;
  };
  onClick: () => void;
  /** Cópia rápida do prompt direto na linha, sem abrir o modal. */
  onQuickCopy?: () => void;
  justCopied?: boolean;
}

/**
 * Uma linha da biblioteca de prompts.
 *
 * O que saiu: o ícone de categoria dentro de um quadrado lime, que
 * ocupava 48 pixels para dizer algo que o chip de categoria já diz com
 * a palavra certa; o nível em vermelho, amarelo ou verde, que fazia
 * "avançado" parecer um defeito; e o botão "Ver" ao lado da seta, que
 * repetia o que clicar na linha já faz.
 *
 * O que entrou: a cópia rápida continua, mas só aparece quando a
 * pessoa chega na linha.
 */
export function PromptRow({ prompt, onClick, onQuickCopy, justCopied }: PromptRowProps) {
  const { eyebrow, titulo } = splitTitulo(prompt.titulo);

  return (
    <LinhaRecurso
      sobretitulo={eyebrow || undefined}
      titulo={titulo}
      descricao={prompt.descricao}
      meta={
        <>
          <ChipMeta>{prompt.categoria}</ChipMeta>
          <ChipNivel nivel={prompt.nivel_complexidade} />
        </>
      }
      acoes={
        <>
          {onQuickCopy && (
            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onQuickCopy}
                    aria-label="Copiar prompt"
                  >
                    {justCopied ? (
                      <Check className="h-4 w-4 text-primary" strokeWidth={2} />
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {justCopied ? "Copiado" : "Copiar prompt"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <FavoriteButton tipo="prompt" itemId={prompt.id} variant="ghost" size="sm" />
        </>
      }
      aoClicar={onClick}
    />
  );
}
