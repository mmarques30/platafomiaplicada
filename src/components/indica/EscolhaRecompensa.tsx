import { Gift, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBonusCatalogo, useEscolherRecompensa, valorDoCashback } from "@/hooks/useRecompensas";
import { emPercentual, emReais, type Recompensa } from "@/integrations/supabase/programa";

interface EscolhaRecompensaProps {
  recompensa: Recompensa;
}

/**
 * A escolha do material: cashback progressivo ou um bônus do catálogo.
 *
 * O cashback só aparece como opção quando existe número para mostrar. Se a
 * equipe ainda não registrou valor do projeto nem percentual, a tela diz isso
 * em vez de oferecer uma escolha que o banco recusaria.
 */
export function EscolhaRecompensa({ recompensa }: EscolhaRecompensaProps) {
  const { data: bonus = [] } = useBonusCatalogo();
  const escolher = useEscolherRecompensa();

  const valorCashback = valorDoCashback(recompensa);

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-4">
      <div className="space-y-1">
        <span className="rotulo-mono text-primary">Escolha sua recompensa</span>
        <p className="text-xs text-muted-foreground">
          Fechou. Agora é você que decide como recebe.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={valorCashback === null || escolher.isPending}
          onClick={() =>
            valorCashback !== null &&
            escolher.mutate({
              recompensaId: recompensa.id,
              tipo: "cashback",
              valor: valorCashback,
            })
          }
          className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Wallet className="h-4 w-4 text-primary" strokeWidth={1.5} />
            Cashback
          </span>
          <span className="font-serif-display text-2xl leading-none text-foreground">
            {valorCashback !== null ? emReais(valorCashback) : "A calcular"}
          </span>
          <span className="text-xs text-muted-foreground">
            {valorCashback !== null
              ? `${emPercentual(recompensa.percentual)} sobre ${emReais(recompensa.valor_base)}, liberado conforme o indicado paga.`
              : "A equipe ainda está fechando o valor do projeto."}
          </span>
        </button>

        {bonus.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            disabled={escolher.isPending}
            onClick={() =>
              escolher.mutate({ recompensaId: recompensa.id, tipo: "bonus", bonusId: opcao.id })
            }
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Gift className="h-4 w-4 text-primary" strokeWidth={1.5} />
              {opcao.nome}
            </span>
            <span className="font-serif-display text-2xl leading-none text-foreground">
              {opcao.valor_referencia !== null ? `até ${emReais(opcao.valor_referencia)}` : "sob medida"}
            </span>
            <span className="text-xs text-muted-foreground">
              {opcao.descricao}
              {opcao.prazo_entrega_dias ? ` Entrega em ${opcao.prazo_entrega_dias} dias.` : ""}
            </span>
          </button>
        ))}
      </div>

      {escolher.isPending && (
        <p className="text-xs text-muted-foreground">Registrando sua escolha...</p>
      )}
    </div>
  );
}

interface RecompensaEscolhidaProps {
  recompensa: Recompensa & { bonus: { nome: string; prazo_entrega_dias: number | null } | null; parcelas: { id: string; valor: number; previsto_para: string | null; pago_em: string | null }[] };
}

const ROTULO_STATUS_RECOMPENSA: Record<string, string> = {
  escolhida: "Escolhida, aguardando a equipe confirmar",
  aprovada: "Aprovada, liberação conforme o indicado paga",
  paga: "Liberada",
  cancelada: "Cancelada",
};

/** O que a pessoa já escolheu, e o quanto disso já caiu. */
export function RecompensaEscolhida({ recompensa }: RecompensaEscolhidaProps) {
  const pagas = recompensa.parcelas.filter((p) => p.pago_em);
  const totalPago = pagas.reduce((soma, p) => soma + p.valor, 0);

  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <span className="rotulo-mono">Sua recompensa</span>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-serif-display text-2xl leading-none text-foreground">
          {recompensa.tipo === "bonus"
            ? recompensa.bonus?.nome ?? "Bônus"
            : emReais(recompensa.valor)}
        </span>
        {recompensa.tipo === "cashback" && recompensa.percentual !== null && (
          <span className="text-sm text-muted-foreground">
            {emPercentual(recompensa.percentual)} do projeto
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {ROTULO_STATUS_RECOMPENSA[recompensa.status] ?? recompensa.status}
        {recompensa.tipo === "bonus" && recompensa.bonus?.prazo_entrega_dias
          ? `. Entrega em ${recompensa.bonus.prazo_entrega_dias} dias.`
          : ""}
      </p>

      {recompensa.parcelas.length > 0 && (
        <div className="space-y-1 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">
            {pagas.length} de {recompensa.parcelas.length}{" "}
            {recompensa.parcelas.length === 1 ? "parcela liberada" : "parcelas liberadas"} (
            {emReais(totalPago)}).
          </p>
        </div>
      )}
    </div>
  );
}
