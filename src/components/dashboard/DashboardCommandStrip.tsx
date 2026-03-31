import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useSkillsEquipe } from "@/hooks/useSkillsEquipe";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { useCountUp } from "@/hooks/useCountUp";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isFuture, parseISO } from "date-fns";

const PLAN_LABELS: Record<string, string> = {
  academy: "Academy",
  business_parceria: "Business Parceria",
  business_sistemas: "Business Sistemas",
  skills: "Skills",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/* ── KPI Block ── */

function KpiBlock({ value, label, color }: { value: number; label: string; color: string }) {
  const animated = useCountUp(value, 600);
  const isPercent = label.includes("ROADMAP") || label.includes("PROGRESSO") || label.includes("SEMANA");
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-xl font-semibold leading-none" style={{ color }}>
        {isPercent ? `${animated}%` : animated}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}

function KpiBlockText({ text, label, color }: { text: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-xl font-semibold leading-none" style={{ color }}>
        {text}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}

function KpiSeparator() {
  return <div className="h-8 w-px bg-border" />;
}

function CtaButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-lg border-none cursor-pointer text-[13px] font-medium"
      style={{
        background: "#AFC040",
        color: "#0C0F0A",
        padding: "8px 16px",
      }}
    >
      {label} →
    </button>
  );
}

function KpiSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-16 rounded" />
      <Skeleton className="h-8 w-px" />
      <Skeleton className="h-8 w-16 rounded" />
      <Skeleton className="h-8 w-px" />
      <Skeleton className="h-8 w-16 rounded" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/* ── Business KPIs ── */

function BusinessKPIs() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: lC } = useContratosBusiness(businessUserId);
  const { data: etapas, isLoading: lE } = useEtapasBusiness(contrato?.id);
  const { data: tasks, isLoading: lT } = useTasksByUser(businessUserId);
  const { sessoes, isLoading: lS } = useMentoriaSessoes(businessUserId);

  const stats = useMemo(() => {
    const total = etapas?.length ?? 0;
    const concluidas = etapas?.filter((e) => e.status === "concluida").length ?? 0;
    const roadmapPct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    const criticas = (tasks ?? []).filter(
      (t) => (t.prioridade === "alta" || t.prioridade === "urgente") && t.status === "pendente"
    ).length;

    const futuras = (sessoes ?? [])
      .filter((s) => s.status === "agendada" && isFuture(parseISO(s.data_sessao)))
      .sort((a, b) => parseISO(a.data_sessao).getTime() - parseISO(b.data_sessao).getTime());

    const proxSessaoDia = futuras[0]
      ? DAY_NAMES[parseISO(futuras[0].data_sessao).getDay()]
      : "—";

    return { roadmapPct, criticas, proxSessaoDia };
  }, [etapas, tasks, sessoes]);

  if (lC || lE || lT || lS) return <KpiSkeleton />;

  return (
    <div className="flex items-center gap-4">
      <KpiBlock value={stats.roadmapPct} label="ROADMAP" color="#2CBBA6" />
      <KpiSeparator />
      <KpiBlock value={stats.criticas} label="CRÍTICAS" color="#E8A43C" />
      <KpiSeparator />
      <KpiBlockText text={stats.proxSessaoDia} label="PRÓX. SESSÃO" color="#AFC040" />
      <CtaButton label="Ver sessão" onClick={() => navigate("/mentoria/sessoes")} />
    </div>
  );
}

/* ── Academy KPIs ── */

function AcademyKPIs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["command-strip-academy", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [videosRes, modulosRes, conquistas] = await Promise.all([
        supabase
          .from("progresso_videos")
          .select("id")
          .eq("user_id", user!.id)
          .eq("completado", true)
          .gte("updated_at", oneWeekAgo.toISOString()),
        supabase
          .from("progresso_videos")
          .select("videos(modulo_id)")
          .eq("user_id", user!.id)
          .eq("completado", false),
        supabase
          .from("certificados")
          .select("id")
          .eq("user_id", user!.id)
          .eq("status", "emitido"),
      ]);

      const videosSemana = videosRes.data?.length ?? 0;
      const moduloIds = new Set<string>();
      (modulosRes.data ?? []).forEach((item: any) => {
        if (item?.videos?.modulo_id) moduloIds.add(item.videos.modulo_id);
      });

      return {
        videosSemana,
        trilhasAndamento: moduloIds.size,
        conquistas: conquistas.data?.length ?? 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <KpiSkeleton />;

  return (
    <div className="flex items-center gap-4">
      <KpiBlock value={data?.videosSemana ?? 0} label="ESTA SEMANA" color="#2CBBA6" />
      <KpiSeparator />
      <KpiBlock value={data?.trilhasAndamento ?? 0} label="EM ANDAMENTO" color="#E8A43C" />
      <KpiSeparator />
      <KpiBlock value={data?.conquistas ?? 0} label="CONQUISTAS" color="#AFC040" />
      <CtaButton label="Continuar trilha" onClick={() => navigate("/trilhas")} />
    </div>
  );
}

/* ── Skills KPIs ── */

function SkillsKPIs() {
  const navigate = useNavigate();
  const { membros, isLoading: lM } = useSkillsEquipe();
  const { entregas, isLoading: lE } = useSkillsEntregas();

  const stats = useMemo(() => {
    const membrosAtivos = membros?.length ?? 0;
    const total = entregas?.length ?? 0;
    const pendentes = entregas?.filter((e: any) => e.status === "pendente").length ?? 0;
    const concluidas = entregas?.filter((e: any) => e.status === "concluida").length ?? 0;
    const progressoPct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { membrosAtivos, pendentes, progressoPct };
  }, [membros, entregas]);

  if (lM || lE) return <KpiSkeleton />;

  return (
    <div className="flex items-center gap-4">
      <KpiBlock value={stats.membrosAtivos} label="EQUIPE" color="#2CBBA6" />
      <KpiSeparator />
      <KpiBlock value={stats.pendentes} label="PENDENTES" color="#E8A43C" />
      <KpiSeparator />
      <KpiBlock value={stats.progressoPct} label="PROGRESSO" color="#AFC040" />
      <CtaButton label="Ver equipe" onClick={() => navigate("/skills/equipe")} />
    </div>
  );
}

/* ── Main Component ── */

export function DashboardCommandStrip() {
  const { profile, isLoading: loadingProfile } = useUserProfile();
  const { plan, isBusiness, isSkills, isAcademy, isVisitante } = useUserPlan();

  const semana = useMemo(() => {
    if (!profile?.created_at) return 1;
    const diffMs = Date.now() - new Date(profile.created_at).getTime();
    return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
  }, [profile?.created_at]);

  // Visitante: não renderizar
  if (!plan && !isBusiness && !isSkills && !isAcademy) return null;
  if (isVisitante) return null;

  const planoLabel = plan ? PLAN_LABELS[plan] ?? plan : "";

  if (loadingProfile) {
    return (
      <div className="bg-card border border-border rounded-xl py-3.5 px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-56" />
          </div>
          <KpiSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl py-3.5 px-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left */}
        <div className="min-w-0">
          <h2 className="text-[17px] font-medium text-foreground truncate">
            {profile?.nome_completo ?? "Olá"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Semana {semana} da sua jornada · {planoLabel}
          </p>
        </div>

        {/* Right — KPIs */}
        <div className="flex-shrink-0">
          {isBusiness && <BusinessKPIs />}
          {isAcademy && <AcademyKPIs />}
          {isSkills && <SkillsKPIs />}
        </div>
      </div>
    </div>
  );
}
