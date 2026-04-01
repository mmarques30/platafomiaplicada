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
import { Calendar } from "lucide-react";

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
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const dia = formatInTimeZone(dataAtual, TIMEZONE, 'dd');
  const mes = formatInTimeZone(dataAtual, TIMEZONE, 'MMM', { locale: ptBR }).toUpperCase();
  const diaSemana = formatInTimeZone(dataAtual, TIMEZONE, 'EEE', { locale: ptBR });

  // ── Business KPIs ──
  const rawBusinessUserId = useBusinessUserId();
  const businessUserId = rawBusinessUserId ?? user?.id;
  console.log('[WelcomeHeader] businessUserId:', businessUserId);
  console.log('[WelcomeHeader] user?.id:', user?.id);
  console.log('[WelcomeHeader] effectivePlan:', effectivePlan);
  console.log('[WelcomeHeader] isBusiness:', isBusiness);
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(isBusiness ? businessUserId : undefined);
  console.log('[WelcomeHeader] contrato:', contrato);
  const { data: etapas, isLoading: isLoadingEtapas } = useEtapasBusiness(isBusiness ? contrato?.id : undefined);
  console.log('[WelcomeHeader] etapas:', etapas?.length, 'etapas');
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

  return (
    <div className="w-full mt-2 md:mt-4">
      <div className="flex flex-col bg-gradient-to-r from-[#0C0F0A] via-[#151814] to-[#0C0F0A] backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10">
        {/* Top section — original layout */}
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 px-2.5 sm:px-3 md:px-6 py-2.5 sm:py-3 md:py-5">
          <div className="flex-1 min-w-0 text-left">
            <h1 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {saudacao}, <span className="text-primary font-bold">{primeiroNome}</span>!
            </h1>
            {aulaAtiva ? (
              <p className="text-[11px] sm:text-xs md:text-base lg:text-lg text-white/70 truncate">
                <span className="font-semibold text-white">Aula:</span> {aulaAtiva.tema}
              </p>
            ) : (
              <p className="text-[11px] sm:text-xs md:text-base lg:text-lg text-white/70 font-medium">
                Aplique, replique e domine IA
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <div className="bg-primary rounded-md sm:rounded-lg md:rounded-xl p-1 sm:p-1.5 md:p-3 flex items-center justify-center shadow-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-base sm:text-lg md:text-2xl font-bold text-white">{dia}</span>
              <span className="text-[9px] sm:text-[10px] md:text-sm text-white/70 font-medium uppercase tracking-wide">{diaSemana}, {mes}</span>
            </div>
          </div>
        </div>

        {/* KPI footer */}
        {showKpis && (
          <>
            <div className="border-t border-white/10" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "10px 20px",
                flexWrap: "wrap",
              }}
            >
              {/* KPI 1 */}
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ color: "#2CBBA6", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
                  {kpi1Display}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {kpi1Label}
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />

              {/* KPI 2 */}
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ color: "#E8A43C", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
                  {kpi2Display}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {kpi2Label}
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />

              {/* KPI 3 */}
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ color: "#AFC040", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
                  {kpi3Display}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {kpi3Label}
                </div>
              </div>

              <button
                onClick={() => navigate(ctaHref)}
                style={{
                  marginLeft: "auto",
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {ctaLabel} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
