import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAulaSemanal } from "@/hooks/useAulaSemanal";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useNivelUsuario } from "@/hooks/useNivelUsuario";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useCountUp } from "@/hooks/useCountUp";
import { formatInTimeZone } from "date-fns-tz";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartaoMetrica, CartaoMetricaSkeleton } from "./CartaoMetrica";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
import { useRitmoEstudo } from "@/hooks/useRitmoEstudo";
import { listaCascata, aoMontar } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TIMEZONE = "America/Sao_Paulo";

const DAY_ABBR: Record<string, string> = {
  "segunda-feira": "Seg",
  "terça-feira": "Ter",
  "quarta-feira": "Qua",
  "quinta-feira": "Qui",
  "sexta-feira": "Sex",
  "sábado": "Sáb",
  "domingo": "Dom",
};

interface Metrica {
  rotulo: string;
  valor: string;
  unidade?: string;
  apoio?: string;
  /** A série por trás do número, quando existe dado com data. */
  serie?: number[];
  /** Variação contra o período anterior, em %. */
  variacao?: number | null;
  /** Quando subir é ruim: atrasos, pendências. */
  inverterVariacao?: boolean;
}

/**
 * Abertura do painel: data em mono, cumprimento em serif com o nome em itálico
 * lime, e três cartões de métrica. Quais métricas aparecem depende do plano —
 * a conta é a mesma que a página de evolução usa, para os números baterem.
 */
interface WelcomeHeaderProps {
  /** Uma faixa a mais, dentro do painel, abaixo das métricas. */
  rodape?: ReactNode;
}

export function WelcomeHeader({ rodape }: WelcomeHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dataAtual, setDataAtual] = useState(new Date());
  const { aulaAtiva } = useAulaSemanal();
  const { isVisitante, isAdmin, isParceiro, isLoading: roleLoading } = useUserRole();
  const { isBusiness, isSkills, isAcademy } = useEffectivePlan(isAdmin, roleLoading, isParceiro);

  useEffect(() => {
    const interval = setInterval(() => setDataAtual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nome_completo")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const primeiroNome = profile?.nome_completo?.split(" ")[0] || "Usuário";

  const hora = parseInt(formatInTimeZone(dataAtual, TIMEZONE, "HH"));
  const periodo = hora < 12 ? "manhã" : hora < 18 ? "tarde" : "noite";
  const dataExtenso = formatInTimeZone(dataAtual, TIMEZONE, "EEEE, d 'de' MMMM", { locale: ptBR });

  const diasSemAcesso = (() => {
    const u = localStorage.getItem(`ultimo_acesso_${user?.id}`);
    return u ? Math.floor((Date.now() - parseInt(u)) / (1000 * 60 * 60 * 24)) : 0;
  })();

  /*
   * ── Business ──
   *
   * Aqui havia mais três consultas: contrato, etapas do roadmap e tarefas.
   * Serviam só para os dois números que saíram do painel, então saíram
   * junto — eram três idas ao servidor em toda abertura para alimentar
   * cartões que não existem mais.
   */
  const rawBusinessUserId = useBusinessUserId();
  const businessUserId = rawBusinessUserId ?? user?.id;
  const { sessoes, isLoading: isLoadingSessoes } = useMentoriaSessoes(isBusiness ? businessUserId : undefined);

  // ── Academy ──
  const nivel = useNivelUsuario();
  const { data: sequencia, isLoading: isLoadingSequencia } = useSequenciaEstudo();
  const { data: academyData, isLoading: isLoadingAcademy } = useQuery({
    queryKey: ["welcome-header-academy", user?.id],
    enabled: isAcademy && !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data: inProgress } = await supabase
        .from("progresso_videos")
        .select("videos(modulo_id, modulos(trilha_id))")
        .eq("user_id", user!.id)
        .eq("completado", false);
      type LinhaProgresso = { videos: { modulos: { trilha_id: string | null } | null } | null };
      const trilhaIds = new Set<string>();
      ((inProgress ?? []) as unknown as LinhaProgresso[]).forEach((row) => {
        const tid = row?.videos?.modulos?.trilha_id;
        if (tid) trilhaIds.add(tid);
      });
      return { emAndamento: trilhaIds.size };
    },
  });

  // ── Skills ──
  const { data: skillsData, isLoading: isLoadingSkills } = useQuery({
    queryKey: ["welcome-header-skills", user?.id],
    enabled: isSkills && !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data: membro } = await supabase
        .from("membros_equipe_skills" as any)
        .select("equipe_id")
        .eq("user_id", user!.id)
        .eq("status", "ativo")
        .limit(1)
        .maybeSingle();
      if (!membro) return { equipe: 0, pendentes: 0, progresso: 0 };
      const equipeId = (membro as any).equipe_id;
      const [membros, entregas] = await Promise.all([
        supabase.from("membros_equipe_skills" as any).select("id", { count: "exact", head: true }).eq("equipe_id", equipeId).eq("status", "ativo"),
        supabase.from("entregas_equipe_skills" as any).select("status").eq("equipe_id", equipeId),
      ]);
      const entregasList = (entregas as any).data ?? [];
      const totalEntregas = entregasList.length;
      const pendentes = entregasList.filter((e: any) => e.status === "pendente" || e.status === "em_andamento").length;
      const concluidas = entregasList.filter((e: any) => e.status === "concluida" || e.status === "aprovada").length;
      const progresso = totalEntregas > 0 ? Math.round((concluidas / totalEntregas) * 100) : 0;
      return { equipe: (membros as any).count ?? 0, pendentes, progresso };
    },
  });

  // As faíscas e a variação saem daqui. É o único registro com data que a
  // plataforma guarda do aluno, então é o único lugar de onde pode sair uma
  // comparação honesta com o período anterior.
  const { dados: ritmo } = useRitmoEstudo(!isVisitante);

  const emAndamentoAnimado = useCountUp(academyData?.emAndamento ?? 0, 700);
  const sequenciaAnimada = useCountUp(sequencia ?? 0, 700);

  let metricas: Metrica[] = [];
  let ctaLabel = "";
  let ctaHref = "";
  let isLoadingMetricas = false;

  if (isBusiness) {
    const proximaSessao = sessoes
      ?.filter((s) => s.status === "agendada" && isFuture(parseISO(s.data_sessao)))
      .sort((a, b) => parseISO(a.data_sessao).getTime() - parseISO(b.data_sessao).getTime())[0];
    const dayFull = proximaSessao ? format(parseISO(proximaSessao.data_sessao), "EEEE", { locale: ptBR }) : null;

    /*
     * Roadmap e Tarefas críticas saíram daqui a pedido: a operação não vai
     * mais acompanhar o projeto por esses dois números. Sobra o que tem data
     * marcada, que é o que o cliente abre o painel para ver.
     */
    metricas = [
      {
        rotulo: "Próximo encontro Insider",
        valor: dayFull ? (DAY_ABBR[dayFull] ?? dayFull.slice(0, 3)) : "—",
        apoio: proximaSessao
          ? format(parseISO(proximaSessao.data_sessao), "d 'de' MMMM", { locale: ptBR })
          : "Nenhum encontro agendado",
      },
    ];
    ctaLabel = "Ver encontros";
    ctaHref = "/encontros";
    isLoadingMetricas = isLoadingSessoes;
  } else if (isAcademy) {
    const faltamXp = Math.max(0, nivel.xpNecessario - nivel.xpAtual);
    metricas = [
      {
        rotulo: "Nível",
        valor: String(nivel.nivel),
        unidade: `${nivel.xpAtual.toLocaleString("pt-BR")} XP`,
        apoio: `${nivel.tituloNivel} · ${faltamXp.toLocaleString("pt-BR")} XP para o nível ${nivel.nivel + 1}`,
      },
      {
        rotulo: "Trilhas em andamento",
        valor: String(emAndamentoAnimado),
        apoio: (academyData?.emAndamento ?? 0) > 0 ? "Retome por onde você parou" : "Escolha uma para começar",
      },
      {
        rotulo: "Sequência",
        valor: String(sequenciaAnimada),
        unidade: (sequencia ?? 0) === 1 ? "dia" : "dias",
        apoio: (sequencia ?? 0) > 0 ? "Assista algo hoje para não zerar" : "Assista uma aula para começar",
        serie: ritmo.faisca,
        variacao: ritmo.variacaoSemana,
      },
    ];
    ctaLabel = "Continuar trilha";
    ctaHref = "/trilhas";
    isLoadingMetricas = isLoadingAcademy || isLoadingSequencia;
  } else if (isSkills && skillsData) {
    metricas = [
      { rotulo: "Equipe", valor: String(skillsData.equipe), apoio: "Pessoas ativas no time" },
      { rotulo: "Pendentes", valor: String(skillsData.pendentes), apoio: "Entregas em aberto" },
      { rotulo: "Progresso", valor: `${skillsData.progresso}%`, apoio: "Das entregas concluídas" },
    ];
    ctaLabel = "Ver trilhas";
    ctaHref = "/trilhas";
    isLoadingMetricas = isLoadingSkills;
  }

  /*
   * ── Saudação ──
   *
   * O "Atenção," vinha da contagem de tarefas críticas, que saiu do painel.
   * Sem esse número, o cumprimento volta a ser o da hora do dia ou o de
   * quem sumiu por uns dias.
   */
  const cumprimento =
    diasSemAcesso >= 4
    ? "Que bom te ver de volta,"
    : `Boa ${periodo},`;
  const tagline = aulaAtiva
    ? `Aula desta semana: ${aulaAtiva.tema}`
    : diasSemAcesso >= 4
    ? `Faz ${diasSemAcesso} dias desde sua última visita. Por onde quer começar?`
    : "Aplique, replique e domine IA.";

  const mostrarMetricas = !isVisitante && (metricas.length > 0 || isLoadingMetricas);

  return (
    /*
     * O painel de abertura.
     *
     * A marca não está mais desenhada dentro de um cartão: ela é o fundo.
     * Fica grande, fora de foco e em 22% de opacidade atrás de tudo, e os
     * cartões de métrica por cima são de vidro, então ela aparece através
     * deles. Era isto que faltava — antes a logo aparecia duas vezes, uma
     * no fundo e outra dentro do cartão, e o cartão era opaco, então o
     * fundo não servia para nada.
     *
     * O véu da base do `.painel-marca` entrega o painel ao conteúdo
     * seguinte sem linha dura, que é como a referência encaixa o herói no
     * resto da página.
     */
    <section className="painel-marca px-5 pb-5 pt-6 md:px-8 md:pb-6 md:pt-7">
      {/* A marca, em vetor, para ficar nítida em qualquer tamanho. */}
      <MarcaIAplicada
        className="marca-de-fundo -right-[18%] top-1/2 h-[200%] w-auto max-w-none -translate-y-1/2 rotate-[14deg] md:right-[2%] md:h-[165%]"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <span className="rotulo-mono block">{dataExtenso}</span>
            <h1 className="font-serif-display text-[30px] leading-[1.02] tracking-tight text-foreground md:text-4xl lg:text-[42px]">
              {cumprimento}{" "}
              <em className="font-serif-italic text-primary">{primeiroNome}</em>
            </h1>
            <p className="max-w-prose text-sm text-muted-foreground md:text-base">{tagline}</p>
          </div>

          {ctaLabel && (
            <Button onClick={() => navigate(ctaHref)} size="pill" className="w-full shrink-0 sm:w-auto">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
        </div>

        {mostrarMetricas && (
          <motion.div
            data-welcome-kpis
            variants={listaCascata}
            {...aoMontar}
            className={cn(
              "grid grid-cols-1 gap-3 md:gap-4",
              metricas.length > 1 && "sm:grid-cols-3",
              metricas.length === 1 && "sm:max-w-sm",
            )}
          >
            {isLoadingMetricas
              ? [0, 1, 2].map((i) => <CartaoMetricaSkeleton key={i} vidro />)
              : metricas.map((m) => (
                  <CartaoMetrica
                    key={m.rotulo}
                    rotulo={m.rotulo}
                    valor={m.valor}
                    unidade={m.unidade}
                    apoio={m.apoio}
                    serie={m.serie}
                    variacao={m.variacao}
                    inverterVariacao={m.inverterVariacao}
                    vidro
                  />
                ))}
          </motion.div>
        )}

        {rodape}
      </div>
    </section>
  );
}
