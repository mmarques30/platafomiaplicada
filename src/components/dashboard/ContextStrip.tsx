import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLAN_LABELS: Record<string, string> = {
  academy: "Academy",
  business_parceria: "Builder",
  business_sistemas: "System",
  skills: "Skills",
};

const DAY_ABBR: Record<string, string> = {
  "segunda-feira": "Seg",
  "terça-feira": "Ter",
  "quarta-feira": "Qua",
  "quinta-feira": "Qui",
  "sexta-feira": "Sex",
  "sábado": "Sáb",
  "domingo": "Dom",
};

function KpiItem({ valor, label }: { valor: string; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{ color: "#AFC040", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
        {valor}
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />;
}

export function ContextStrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { isAdmin, isParceiro, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isBusiness, isSkills, isAcademy } = useEffectivePlan(isAdmin, roleLoading, isParceiro);

  const planoLabel = effectivePlan ? PLAN_LABELS[effectivePlan] ?? "" : "";

  const weekNumber = profile?.created_at
    ? Math.max(1, Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 1;

  const displayName = profile?.nome_completo || profile?.email?.split("@")[0] || "Usuário";

  // ── Business KPIs ──
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(isBusiness ? businessUserId : undefined);
  const contratoId = contrato?.id;
  const { data: etapas } = useEtapasBusiness(isBusiness ? contratoId : undefined);
  const { data: tasks } = useTasksByUser(isBusiness ? businessUserId : undefined);
  const { sessoes } = useMentoriaSessoes(isBusiness ? businessUserId : undefined);

  const businessKpis = isBusiness
    ? (() => {
        const total = etapas?.length ?? 0;
        const concluidas = etapas?.filter((e) => e.status === "concluida").length ?? 0;
        const roadmap = total > 0 ? `${Math.round((concluidas / total) * 100)}%` : "—";

        const criticas = tasks?.filter(
          (t) => ["alta", "urgente"].includes(t.prioridade) && t.status !== "aprovado"
        ).length ?? 0;

        const proximaSessao = sessoes
          ?.filter((s) => s.status === "agendada" && isFuture(parseISO(s.data_sessao)))
          .sort((a, b) => parseISO(a.data_sessao).getTime() - parseISO(b.data_sessao).getTime())[0];

        let sessaoDia = "—";
        if (proximaSessao) {
          const dayFull = format(parseISO(proximaSessao.data_sessao), "EEEE", { locale: ptBR });
          sessaoDia = DAY_ABBR[dayFull] ?? dayFull.slice(0, 3);
        }

        return { roadmap, criticas: String(criticas), sessaoDia };
      })()
    : null;

  // ── Academy KPIs ──
  const { data: academyData } = useQuery({
    queryKey: ["context-strip-academy", user?.id],
    enabled: isAcademy && !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [weekVideos, inProgress, certs] = await Promise.all([
        supabase
          .from("progresso_videos")
          .select("id")
          .eq("user_id", user!.id)
          .eq("completado", true)
          .gte("updated_at", oneWeekAgo.toISOString()),
        supabase
          .from("progresso_videos")
          .select("videos(modulo_id, modulos(trilha_id))")
          .eq("user_id", user!.id)
          .eq("completado", false),
        supabase
          .from("certificados")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id),
      ]);

      const estaSemana = weekVideos.data?.length ?? 0;

      // Count distinct trilha_ids from in-progress
      const trilhaIds = new Set<string>();
      (inProgress.data ?? []).forEach((row: any) => {
        const tid = row?.videos?.modulos?.trilha_id;
        if (tid) trilhaIds.add(tid);
      });

      return {
        estaSemana: String(estaSemana),
        emAndamento: String(trilhaIds.size),
        conquistas: String(certs.count ?? 0),
      };
    },
  });

  // ── Skills KPIs ──
  const { data: skillsData } = useQuery({
    queryKey: ["context-strip-skills", user?.id],
    enabled: isSkills && !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      // Find user's team
      const { data: membro } = await supabase
        .from("membros_equipe_skills" as any)
        .select("equipe_id")
        .eq("user_id", user!.id)
        .eq("status", "ativo")
        .limit(1)
        .maybeSingle();

      if (!membro) return { equipe: "—", pendentes: "—", progresso: "—" };

      const equipeId = (membro as any).equipe_id;

      const [membros, entregas] = await Promise.all([
        supabase
          .from("membros_equipe_skills" as any)
          .select("id", { count: "exact", head: true })
          .eq("equipe_id", equipeId)
          .eq("status", "ativo"),
        supabase
          .from("entregas_equipe_skills" as any)
          .select("status")
          .eq("equipe_id", equipeId),
      ]);

      const totalMembros = (membros as any).count ?? 0;
      const entregasList = (entregas as any).data ?? [];
      const totalEntregas = entregasList.length;
      const pendentes = entregasList.filter(
        (e: any) => e.status === "pendente" || e.status === "em_andamento"
      ).length;
      const concluidas = entregasList.filter((e: any) => e.status === "concluida" || e.status === "aprovada").length;
      const progresso = totalEntregas > 0 ? `${Math.round((concluidas / totalEntregas) * 100)}%` : "—";

      return {
        equipe: String(totalMembros),
        pendentes: String(pendentes),
        progresso,
      };
    },
  });

  // ── CTA config ──
  let ctaLabel = "";
  let ctaHref = "";
  let kpis: { valor: string; label: string }[] = [];

  if (isBusiness && businessKpis) {
    kpis = [
      { valor: businessKpis.roadmap, label: "ROADMAP" },
      { valor: businessKpis.criticas, label: "CRÍTICAS" },
      { valor: businessKpis.sessaoDia, label: "PRÓX. SESSÃO" },
    ];
    ctaLabel = "Ver sessão";
    ctaHref = "/mentoria/sessoes";
  } else if (isAcademy && academyData) {
    kpis = [
      { valor: academyData.estaSemana, label: "ESTA SEMANA" },
      { valor: academyData.emAndamento, label: "EM ANDAMENTO" },
      { valor: academyData.conquistas, label: "CONQUISTAS" },
    ];
    ctaLabel = "Continuar trilha";
    ctaHref = "/trilhas";
  } else if (isSkills && skillsData) {
    kpis = [
      { valor: skillsData.equipe, label: "EQUIPE" },
      { valor: skillsData.pendentes, label: "PENDENTES" },
      { valor: skillsData.progresso, label: "PROGRESSO" },
    ];
    ctaLabel = "Ver equipe";
    ctaHref = "/skills/equipe";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0C0F0A",
        borderRadius: 12,
        padding: "14px 20px",
        border: "1px solid rgba(255,255,255,0.1)",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Left: name + context */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 220,
          }}
        >
          {displayName}
        </div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>
          Semana {weekNumber}{planoLabel ? ` · ${planoLabel}` : ""}
        </div>
      </div>

      {/* Right: KPIs + CTA */}
      {kpis.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <KpiItem valor={kpis[0].valor} label={kpis[0].label} />
          <Divider />
          <KpiItem valor={kpis[1].valor} label={kpis[1].label} />
          <Divider />
          <KpiItem valor={kpis[2].valor} label={kpis[2].label} />

          <button
            onClick={() => navigate(ctaHref)}
            style={{
              background: "#AFC040",
              color: "#0C0F0A",
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
      )}
    </div>
  );
}
