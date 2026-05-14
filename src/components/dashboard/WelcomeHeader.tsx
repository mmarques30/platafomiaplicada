import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAulaSemanal } from "@/hooks/useAulaSemanal";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useCountUp } from "@/hooks/useCountUp";
import { formatInTimeZone } from "date-fns-tz";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIMEZONE = 'America/Sao_Paulo';

const DAY_ABBR: Record<string, string> = {
  "segunda-feira": "Seg",
  "terça-feira": "Ter",
  "quarta-feira": "Qua",
  "quinta-feira": "Qui",
  "sexta-feira": "Sex",
  "sábado": "Sáb",
  "domingo": "Dom",
};

export function WelcomeHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dataAtual, setDataAtual] = useState(new Date());
  const { aulaAtiva } = useAulaSemanal();
  const { isVisitante, isAdmin, isParceiro, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isBusiness, isSkills, isAcademy } = useEffectivePlan(isAdmin, roleLoading, isParceiro);

  useEffect(() => {
    const interval = setInterval(() => setDataAtual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const primeiroNome = profile?.nome_completo?.split(' ')[0] || 'Usuário';

  const hora = parseInt(formatInTimeZone(dataAtual, TIMEZONE, 'HH'));
  const periodo = hora < 12 ? 'manhã' : hora < 18 ? 'tarde' : 'noite';
  const dia = formatInTimeZone(dataAtual, TIMEZONE, 'dd');
  const mes = formatInTimeZone(dataAtual, TIMEZONE, 'MMM', { locale: ptBR }).toUpperCase();
  const diaSemana = formatInTimeZone(dataAtual, TIMEZONE, 'EEE', { locale: ptBR });

  const diasSemAcesso = (() => {
    const u = localStorage.getItem(`ultimo_acesso_${user?.id}`);
    return u ? Math.floor((Date.now() - parseInt(u)) / (1000 * 60 * 60 * 24)) : 0;
  })();

  // ── Business KPIs ──
  const rawBusinessUserId = useBusinessUserId();
  const businessUserId = rawBusinessUserId ?? user?.id;
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(isBusiness ? businessUserId : undefined);
  const { data: etapas, isLoading: isLoadingEtapas } = useEtapasBusiness(isBusiness ? contrato?.id : undefined);
  const { data: tasks, isLoading: isLoadingTasks } = useTasksByUser(isBusiness ? businessUserId : undefined);
  const { sessoes, isLoading: isLoadingSessoes } = useMentoriaSessoes(isBusiness ? businessUserId : undefined);

  // ── Academy KPIs ──
  const { data: academyData, isLoading: isLoadingAcademy } = useQuery({
    queryKey: ["welcome-header-academy", user?.id],
    enabled: isAcademy && !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const [weekVideos, inProgress, certs] = await Promise.all([
        supabase.from("progresso_videos").select("id").eq("user_id", user!.id).eq("completado", true).gte("updated_at", oneWeekAgo.toISOString()),
        supabase.from("progresso_videos").select("videos(modulo_id, modulos(trilha_id))").eq("user_id", user!.id).eq("completado", false),
        supabase.from("certificados").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      const trilhaIds = new Set<string>();
      (inProgress.data ?? []).forEach((row: any) => {
        const tid = row?.videos?.modulos?.trilha_id;
        if (tid) trilhaIds.add(tid);
      });
      return {
        estaSemana: weekVideos.data?.length ?? 0,
        emAndamento: trilhaIds.size,
        conquistas: certs.count ?? 0,
      };
    },
  });

  // ── Skills KPIs ──
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

  // ── Compute KPIs ──
  let kpi1Raw = 0, kpi2Raw = 0, kpi3Raw = 0;
  let kpi1Label = "", kpi2Label = "", kpi3Label = "";
  let kpi3Text: string | null = null; // for non-numeric values
  let ctaLabel = "", ctaHref = "";
  let hasKpis = false;

  if (isBusiness) {
    const total = etapas?.length ?? 0;
    const concluidas = etapas?.filter((e) => e.status === "concluida").length ?? 0;
    kpi1Raw = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    kpi1Label = "ROADMAP";
    kpi2Raw = tasks?.filter((t) => ["alta", "urgente"].includes(t.prioridade) && t.status !== "aprovado").length ?? 0;
    kpi2Label = "TAREFAS CRÍTICAS";
    const proximaSessao = sessoes
      ?.filter((s) => s.status === "agendada" && isFuture(parseISO(s.data_sessao)))
      .sort((a, b) => parseISO(a.data_sessao).getTime() - parseISO(b.data_sessao).getTime())[0];
    if (proximaSessao) {
      const dayFull = format(parseISO(proximaSessao.data_sessao), "EEEE", { locale: ptBR });
      kpi3Text = DAY_ABBR[dayFull] ?? dayFull.slice(0, 3);
    }
    kpi3Label = "PRÓX. SESSÃO";
    ctaLabel = "Ver sessão";
    ctaHref = "/mentoria/sessoes";
    hasKpis = true;
  } else if (isAcademy && academyData) {
    kpi1Raw = academyData.estaSemana;
    kpi1Label = "ESTA SEMANA";
    kpi2Raw = academyData.emAndamento;
    kpi2Label = "EM ANDAMENTO";
    kpi3Raw = academyData.conquistas;
    kpi3Label = "CONQUISTAS";
    ctaLabel = "Continuar trilha";
    ctaHref = "/trilhas";
    hasKpis = true;
  } else if (isSkills && skillsData) {
    kpi1Raw = skillsData.equipe;
    kpi1Label = "EQUIPE";
    kpi2Raw = skillsData.pendentes;
    kpi2Label = "PENDENTES";
    kpi3Raw = skillsData.progresso;
    kpi3Label = "PROGRESSO";
    ctaLabel = "Ver equipe";
    ctaHref = "/skills/equipe";
    hasKpis = true;
  }

  const kpi1Animated = useCountUp(kpi1Raw, 600);
  const kpi2Animated = useCountUp(kpi2Raw, 600);
  const kpi3Animated = useCountUp(kpi3Raw, 600);

  const kpi1Display = hasKpis ? (isBusiness ? `${kpi1Animated}%` : String(kpi1Animated)) : "—";
  const kpi2Display = hasKpis ? String(kpi2Animated) : "—";
  const kpi3Display = hasKpis ? (kpi3Text ?? (isSkills ? `${kpi3Animated}%` : String(kpi3Animated))) : "—";

  const isLoadingKpis =
    (isBusiness && (isLoadingContrato || isLoadingEtapas || isLoadingTasks || isLoadingSessoes))
    || (isAcademy && isLoadingAcademy)
    || (isSkills && isLoadingSkills);

  const showKpis = !isVisitante && (hasKpis || isLoadingKpis);

  // ── Saudação e tagline adaptativos ──
  const temEntregaUrgente = isBusiness && kpi2Raw > 0;
  const saudacao = temEntregaUrgente
    ? `Atenção, ${primeiroNome}`
    : diasSemAcesso >= 4
    ? `Que bom te ver de volta, ${primeiroNome}`
    : `Boa ${periodo}, ${primeiroNome}!`;
  const tagline = temEntregaUrgente
    ? 'Você tem entregas que precisam de atenção agora.'
    : diasSemAcesso >= 4
    ? `Faz ${diasSemAcesso} dias desde sua última visita. Por onde quer começar?`
    : 'Aplique, replique e domine IA';

  const kpiSkeleton = (
    <div className="mx-auto h-[26px] w-12 animate-[kpiPulse_1.2s_ease-in-out_infinite] rounded bg-foreground/[0.06]" />
  );

  return (
    <>
      <style>{`@keyframes kpiPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
      <div className="w-full">
        <div className="flex flex-col gap-6 rounded-2xl border border-brand-hairline bg-brand-cream-soft px-5 py-6 md:px-8 md:py-8">
          {/* Top: saudação + data */}
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="lp-eyebrow mb-3">
                <span>HOJE</span>
              </p>
              <h1 className="font-serif-display text-2xl leading-[1.05] tracking-tight text-foreground md:text-4xl">
                {saudacao}
              </h1>
              {aulaAtiva ? (
                <p className="mt-3 max-w-prose text-sm font-light text-muted-foreground md:text-base">
                  <span className="font-medium text-foreground">Aula:</span> {aulaAtiva.tema}
                </p>
              ) : (
                <p className="mt-3 max-w-prose text-sm font-light text-muted-foreground md:text-base">
                  {tagline}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-3 border-l border-brand-hairline pl-4 md:pl-6">
              <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <div className="flex flex-col leading-tight">
                <span className="font-serif-display text-2xl text-foreground md:text-3xl">{dia}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {diaSemana} · {mes}
                </span>
              </div>
            </div>
          </div>

          {/* KPIs + CTA */}
          {showKpis && (
            <div data-welcome-kpis className="border-t border-brand-hairline pt-5">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <KpiCell label={kpi1Label} value={isLoadingKpis ? kpiSkeleton : kpi1Display} />
                <span className="hidden h-8 w-px bg-brand-hairline sm:block" />
                <KpiCell label={kpi2Label} value={isLoadingKpis ? kpiSkeleton : kpi2Display} />
                <span className="hidden h-8 w-px bg-brand-hairline sm:block" />
                <KpiCell label={kpi3Label} value={isLoadingKpis ? kpiSkeleton : kpi3Display} />

                <Button
                  onClick={() => navigate(ctaHref)}
                  variant="default"
                  size="sm"
                  className="ml-auto bg-brand-strong text-brand-strong-foreground hover:bg-brand-strong/90"
                >
                  {ctaLabel}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function KpiCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-[64px]">
      <div className="font-serif-display text-2xl leading-none text-foreground">{value}</div>
      <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
