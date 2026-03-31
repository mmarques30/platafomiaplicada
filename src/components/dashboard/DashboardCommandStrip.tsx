import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLAN_LABELS: Record<string, string> = {
  academy: "Academy",
  business_parceria: "Business Parceria",
  business_sistemas: "Business Sistemas",
  skills: "Skills",
};

function KpiBadge({ color, children }: { color: "teal" | "amber" | "muted"; children: React.ReactNode }) {
  const colorClasses = {
    teal: "bg-teal-500/15 text-teal-400",
    amber: "bg-amber-500/15 text-amber-400",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
}

function BusinessKPIs() {
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: loadingContrato } = useContratosBusiness(businessUserId);
  const { data: etapas, isLoading: loadingEtapas } = useEtapasBusiness(contrato?.id);
  const { data: tasks, isLoading: loadingTasks } = useTasksByUser(businessUserId);
  const { sessoes, isLoading: loadingSessoes } = useMentoriaSessoes(businessUserId);

  const isLoading = loadingContrato || loadingEtapas || loadingTasks || loadingSessoes;

  const stats = useMemo(() => {
    if (!etapas) return { roadmapPct: 0, tarefasCriticas: 0, proximaSessao: null as string | null };

    const total = etapas.length;
    const concluidas = etapas.filter((e) => e.status === "concluida").length;
    const roadmapPct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    const tarefasCriticas = (tasks ?? []).filter(
      (t) => (t.prioridade === "alta" || t.prioridade === "urgente") && t.status === "pendente"
    ).length;

    const futuras = (sessoes ?? [])
      .filter((s) => s.status === "agendada" && isFuture(parseISO(s.data_sessao)))
      .sort((a, b) => parseISO(a.data_sessao).getTime() - parseISO(b.data_sessao).getTime());

    const proximaSessao = futuras[0]
      ? format(parseISO(futuras[0].data_sessao), "dd MMM", { locale: ptBR })
      : null;

    return { roadmapPct, tarefasCriticas, proximaSessao };
  }, [etapas, tasks, sessoes]);

  if (isLoading) return <KpiSkeleton />;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <KpiBadge color="teal">{stats.roadmapPct}% roadmap</KpiBadge>
      {stats.tarefasCriticas > 0 && (
        <KpiBadge color="amber">{stats.tarefasCriticas} tarefa{stats.tarefasCriticas > 1 ? "s" : ""} crítica{stats.tarefasCriticas > 1 ? "s" : ""}</KpiBadge>
      )}
      {stats.proximaSessao && (
        <span className="text-xs text-muted-foreground">Sessão {stats.proximaSessao}</span>
      )}
      <Link to="/mentoria/sessoes">
        <Button variant="outline" size="sm" className="h-7 text-xs">Ver sessão</Button>
      </Link>
    </div>
  );
}

function AcademyKPIs() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["command-strip-academy", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [videosRes, modulosRes] = await Promise.all([
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
      ]);

      const videosSemana = videosRes.data?.length ?? 0;

      const moduloIds = new Set<string>();
      (modulosRes.data ?? []).forEach((item: any) => {
        if (item?.videos?.modulo_id) moduloIds.add(item.videos.modulo_id);
      });

      return { videosSemana, modulosEmAndamento: moduloIds.size };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <KpiSkeleton />;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <KpiBadge color="teal">{data?.videosSemana ?? 0} vídeo{(data?.videosSemana ?? 0) !== 1 ? "s" : ""} esta semana</KpiBadge>
      {(data?.modulosEmAndamento ?? 0) > 0 && (
        <KpiBadge color="muted">{data?.modulosEmAndamento} módulo{data!.modulosEmAndamento > 1 ? "s" : ""} em andamento</KpiBadge>
      )}
      <Link to="/trilhas">
        <Button variant="outline" size="sm" className="h-7 text-xs">Continuar trilha</Button>
      </Link>
    </div>
  );
}

function SkillsKPIs() {
  // Skills-specific data would come from skills hooks
  // For now, show a simple CTA since skills hooks weren't found as standalone
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Link to="/skills/equipe">
        <Button variant="outline" size="sm" className="h-7 text-xs">Ver equipe</Button>
      </Link>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-24 rounded-md" />
      <Skeleton className="h-5 w-20 rounded-md" />
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
  );
}

export function DashboardCommandStrip() {
  const { profile, isLoading: loadingProfile } = useUserProfile();
  const { plan, isBusiness, isSkills, isAcademy } = useUserPlan();

  const semana = useMemo(() => {
    if (!profile?.created_at) return 1;
    const diffMs = Date.now() - new Date(profile.created_at).getTime();
    return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
  }, [profile?.created_at]);

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
        {/* Left column */}
        <div className="min-w-0">
          <h2 className="text-[17px] font-medium text-foreground truncate">
            {profile?.nome_completo ?? "Olá"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Semana {semana} da sua jornada · {planoLabel}
          </p>
        </div>

        {/* Right column — KPIs by plan */}
        <div className="flex-shrink-0">
          {isBusiness && <BusinessKPIs />}
          {isAcademy && <AcademyKPIs />}
          {isSkills && <SkillsKPIs />}
        </div>
      </div>
    </div>
  );
}
