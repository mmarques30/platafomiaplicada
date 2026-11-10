import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Os chips das listas densas.
 *
 * Antes cada atributo virava uma pílula sólida: categoria em cinza,
 * nível em verde, amarelo ou vermelho, "vale a pena" em verde, "não
 * recomendado" em vermelho forte. Três a quatro manchas de cor por
 * linha, em nove linhas, e a tela virava um semáforo onde nada
 * sobressaía — justamente o contrário do que o destaque serve.
 *
 * Aqui o padrão é o oposto: chip de contorno, cor só quando a cor
 * significa alguma coisa. Nível não é estado, é escala, então vira
 * uma barrinha de três traços em vez de vermelho. Vermelho fica
 * reservado para o que é de fato um alerta.
 */

/** Categoria, ferramenta, tag: informação neutra. */
export function ChipMeta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

const NIVEIS: Record<string, { rotulo: string; traços: number }> = {
  iniciante: { rotulo: "Iniciante", traços: 1 },
  intermediario: { rotulo: "Intermediário", traços: 2 },
  intermediário: { rotulo: "Intermediário", traços: 2 },
  avancado: { rotulo: "Avançado", traços: 3 },
  avançado: { rotulo: "Avançado", traços: 3 },
};

/**
 * O nível, como escala e não como semáforo.
 *
 * Três traços preenchidos conforme a dificuldade, na cor da marca.
 * "Avançado" em vermelho dizia à pessoa que havia algo errado com o
 * item, quando o que havia era só conteúdo mais denso.
 */
export function ChipNivel({ nivel, className }: { nivel: string | null; className?: string }) {
  if (!nivel) return null;
  const info = NIVEIS[nivel.toLowerCase()];
  if (!info) return <ChipMeta className={className}>{nivel}</ChipMeta>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
      title={`Nível: ${info.rotulo}`}
    >
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "w-[3px] rounded-full transition-colors",
              n === 1 && "h-[5px]",
              n === 2 && "h-[8px]",
              n === 3 && "h-[11px]",
              n <= info.traços ? "bg-primary" : "bg-muted-foreground/25",
            )}
          />
        ))}
      </span>
      {info.rotulo}
    </span>
  );
}

/**
 * O veredito da Mariana sobre a ferramenta.
 *
 * Continua sendo a única informação da linha que merece cor, porque é
 * uma recomendação e não um rótulo. Mas o "não recomendado" deixa de
 * ser um bloco vermelho sólido: vira contorno, porque ele informa, não
 * alerta sobre um erro do sistema.
 */
export function ChipVeredito({ valeAPena, className }: { valeAPena: boolean | null; className?: string }) {
  if (valeAPena === null || valeAPena === undefined) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        valeAPena
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-destructive/35 bg-destructive/10 text-destructive",
        className,
      )}
    >
      {valeAPena ? (
        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <Minus className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
      )}
      {valeAPena ? "Vale a pena" : "Não recomendo"}
    </span>
  );
}

/** A nota, em mono, sem a caixa cinza que antes a cercava. */
export function NotaMari({ nota, className }: { nota: number | null; className?: string }) {
  if (nota === null || nota === undefined) return null;
  return (
    <span className={cn("flex items-baseline gap-1", className)}>
      <span className="numero-painel text-base text-foreground">
        {nota.toLocaleString("pt-BR", { minimumFractionDigits: nota % 1 === 0 ? 0 : 1 })}
      </span>
      <span className="text-[11px] text-muted-foreground">/5</span>
    </span>
  );
}
