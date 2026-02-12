import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

interface MemberDonutChartsProps {
  ranking: RankingItem[];
  entregas: Entrega[];
}

const BRAND_GREEN = "hsl(72, 50%, 35%)";
const MUTED_BG = "hsl(var(--muted))";

function MemberDonut({ member, entregas }: { member: RankingItem; entregas: Entrega[] }) {
  const pct = member.totalEntregas > 0
    ? Math.round((member.entregasConcluidas / member.totalEntregas) * 100)
    : 0;

  const data = [
    { name: "done", value: member.entregasConcluidas || 0.01 },
    { name: "remaining", value: Math.max(0, member.totalEntregas - member.entregasConcluidas) || 0.01 },
  ];

  const memberEntregas = entregas
    .filter((e) => e.responsavelId === member.userId)
    .slice(0, 3);

  const statusColor = (s: string) => {
    if (s === "concluido" || s === "aprovada") return "bg-[hsl(72,50%,35%)]";
    if (s === "em_andamento") return "bg-amber-400";
    if (s === "atrasado") return "bg-red-400";
    return "bg-muted-foreground/40";
  };

  return (
    <div className="flex flex-col items-center gap-3">
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
      <p className="text-sm font-medium text-center truncate max-w-[120px]">{member.nome}</p>
      <div className="w-full space-y-1.5">
        {memberEntregas.length > 0 ? (
          memberEntregas.map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor(e.status)}`} />
              <span className="truncate text-muted-foreground">{e.titulo}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center">Sem entregas</p>
        )}
      </div>
    </div>
  );
}

export default function MemberDonutCharts({ ranking, entregas }: MemberDonutChartsProps) {
  if (ranking.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Impacto vs ROI</CardTitle>
          <CardDescription>Efetividade por membro da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Impacto vs ROI</CardTitle>
        <CardDescription>Efetividade por membro da equipe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-6">
          {ranking.map((member) => (
            <MemberDonut key={member.userId} member={member} entregas={entregas} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
