import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * As três linhas da sidebar, em um lugar só.
 *
 * Antes cada nível era montado na mão dentro do AppSidebar, com as
 * classes repetidas cinco vezes e divergindo entre si: o bloco de
 * Materiais tinha um visual, os menus do banco tinham outro, e o
 * terceiro nível tinha um terceiro. Mudar a aparência de um item
 * significava caçar as cópias.
 *
 * O desenho dos três segue a mesma ideia: o pai é um botão com peso,
 * fundo e ícone; o filho é texto indentado; o neto é texto menor
 * dentro de uma guia vertical que mostra a quem pertence. A diferença
 * entre eles é hierarquia visível, não só indentação.
 */

interface ItemPaiProps {
  rotulo: string;
  icone: ReactNode;
  para: string;
  ativo: boolean;
  /** Tem filhos? Então ganha a setinha. */
  expansivel?: boolean;
  aberto?: boolean;
  aoAlternar?: () => void;
  aoNavegar?: () => void;
  recolhido?: boolean;
  dataTour?: string;
}

/**
 * Nível 1. Clicar no nome navega e abre o grupo; clicar na setinha só
 * abre ou fecha. Dois alvos separados de propósito: pendurar as duas
 * ações no mesmo elemento foi o que, antes, fazia o grupo abrir e
 * fechar no mesmo clique.
 */
export function ItemPai({
  rotulo,
  icone,
  para,
  ativo,
  expansivel,
  aberto,
  aoAlternar,
  aoNavegar,
  recolhido,
  dataTour,
}: ItemPaiProps) {
  return (
    <div className="flex items-center gap-1">
      <NavLink
        to={para}
        onClick={aoNavegar}
        data-tour={dataTour}
        title={recolhido ? rotulo : undefined}
        className={cn(
          "group relative flex h-10 flex-1 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition-all duration-200",
          ativo
            ? "bg-primary/[0.14] text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.28)]"
            : "text-foreground/70 hover:bg-sidebar-accent hover:text-foreground",
        )}
      >
        {/* A barra da esquerda marca o grupo da rota atual. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-200",
            ativo ? "opacity-100" : "opacity-0 group-hover:opacity-40",
          )}
        />
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center transition-colors",
            ativo ? "text-primary" : "text-foreground/55 group-hover:text-foreground/80",
          )}
        >
          {icone}
        </span>
        {!recolhido && <span className="truncate">{rotulo}</span>}
      </NavLink>

      {expansivel && !recolhido && (
        <button
          type="button"
          aria-label={aberto ? `Recolher ${rotulo}` : `Expandir ${rotulo}`}
          aria-expanded={aberto}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            aoAlternar?.();
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", aberto && "rotate-180")}
            strokeWidth={1.75}
          />
        </button>
      )}
    </div>
  );
}

interface ItemFilhoProps {
  rotulo: string;
  para: string;
  ativo: boolean;
  /** Número vivo à direita, ex.: "4". Só quando significa algo. */
  contador?: number;
  expansivel?: boolean;
  aberto?: boolean;
  aoAlternar?: () => void;
}

/** Nível 2: texto indentado, sem ícone. A indentação já diz o que é. */
export function ItemFilho({
  rotulo,
  para,
  ativo,
  contador,
  expansivel,
  aberto,
  aoAlternar,
}: ItemFilhoProps) {
  return (
    <div className="flex items-center">
      <NavLink
        to={para}
        end
        className={cn(
          "flex h-9 flex-1 items-center rounded-lg px-3 text-[13px] transition-colors duration-200",
          ativo
            ? "bg-primary/[0.1] font-medium text-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
        )}
      >
        <span className="truncate">{rotulo}</span>
        {contador !== undefined && contador > 0 && (
          <span className="ml-auto shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
            {contador > 99 ? "99+" : contador}
          </span>
        )}
      </NavLink>

      {expansivel && (
        <button
          type="button"
          aria-label={aberto ? `Recolher ${rotulo}` : `Expandir ${rotulo}`}
          aria-expanded={aberto}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            aoAlternar?.();
          }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-foreground/35 transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-200", aberto && "rotate-180")}
            strokeWidth={1.75}
          />
        </button>
      )}
    </div>
  );
}

/** Nível 3: menor, dentro da guia vertical do pai. */
export function ItemNeto({ rotulo, para, ativo }: { rotulo: string; para: string; ativo: boolean }) {
  return (
    <NavLink
      to={para}
      end
      className={cn(
        "flex h-8 items-center rounded-md px-3 text-[12.5px] transition-colors duration-200",
        ativo
          ? "font-medium text-primary"
          : "text-muted-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <span className="truncate">{rotulo}</span>
    </NavLink>
  );
}

/** O bloco indentado que segura os filhos, com a guia vertical. */
export function BlocoFilhos({ children }: { children: ReactNode }) {
  return (
    <div className="ml-[18px] mt-1 space-y-0.5 border-l border-border/70 pl-2">{children}</div>
  );
}
