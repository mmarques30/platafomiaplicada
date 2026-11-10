import { ReactNode } from "react";
import { Search, X } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FiltroSelecao {
  /** Chave única, usada para o chip de ativo saber quem remover. */
  chave: string;
  /** Texto curto no gatilho quando nada está escolhido. Ex.: "Categoria".
      Curto de propósito: o gatilho tem largura fixa, e "Todas as
      categorias" era cortado em "Todas as...", que não informa nada. */
  rotuloVazio: string;
  /** Texto da opção "sem filtro" dentro da lista. Ex.: "Todas as
      categorias". Ali há espaço, e a frase inteira é mais clara. */
  rotuloLista?: string;
  valor: string;
  /** O valor que significa "sem filtro". Normalmente "todas" ou "todos". */
  valorVazio: string;
  opcoes: string[];
  aoMudar: (valor: string) => void;
  /** Como escrever a opção na lista. Por padrão, ela mesma. */
  formatar?: (opcao: string) => string;
  larguraClasse?: string;
}

interface BarraFiltrosProps {
  busca: string;
  aoBuscar: (valor: string) => void;
  placeholderBusca?: string;
  filtros?: FiltroSelecao[];
  /** Quantos itens a lista está mostrando agora. */
  total?: number;
  /** Palavra do que se conta. Ex.: "prompt". O plural é derivado. */
  substantivo?: string;
  /** Controles extras à direita, como alternância de visão. */
  acoes?: ReactNode;
  className?: string;
}

/**
 * A barra de filtros das listas.
 *
 * Antes cada página montava a sua: uma tinha quatro seletores grandes
 * em linha, outra tinha três de larguras diferentes, e nenhuma dizia
 * quais filtros estavam ligados nem como desligá-los. Para limpar, a
 * pessoa tinha de voltar seletor por seletor e lembrar o que havia
 * mexido.
 *
 * Esta é uma só, e acrescenta o que faltava: os chips do que está
 * ativo, cada um com o seu X, e um "limpar tudo" que só aparece quando
 * há o que limpar. A contagem fica na mesma linha, à direita, porque é
 * a resposta imediata a mexer num filtro.
 */
export function BarraFiltros({
  busca,
  aoBuscar,
  placeholderBusca = "Buscar...",
  filtros = [],
  total,
  substantivo,
  acoes,
  className,
}: BarraFiltrosProps) {
  const ativos = filtros.filter((f) => f.valor !== f.valorVazio);
  const temBusca = busca.trim().length > 0;
  const temAlgo = ativos.length > 0 || temBusca;

  const limparTudo = () => {
    aoBuscar("");
    ativos.forEach((f) => f.aoMudar(f.valorVazio));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 md:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => aoBuscar(e.target.value)}
            placeholder={placeholderBusca}
            aria-label={placeholderBusca}
            className="h-10 w-full rounded-full border border-border bg-surface/70 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-primary/30 focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {filtros.map((filtro) => (
          <Select key={filtro.chave} value={filtro.valor} onValueChange={filtro.aoMudar}>
            <SelectTrigger
              className={cn(
                "h-10 rounded-full border-border bg-surface/70 px-4 text-sm data-[state=open]:border-primary/55",
                filtro.valor !== filtro.valorVazio && "border-primary/45 text-foreground",
                filtro.larguraClasse ?? "w-[172px]",
              )}
            >
              {filtro.valor === filtro.valorVazio ? (
                <span className="truncate text-muted-foreground">{filtro.rotuloVazio}</span>
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={filtro.valorVazio}>{filtro.rotuloLista ?? filtro.rotuloVazio}</SelectItem>
              {filtro.opcoes.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>
                  {filtro.formatar ? filtro.formatar(opcao) : opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <div className="ml-auto flex items-center gap-3">
          {acoes}
          {total !== undefined && substantivo && (
            <span className="rotulo-mono whitespace-nowrap text-[10px]">
              {total} {total === 1 ? substantivo : `${substantivo}s`}
            </span>
          )}
        </div>
      </div>

      {/* O que está ligado agora, e como desligar cada coisa. */}
      {temAlgo && (
        <div className="flex flex-wrap items-center gap-2">
          {temBusca && (
            <ChipAtivo rotulo={`"${busca.trim()}"`} aoRemover={() => aoBuscar("")} />
          )}
          {ativos.map((filtro) => (
            <ChipAtivo
              key={filtro.chave}
              rotulo={filtro.formatar ? filtro.formatar(filtro.valor) : filtro.valor}
              aoRemover={() => filtro.aoMudar(filtro.valorVazio)}
            />
          ))}
          <button
            type="button"
            onClick={limparTudo}
            className="text-[11px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}

function ChipAtivo({ rotulo, aoRemover }: { rotulo: string; aoRemover: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/10 py-1 pl-3 pr-1 text-[11px] font-medium text-primary">
      <span className="max-w-[180px] truncate">{rotulo}</span>
      <button
        type="button"
        onClick={aoRemover}
        aria-label={`Remover filtro ${rotulo}`}
        className="grid h-5 w-5 place-items-center rounded-full transition-colors hover:bg-primary/20"
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </span>
  );
}
