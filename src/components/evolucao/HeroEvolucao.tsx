import { motion } from "framer-motion";
import { Award, Flame, PlayCircle } from "lucide-react";

import { AnelProgresso, Faisca } from "@/components/graficos";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
import { useNivelUsuario } from "@/hooks/useNivelUsuario";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { useRitmoEstudo } from "@/hooks/useRitmoEstudo";
import { itemCascata, listaCascata, aoMontar } from "@/lib/motion";

/**
 * A abertura de Meu progresso.
 *
 * Era uma barra de progresso fina atravessando um card chapado, com três
 * caixinhas embaixo. A informação principal da página — quanto falta para o
 * próximo nível — ficava num traço de 8px de altura que ninguém olha.
 *
 * Agora o nível é um anel: ele reserva o centro para o número e o arco
 * responde "quanto falta" sem precisar de legenda. O fundo é o painel de
 * marca, com o símbolo atrás, e os três cartões por cima são de vidro, então
 * a marca aparece através deles — o mesmo tratamento da tela inicial, para as
 * duas páginas se reconhecerem.
 *
 * A sequência de dias ganhou a faísca das últimas duas semanas, porque
 * "7 dias" sem o caminho não diz se a pessoa está subindo ou acabou de
 * recomeçar.
 */
export function HeroEvolucao() {
  const { nivel, xpAtual, xpNecessario, porcentagemNivel, tituloNivel, proximoTitulo } =
    useNivelUsuario();
  const { data: evolucao } = useMinhaEvolucao();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados } = useMeusCertificados();
  const { dados: ritmo } = useRitmoEstudo();

  const totalCertificados = certificados?.filter((c) => c.status === "emitido").length || 0;
  const faltamXp = Math.max(0, xpNecessario - xpAtual);

  const cartoes = [
    {
      icone: Flame,
      rotulo: "Sequência",
      valor: sequencia || 0,
      unidade: (sequencia || 0) === 1 ? "dia seguido" : "dias seguidos",
      serie: ritmo.faisca,
    },
    {
      icone: PlayCircle,
      rotulo: "Aulas",
      valor: evolucao?.totalVideos || 0,
      unidade: "concluídas no total",
    },
    {
      icone: Award,
      rotulo: "Certificados",
      valor: totalCertificados,
      unidade: totalCertificados === 1 ? "emitido" : "emitidos",
    },
  ];

  return (
    <section className="painel-marca px-5 pb-6 pt-7 md:px-8 md:pb-8 md:pt-9">
      <MarcaIAplicada className="marca-de-fundo -right-[12%] top-1/2 h-[180%] w-auto max-w-none -translate-y-1/2 rotate-[14deg] md:right-[1%] md:h-[150%]" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex items-center gap-6">
          <AnelProgresso
            valor={porcentagemNivel}
            centro={String(nivel)}
            rotulo="nível"
            tamanho={126}
          />
          <div className="min-w-0">
            <span className="rotulo-mono">Nível {nivel}</span>
            <h2 className="font-serif-display mt-1.5 text-3xl leading-none text-foreground md:text-4xl">
              {tituloNivel}
            </h2>
            <p className="mt-2.5 text-sm text-muted-foreground">
              <span className="numero-painel text-foreground">
                {xpAtual.toLocaleString("pt-BR")}
              </span>{" "}
              de {xpNecessario.toLocaleString("pt-BR")} XP
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Faltam{" "}
              <span className="font-medium text-primary">{faltamXp.toLocaleString("pt-BR")} XP</span>{" "}
              para {proximoTitulo}
            </p>
          </div>
        </div>

        <motion.div
          variants={listaCascata}
          {...aoMontar}
          className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {cartoes.map(({ icone: Icone, rotulo, valor, unidade, serie }) => (
            <motion.div key={rotulo} variants={itemCascata} className="vidro p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icone className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                <span className="rotulo-mono text-[10px]">{rotulo}</span>
              </div>
              <p className="numero-painel mt-2.5 text-[30px] text-foreground">{valor}</p>
              {serie && serie.length > 1 && (
                <Faisca dados={serie} id={`hero-${rotulo.toLowerCase()}`} altura={28} />
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">{unidade}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
