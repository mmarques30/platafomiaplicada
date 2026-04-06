import { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { adminTheme } from "@/components/admin/adminTheme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

// ── Types ──

type Plano = "academy" | "business_parceria" | "business_sistemas" | "skills" | null;
type StatusOnb = "completo" | "em_andamento" | "nao_iniciou";

interface Profile {
  id: string;
  nome_completo: string | null;
  email: string | null;
  plano_mentoria: Plano;
  primeiro_acesso: boolean | null;
  created_at: string;
}

interface Evento {
  user_id: string;
  evento: string;
  plano: string | null;
  created_at: string;
}

interface UserRow {
  profile: Profile;
  status: StatusOnb;
  etapaAtual: string;
  diasParado: number;
  parado3dias: boolean;
  acaoConcluida: boolean;
}

// ── Helpers ──

const PLANO_LABELS: Record<string, string> = {
  academy: "Academy",
  business_parceria: "Business Parceria",
  business_sistemas: "Business Sistemas",
  skills: "Skills",
};

function planoLabel(p: Plano) {
  return p ? PLANO_LABELS[p] ?? "Gratuito" : "Gratuito";
}

function calcularStatus(profile: Profile, allEvents: Evento[]): Omit<UserRow, "profile"> {
  const evs = allEvents.filter((e) => e.user_id === profile.id);
  const tem = (ev: string) => evs.some((e) => e.evento === ev);

  const videoVisto = tem("video_visto");
  const tourFeito = tem("tour_concluido");
  const passosVistos = tem("proximos_passos_vistos");
  const diagnosticoAcademy = tem("diagnostico_iniciado");
  const diagnosticoSkills = tem("skills_diagnostico_iniciado");
  const trilhaIniciada = tem("trilha_iniciada");
  const roadmapVisitado = tem("roadmap_visitado");
  const sistemaVisitado = tem("sistema_visitado");

  const plano = profile.plano_mentoria;
  const acaoConcluida =
    plano === "academy" ? diagnosticoAcademy :
    plano === "skills" ? diagnosticoSkills :
    plano === "business_parceria" ? roadmapVisitado :
    plano === "business_sistemas" ? sistemaVisitado :
    videoVisto;

  const etapaAtual =
    acaoConcluida ? "Ação principal concluída" :
    passosVistos ? "Próximos Passos vistos — não executou" :
    tourFeito ? "Tour concluído — não viu Próximos Passos" :
    videoVisto ? "Vídeo assistido — não concluiu tour" :
    profile.primeiro_acesso === false ? "Onboarding pulado" :
    "Não iniciou";

  const ultimoEvento = evs[0];
  const refDate = ultimoEvento?.created_at ?? profile.created_at;
  const diasParado = Math.floor((Date.now() - new Date(refDate).getTime()) / (1000 * 60 * 60 * 24));

  const status: StatusOnb =
    acaoConcluida ? "completo" :
    videoVisto || tourFeito || passosVistos ? "em_andamento" :
    "nao_iniciou";

  const parado3dias = !acaoConcluida && diasParado >= 3;

  return { status, etapaAtual, diasParado, parado3dias, acaoConcluida };
}

const STATUS_MAP: Record<StatusOnb, { badgeStatus: string; label: string }> = {
  completo: { badgeStatus: "ativo", label: "Completo" },
  em_andamento: { badgeStatus: "pendente", label: "Em andamento" },
  nao_iniciou: { badgeStatus: "bloqueado", label: "Não iniciou" },
};

function getMensagemNotificacao(etapaAtual: string, nome: string | null, plano: Plano): string {
  const firstName = nome?.split(" ")?.[0] ?? "por aqui";
  const planoLbl = planoLabel(plano);
  if (etapaAtual.includes("Não iniciou"))
    return `Olá, ${firstName}! Sua conta está pronta. Que tal começar agora? Temos um vídeo especial esperando por você.`;
  if (etapaAtual.includes("Vídeo assistido"))
    return `Olá, ${firstName}! Você assistiu ao vídeo de boas-vindas. O próximo passo é o tour pela plataforma — leva menos de 2 minutos.`;
  if (etapaAtual.includes("Tour concluído"))
    return `Olá, ${firstName}! O tour está concluído. Agora veja seus próximos passos personalizados para o plano ${planoLbl}.`;
  if (etapaAtual.includes("Próximos Passos vistos") && plano === "academy")
    return `Olá, ${firstName}! Seus próximos passos estão definidos. Que tal começar pelo Diagnóstico de IA? Leva 15 minutos e personaliza toda sua experiência.`;
  if (etapaAtual.includes("Próximos Passos vistos") && plano === "skills")
    return `Olá, ${firstName}! O diagnóstico individual do squad está pendente. Cada membro precisa completar o próprio — você é o primeiro passo.`;
  if (etapaAtual.includes("Próximos Passos vistos") && (plano === "business_parceria" || plano === "business_sistemas"))
    return `Olá, ${firstName}! Seu projeto está configurado. Explore o Roadmap para ver as etapas e o que será entregue.`;
  return `Olá, ${firstName}! Estamos aqui se precisar de ajuda para continuar sua jornada na plataforma.`;
}

type FilterKey = "todos" | "academy" | "business_parceria" | "business_sistemas" | "skills" | "gratuito" | "parados";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "academy", label: "Academy" },
  { key: "business_parceria", label: "Business Parceria" },
  { key: "business_sistemas", label: "Business Sistemas" },
  { key: "skills", label: "Skills" },
  { key: "gratuito", label: "Gratuito" },
  { key: "parados", label: "Parados 3+ dias" },
];

const FUNNEL_COLORS = ["#AFC040", "#2CBBA6", "#4A9FE0", "#E8A43C", "#AFC040"];

// ── KPI Card ──

function KpiCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: number | string; accent?: string }) {
  const numVal = typeof value === "number" ? value : 0;
  const animated = useCountUp(numVal);
  return (
    <Card className={adminTheme.statsCard}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-lg p-2" style={{ backgroundColor: accent ? `${accent}20` : undefined }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <div>
          <p className={adminTheme.statsLabel}>{label}</p>
          <p className={adminTheme.statsValue}>{typeof value === "string" ? value : animated}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ──

export default function OnboardingMonitor() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [notifying, setNotifying] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 20;

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["onb-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome_completo, email, plano_mentoria, primeiro_acesso, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: eventos, isLoading: loadingEventos } = useQuery({
    queryKey: ["onb-eventos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_eventos")
        .select("user_id, evento, plano, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Evento[];
    },
  });

  const isLoading = loadingProfiles || loadingEventos;

  const rows: UserRow[] = useMemo(() => {
    if (!profiles || !eventos) return [];
    return profiles.map((p) => ({ profile: p, ...calcularStatus(p, eventos) }));
  }, [profiles, eventos]);

  const filtered = useMemo(() => {
    if (filter === "todos") return rows;
    if (filter === "parados") return rows.filter((r) => r.parado3dias);
    if (filter === "gratuito") return rows.filter((r) => !r.profile.plano_mentoria);
    return rows.filter((r) => r.profile.plano_mentoria === filter);
  }, [rows, filter]);

  useEffect(() => setPagina(1), [filter]);

  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
  const usuariosPagina = filtered.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // KPIs
  const total = rows.length;
  const completos = rows.filter((r) => r.status === "completo").length;
  const emAndamento = rows.filter((r) => r.status === "em_andamento").length;
  const parados = rows.filter((r) => r.parado3dias).length;
  const pctCompleto = total > 0 ? Math.round((completos / total) * 100) : 0;

  // Funnel
  const funnelData = useMemo(() => {
    if (!eventos) return [];
    const uniqueUsers = (ev: string) => new Set(eventos.filter((e) => e.evento === ev).map((e) => e.user_id)).size;
    return [
      { label: "Cadastro", value: total },
      { label: "Vídeo assistido", value: uniqueUsers("video_visto") },
      { label: "Tour concluído", value: uniqueUsers("tour_concluido") },
      { label: "Próximos passos", value: uniqueUsers("proximos_passos_vistos") },
      { label: "Ação principal", value: rows.filter((r) => r.acaoConcluida).length },
    ];
  }, [eventos, total, rows]);

  const handleNotificar = useCallback(async (row: UserRow) => {
    const { profile } = row;
    setNotifying(profile.id);
    try {
      const mensagem = getMensagemNotificacao(row.etapaAtual, profile.nome_completo, profile.plano_mentoria);
      const { error } = await supabase.from("notificacoes").insert({
        user_id: profile.id,
        titulo: "Continue sua configuração",
        mensagem,
        tipo: "sistema",
      });
      if (error) throw error;
      toast.success(`Notificação enviada para ${profile.nome_completo}`);
    } catch {
      toast.error("Erro ao enviar notificação");
    } finally {
      setNotifying(null);
    }
  }, []);

  const initials = (name: string | null) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
  };

  if (isLoading) {
    return (
      <div className={adminTheme.page}>
        <div className={adminTheme.pageHeader}>
          <div className={adminTheme.pageTitleWrapper}>
            <BarChart3 className={adminTheme.pageIcon} />
            <h1 className={adminTheme.pageTitle}>Monitor de Onboarding</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={adminTheme.page}>
      {/* Header */}
      <div className={adminTheme.pageHeader}>
        <div>
          <div className={adminTheme.pageTitleWrapper}>
            <BarChart3 className={adminTheme.pageIcon} />
            <h1 className={adminTheme.pageTitle}>Monitor de Onboarding</h1>
          </div>
          <p className={adminTheme.pageSubtitle}>Acompanhe a jornada de entrada de cada usuário por plano</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total de usuários" value={total} accent="#4A9FE0" />
        <KpiCard icon={CheckCircle} label="Onboarding completo" value={`${completos} (${pctCompleto}%)`} accent="#AFC040" />
        <KpiCard icon={Clock} label="Em andamento" value={emAndamento} accent="#E8A43C" />
        <KpiCard icon={AlertTriangle} label="Parados 3+ dias" value={parados} accent="#E8684A" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className={adminTheme.card}>
        <div className={adminTheme.tableContainer}>
          <Table>
            <TableHeader className={adminTheme.tableHeader}>
              <TableRow>
                <TableHead className={adminTheme.tableHeaderCell}>Usuário</TableHead>
                <TableHead className={adminTheme.tableHeaderCell}>Plano</TableHead>
                <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                <TableHead className={adminTheme.tableHeaderCell}>Parado em</TableHead>
                <TableHead className={adminTheme.tableHeaderCell}>Dias parado</TableHead>
                <TableHead className={adminTheme.tableHeaderCell}>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum usuário encontrado para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const { badgeStatus, label } = STATUS_MAP[row.status];
                  return (
                    <TableRow key={row.profile.id} className={adminTheme.tableRow}>
                      <TableCell className={adminTheme.tableCell}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground shrink-0">
                            {initials(row.profile.nome_completo)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{row.profile.nome_completo ?? "—"}</p>
                            <p className="text-xs text-muted-foreground truncate">{row.profile.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="em_andamento" label={planoLabel(row.profile.plano_mentoria)} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={badgeStatus} label={label} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {row.etapaAtual}
                      </TableCell>
                      <TableCell>
                        <span className={cn("text-sm font-medium", row.diasParado >= 3 && "text-[#E8684A]")}>
                          {row.diasParado} dias
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.status === "completo" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className={adminTheme.buttonSm}
                            onClick={() => navigate(`/admin/usuarios`)}
                          >
                            Ver perfil
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant={row.status === "nao_iniciou" ? "default" : "outline"}
                            className={cn(
                              adminTheme.buttonSm,
                              row.status === "nao_iniciou" && "bg-[#E8A43C] hover:bg-[#d4932e] text-white border-0"
                            )}
                            disabled={notifying === row.profile.id}
                            onClick={() => handleNotificar(row)}
                          >
                            {notifying === row.profile.id ? "Enviando…" : "Notificar"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Funnel */}
      <Card className={adminTheme.card}>
        <CardHeader className={adminTheme.cardHeader}>
          <CardTitle className={adminTheme.cardTitle}>Funil de onboarding — onde os usuários param</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {funnelData.map((step, i) => {
            const maxVal = funnelData[0]?.value || 1;
            const pct = Math.max((step.value / maxVal) * 100, 2);
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-[120px] shrink-0 text-right">{step.label}</span>
                <div className="flex-1 h-7 rounded-md overflow-hidden bg-muted/30">
                  <div
                    className="h-full rounded-md flex items-center px-2 transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: FUNNEL_COLORS[i] }}
                  >
                    <span className="text-xs font-semibold text-white drop-shadow-sm">{step.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
