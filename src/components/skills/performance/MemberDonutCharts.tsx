import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RankingItem {
  posicao: number;
  userId: string;
  nome: string;
  entregasConcluidas: number;
  totalEntregas: number;
  performanceMedia: number;
}

interface Entrega {
  id: string;
  titulo: string;
  status: string;
  responsavelId: string | null;
  progresso: number;
}

interface Projeto {
  id: string;
  titulo: string;
  status: string;
  responsavelId: string | null;
  horasEstimadas: number;
}

interface MemberDonutChartsProps {
  ranking: RankingItem[];
  entregas: Entrega[];
  projetos?: Projeto[];
}

const BRAND_GREEN = "#9EB038";
const MUTED_BG = "hsl(var(--muted))";

const statusColor = (s: string) => {
  if (s === "concluido" || s === "aprovada") return "bg-[#9EB038]";
  if (s === "em_andamento") return "bg-amber-400";
  if (s === "atrasado") return "bg-red-400";
  if (s === "priorizado") return "bg-blue-400";
  if (s === "levantado") return "bg-muted-foreground/40";
  return "bg-muted-foreground/40";
};

const statusLabel = (s: string) => {
  if (s === "concluido" || s === "aprovada") return "Concluído";
  if (s === "em_andamento") return "Em andamento";
  if (s === "atrasado") return "Atrasado";
  if (s === "priorizado") return "Priorizado";
  if (s === "levantado") return "Levantado";
  if (s === "pendente") return "Pendente";
  return s;
};

function MemberDonut({ member, entregas, projetos }: { member: RankingItem; entregas: Entrega[]; projetos: Projeto[] }) {
  const memberEntregas = entregas.filter((e) => e.responsavelId === member.userId);
  const memberProjetos = projetos.filter((p) => p.responsavelId === member.userId);
  const hasEntregas = memberEntregas.length > 0;

  const items = hasEntregas ? memberEntregas : memberProjetos;
  const pct = member.totalEntregas > 0
    ? Math.round((member.entregasConcluidas / member.totalEntregas) * 100)
    : 0;

  const data = [
    { name: "done", value: member.entregasConcluidas || 0.01 },
    { name: "remaining", value: Math.max(0, member.totalEntregas - member.entregasConcluidas) || 0.01 },
  ];

  return (
    <div className="flex flex-col items-center gap-3 min-w-[140px] max-w-[180px]">
      <div className="relative">
        <PieChart width={100} height={100}>
          <Pie
            data={data}
            innerRadius={30}
            outerRadius={45}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={BRAND_GREEN} />
            <Cell fill={MUTED_BG} />
          </Pie>
        </PieChart>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {pct}%
        </span>
      </div>
      <p className="text-sm font-medium text-center truncate max-w-[160px]">{member.nome}</p>
      <p className="text-xs text-muted-foreground">
        {hasEntregas
          ? `${member.entregasConcluidas}/${member.totalEntregas} entregas`
          : `${memberProjetos.length} projeto${memberProjetos.length !== 1 ? "s" : ""}`}
      </p>
      <div className="w-full space-y-1.5">
        {items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor(item.status)}`} />
              <span className="truncate text-muted-foreground" title={item.titulo}>{item.titulo}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center">Sem projetos atribuídos</p>
        )}
        {items.length > 4 && (
          <p className="text-xs text-muted-foreground/60 text-center">+{items.length - 4} mais</p>
        )}
      </div>
    </div>
  );
}

export default function MemberDonutCharts({ ranking, entregas, projetos = [] }: MemberDonutChartsProps) {
  if (ranking.length === 0) {
    return (
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-[#0D0D0D] rounded-t-xl" style={{ color: "white" }}>
          <CardTitle style={{ color: "white" }}>Impacto vs ROI</CardTitle>
          <CardDescription style={{ color: "rgba(255,255,255,0.5)" }}>Efetividade por membro da equipe</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="bg-[#0D0D0D] rounded-t-xl" style={{ color: "white" }}>
        <CardTitle style={{ color: "white" }}>Impacto vs ROI</CardTitle>
        <CardDescription style={{ color: "rgba(255,255,255,0.5)" }}>Efetividade por membro da equipe</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap justify-center gap-6">
          {ranking.map((member) => (
            <MemberDonut key={member.userId} member={member} entregas={entregas} projetos={projetos} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
