import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { EscolhaRecompensa, RecompensaEscolhida } from "./EscolhaRecompensa";
import { itemCascata } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  ETAPAS_INDICACAO,
  emReais,
  rotuloStatus,
} from "@/integrations/supabase/programa";
import type { IndicacaoComRecompensa } from "@/hooks/useIndicacoes";

interface CartaoIndicacaoProps {
  indicacao: IndicacaoComRecompensa;
}

/**
 * Uma indicação da lista: onde ela está no funil e o que ela gerou.
 *
 * O funil é o mesmo do material (recebida, contato, qualificada, proposta,
 * fechada). "Não seguiu" sai da régua e vira um aviso, porque não é uma etapa
 * a mais: é a conversa parando.
 */
export function CartaoIndicacao({ indicacao }: CartaoIndicacaoProps) {
  const perdida = indicacao.status === "perdida";
  const indiceAtual = ETAPAS_INDICACAO.indexOf(indicacao.status);
  const recompensa = indicacao.recompensa;

  return (
    <motion.article
      variants={itemCascata}
      className="space-y-4 rounded-card border border-border bg-card p-4 shadow-card md:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="titulo-bloco text-lg text-foreground">{indicacao.empresa_nome}</h3>
          <p className="text-xs text-muted-foreground">
            {indicacao.contato_nome ? `${indicacao.contato_nome} · ` : ""}
            indicada em{" "}
            {format(new Date(indicacao.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <span
          className={cn(
            "rotulo-mono rounded-full border px-2.5 py-1",
            indicacao.status === "fechada" && "border-primary/40 bg-primary/10 text-primary",
            perdida && "border-border bg-surface text-muted-foreground",
            !perdida && indicacao.status !== "fechada" && "border-border bg-surface",
          )}
        >
          {rotuloStatus(indicacao.status)}
        </span>
      </header>

      {!perdida && (
        <ol className="flex items-center gap-1">
          {ETAPAS_INDICACAO.map((etapa, indice) => {
            const alcancada = indice <= indiceAtual;
            return (
              <li key={etapa} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    alcancada ? "bg-primary" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "hidden text-[10px] leading-tight sm:block",
                    alcancada ? "text-foreground/80" : "text-muted-foreground/60",
                  )}
                >
                  {rotuloStatus(etapa)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {perdida && indicacao.motivo_perda && (
        <p className="text-xs text-muted-foreground">
          A conversa parou: {indicacao.motivo_perda}
        </p>
      )}

      {indicacao.status === "fechada" && (
        <div className="space-y-3">
          {indicacao.valor_fechado !== null && (
            <p className="text-sm text-muted-foreground">
              Projeto fechado em{" "}
              <span className="text-foreground">{emReais(indicacao.valor_fechado)}</span>
              {indicacao.fechada_em
                ? `, em ${format(new Date(indicacao.fechada_em), "d 'de' MMMM", { locale: ptBR })}.`
                : "."}
            </p>
          )}

          {!recompensa && (
            <p className="rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
              A equipe está fechando o valor da sua recompensa. Assim que estiver pronto, a
              escolha aparece aqui.
            </p>
          )}

          {recompensa?.status === "prevista" && <EscolhaRecompensa recompensa={recompensa} />}

          {recompensa && recompensa.status !== "prevista" && (
            <RecompensaEscolhida recompensa={recompensa} />
          )}
        </div>
      )}
    </motion.article>
  );
}
