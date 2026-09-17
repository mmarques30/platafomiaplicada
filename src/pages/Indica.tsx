import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { CartaoIndicacao } from "@/components/indica/CartaoIndicacao";
import { NovaIndicacaoModal } from "@/components/indica/NovaIndicacaoModal";
import { ResumoPrograma } from "@/components/indica/ResumoPrograma";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { useIndicacoes } from "@/hooks/useIndicacoes";
import { usePercentualDaProxima, useProgramaPapel } from "@/hooks/usePrograma";
import { listaCascata } from "@/lib/motion";

const WHATSAPP_COMERCIAL = "5531990643023";

/** Quem ainda não tem papel no programa vê o convite para entrar, não o painel. */
function SemPapel() {
  return (
    <PageContainer>
      <PageTitle
        primary="IAplicada"
        secondary="Indica"
        description="Você indica um dono de empresa com a operação travada. A gente conduz proposta e fechamento. Fechou, você escolhe como recebe."
      />

      <div className="space-y-4 rounded-card border border-border bg-card p-5 shadow-card md:p-6">
        <span className="rotulo-mono">Dois caminhos</span>
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="titulo-bloco text-base text-foreground">Indicação simples</h2>
            <p className="text-sm text-muted-foreground">
              Você manda nome e WhatsApp. Se fechar, escolhe entre cashback progressivo ou um
              aditivo no sistema que já roda para você.
            </p>
          </div>
          <div className="space-y-1">
            <h2 className="titulo-bloco text-base text-foreground">Parceria estruturada</h2>
            <p className="text-sm text-muted-foreground">
              Para quem tem base própria de empresários e quer receita recorrente. Contrato
              formal, painel ativo e comissão conforme o cliente paga.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-card border border-primary/30 bg-primary/[0.04] p-5 md:p-6">
        <p className="text-sm text-foreground">
          Quem define o formato é a equipe, numa conversa de 45 minutos. Depois disso o seu
          painel abre aqui.
        </p>
        <Button asChild className="cta-lime">
          <a
            href={`https://wa.me/${WHATSAPP_COMERCIAL}`}
            target="_blank"
            rel="noreferrer"
          >
            Falar com a equipe
          </a>
        </Button>
      </div>
    </PageContainer>
  );
}

/**
 * O painel do programa: o formato da pessoa, o que a próxima indicação vale e
 * o que cada indicação virou.
 */
export default function Indica() {
  const { papel, regra, isLoading: carregandoPapel } = useProgramaPapel();
  const { percentual } = usePercentualDaProxima();
  const { data: indicacoes = [], isLoading: carregandoIndicacoes } = useIndicacoes();
  const [modalAberto, setModalAberto] = useState(false);

  if (carregandoPapel) {
    return (
      <PageContainer>
        <div className="h-10 w-64 animate-skeleton-pulse rounded bg-foreground/[0.08]" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-skeleton-pulse rounded-card bg-foreground/[0.05]"
            />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!papel) return <SemPapel />;

  const abreBase = papel.papel === "parceria_aberta";
  const rotuloBotao = abreBase ? "Adicionar à base" : "Nova indicação";

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          primary="IAplicada"
          secondary="Indica"
          description={
            abreBase
              ? "Você compartilha a base qualificada, a equipe conduz a venda e você acompanha cada conversa por aqui."
              : "Você apresenta, a equipe conduz proposta e fechamento, e você acompanha o que cada indicação gerou."
          }
        />
        <Button className="cta-lime" onClick={() => setModalAberto(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          {rotuloBotao}
        </Button>
      </div>

      <ResumoPrograma
        papel={papel}
        regra={regra}
        percentualProxima={percentual}
        indicacoes={indicacoes}
        carregando={carregandoIndicacoes}
      />

      <section className="space-y-4">
        <h2 className="rotulo-mono">Suas indicações</h2>

        {carregandoIndicacoes ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-36 animate-skeleton-pulse rounded-card bg-foreground/[0.05]"
              />
            ))}
          </div>
        ) : indicacoes.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma indicação ainda. Comece pelo nome que já está na sua cabeça.
            </p>
          </div>
        ) : (
          <motion.div
            variants={listaCascata}
            initial="inicial"
            animate="ativo"
            className="space-y-3"
          >
            {indicacoes.map((indicacao) => (
              <CartaoIndicacao key={indicacao.id} indicacao={indicacao} />
            ))}
          </motion.div>
        )}
      </section>

      <NovaIndicacaoModal aberto={modalAberto} onAbertoChange={setModalAberto} />
    </PageContainer>
  );
}
