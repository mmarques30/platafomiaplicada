import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RankingItem {
  posicao: number;
  userId: string;
  nome: string;
  entregasConcluidas: number;
  totalEntregas: number;
  performanceMedia: number;
  totalProjetos?: number;
  projetosEmAndamento?: number;
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

function MemberDonut({ member, entregas, projetos }: { member: RankingItem; entregas: Entrega[]; projetos: Projeto[] }) {
  const memberEntregas = entregas.filter((e) => e.responsavelId === member.userId);
  const memberProjetos = projetos.filter((p) => p.responsavelId === member.userId);

  // Combined items for listing
  const allItems = [
    ...memberProjetos.map(p => ({ id: p.id, titulo: p.titulo, status: p.status, type: "projeto" as const })),
    ...memberEntregas.map(e => ({ id: e.id, titulo: e.titulo, status: e.status, type: "entrega" as const })),
  ];

  const totalItems = (member.totalProjetos || memberProjetos.length) + member.totalEntregas;
  const doneItems = member.entregasConcluidas + (member.projetosEmAndamento || 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const data = [
    { name: "done", value: doneItems || 0.01 },
    { name: "remaining", value: Math.max(0, totalItems - doneItems) || 0.01 },
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
        {memberProjetos.length} proj · {member.entregasConcluidas}/{member.totalEntregas} entregas
      </p>
      <div className="w-full space-y-1.5">
        {allItems.length > 0 ? (
          allItems.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor(item.status)}`} />
              <span className="truncate text-muted-foreground" title={item.titulo}>{item.titulo}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center">Sem itens atribuídos</p>
        )}
        {allItems.length > 4 && (
          <p className="text-xs text-muted-foreground/60 text-center">+{allItems.length - 4} mais</p>
        )}
      </div>
    </div>
  );
}

export default function MemberDonutCharts({ ranking, entregas, projetos = [] }: MemberDonutChartsProps) {
  if (ranking.length === 0) {
    return (
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-[#4A5516] rounded-t-xl dark-header">
          <CardTitle>Impacto vs ROI</CardTitle>
          <CardDescription>Efetividade por membro da equipe</CardDescription>
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
      <CardHeader className="bg-[#4A5516] rounded-t-xl dark-header">
        <CardTitle>Impacto vs ROI</CardTitle>
        <CardDescription>Efetividade por membro da equipe</CardDescription>
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
