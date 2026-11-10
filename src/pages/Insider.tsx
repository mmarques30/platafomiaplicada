import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Handshake, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
import { PageContainer } from "@/components/shared/PageContainer";
import { useIndicacoes } from "@/hooks/useIndicacoes";
import { separarEncontros, useEncontros } from "@/hooks/useEncontros";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useProgramaPapel } from "@/hooks/usePrograma";

/** Um número do painel, em vidro, como nas outras entradas da plataforma. */
function Numero({
  rotulo,
  valor,
  apoio,
}: {
  rotulo: string;
  valor: string;
  apoio: string;
}) {
  return (
    <div className="vidro p-3.5 sm:p-4">
      <div className="flex items-baseline justify-between gap-3 sm:block">
        <span className="rotulo-mono whitespace-nowrap text-[10px]">{rotulo}</span>
        <p className="numero-painel text-2xl leading-none text-foreground sm:mt-2 sm:text-[30px]">
          {valor}
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2">{apoio}</p>
    </div>
  );
}

/** Uma porta do ambiente: o que é, para quem, e para onde leva. */
function Porta({
  icone: Icone,
  rotulo,
  titulo,
  descricao,
  para,
  acao,
  bloqueada,
  motivo,
}: {
  icone: typeof Handshake;
  rotulo: string;
  titulo: string;
  descricao: string;
  para?: string;
  acao?: string;
  bloqueada?: boolean;
  motivo?: string;
}) {
  const miolo = (
    <>
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border/70 bg-surface">
        {bloqueada ? (
          <Lock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <Icone className="h-6 w-6 text-primary" strokeWidth={1.5} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <span className="rotulo-mono">{rotulo}</span>
        <h3
          className={
            bloqueada
              ? "mt-1 text-base font-medium text-foreground md:text-lg"
              : "mt-1 text-base font-medium text-foreground transition-colors group-hover:text-primary md:text-lg"
          }
        >
          {titulo}
        </h3>
        <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">{descricao}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end md:gap-1">
        {bloqueada ? (
          <span className="rotulo-mono max-w-[220px] text-right text-[10px]">{motivo}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {acao}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </span>
        )}
      </div>
    </>
  );

  const classe =
    "superficie flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-8 md:p-6";

  if (bloqueada || !para) {
    return <div className={`${classe} opacity-70`}>{miolo}</div>;
  }

  return (
    <Link to={para} className={`${classe} superficie-interativa group`}>
      {miolo}
    </Link>
  );
}

/**
 * O ambiente do Insider.
 *
 * O Insider existia espalhado: os encontros numa página sob Aprender, o
 * programa de indicação noutra de primeiro nível, e nada que dissesse o que o
 * Insider é nem o que a pessoa tem direito nele. Quem entrava como convidado
 * via menos menus que um aluno e nenhuma explicação do porquê.
 *
 * Esta é a entrada: diz o formato da pessoa, mostra os números do que ela já
 * tem em andamento, e abre as portas do ambiente. O convidado vê o Indica
 * inteiro — indica, acompanha e recebe igual — e vê os encontros como porta
 * fechada, com o motivo escrito, em vez de um menu que simplesmente não
 * aparece.
 */
export default function Insider() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBusinessSistemas, isInsiderFree } = useEffectivePlan(isAdmin, roleLoading);

  const pago = isBusinessSistemas;
  const { data: encontros = [] } = useEncontros();
  const { data: indicacoes = [] } = useIndicacoes();
  const { papel } = useProgramaPapel();

  const { agendados, realizados } = useMemo(() => separarEncontros(encontros), [encontros]);
  const proximo = agendados[0];

  const emAndamento = indicacoes.filter(
    (i) => i.status !== "fechada" && i.status !== "perdida",
  ).length;
  const fechadas = indicacoes.filter((i) => i.status === "fechada").length;

  const numeros = pago
    ? [
        {
          rotulo: "Próximo encontro",
          valor: proximo?.data_aula ? format(parseISO(proximo.data_aula), "dd/MM") : "—",
          apoio: proximo?.data_aula
            ? format(parseISO(proximo.data_aula), "EEEE", { locale: ptBR }) +
              (proximo.horario ? `, ${proximo.horario}` : "")
            : "nenhum agendado",
        },
        {
          rotulo: "Encontros",
          valor: String(realizados.length),
          apoio: realizados.length === 1 ? "já realizado" : "já realizados",
        },
        {
          rotulo: "Indicações",
          valor: String(emAndamento),
          apoio:
            fechadas > 0
              ? `${fechadas} já fechada${fechadas === 1 ? "" : "s"}`
              : "em andamento",
        },
      ]
    : [
        {
          rotulo: "Indicações",
          valor: String(emAndamento),
          apoio: "em andamento",
        },
        {
          rotulo: "Fechadas",
          valor: String(fechadas),
          apoio: fechadas === 1 ? "indicação fechada" : "indicações fechadas",
        },
        {
          rotulo: "Seu acesso",
          valor: "Convidado",
          apoio: "o Indica é seu por inteiro",
        },
      ];

  return (
    <PageContainer>
      <section className="painel-marca px-5 pb-6 pt-7 md:px-8 md:pb-8 md:pt-9">
        <MarcaIAplicada className="marca-de-fundo -right-[14%] top-1/2 h-[190%] w-auto max-w-none -translate-y-1/2 rotate-[14deg] md:right-[1%] md:h-[155%]" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <span className="rotulo-mono">
              {pago ? "Insider Business" : isInsiderFree ? "Insider Convidado" : "Insider"}
            </span>
            <h1 className="font-serif-display mt-1.5 text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl lg:text-[44px]">
              Meu <em className="font-serif-italic text-primary">Insider</em>
            </h1>
            <p className="mt-2.5 max-w-prose text-sm text-muted-foreground md:text-base">
              {pago
                ? "Os encontros do seu projeto e o programa de indicação, no mesmo lugar."
                : "Você entra como convidado: o programa de indicação é seu por inteiro, e os encontros são do Insider contratado."}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
            {numeros.map((n) => (
              <Numero key={n.rotulo} {...n} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="rotulo-mono">O que tem aqui dentro</h2>

        <Porta
          icone={Handshake}
          rotulo="Programa de indicação"
          titulo="IAplicada Indica"
          descricao={
            papel
              ? "Você apresenta, a equipe conduz proposta e fechamento, e você acompanha o que cada indicação gerou."
              : "Você indica um dono de empresa com a operação travada. A equipe conduz proposta e fechamento, e você escolhe como recebe."
          }
          para="/indica"
          acao="Abrir o painel"
        />

        <Porta
          icone={CalendarDays}
          rotulo="Encontros"
          titulo="Encontros Insider"
          descricao="As sessões marcadas, com tema, quem fala, o material e o link para entrar."
          para={pago ? "/encontros" : undefined}
          acao="Ver a agenda"
          bloqueada={!pago}
          motivo="Do Insider contratado"
        />
      </section>
    </PageContainer>
  );
}
