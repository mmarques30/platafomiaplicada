import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface StatusPieChartProps {
  entregas: { status: string }[];
  projetos?: { status: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  concluido: "#9EB038",
  aprovada: "#9EB038",
  em_andamento: "#D4E68A",
  atrasado: "#C45A3C",
  pendente: "#B8CC5A",
  levantado: "#6B8A3D",
  priorizado: "#4A5516",
  nao_aprovado: "#8B6F47",
};

const STATUS_LABELS: Record<string, string> = {
  concluido: "Concluído",
  aprovada: "Aprovada",
  em_andamento: "Em andamento",
  atrasado: "Atrasado",
  pendente: "Pendente",
  levantado: "Levantado",
  priorizado: "Priorizado",
  nao_aprovado: "Não aprovado",
};

const chartConfig: ChartConfig = {
  concluido: { label: "Concluído", color: "#9EB038" },
  em_andamento: { label: "Em andamento", color: "#D4E68A" },
  atrasado: { label: "Atrasado", color: "#C45A3C" },
  pendente: { label: "Pendente", color: "#B8CC5A" },
  levantado: { label: "Levantado", color: "#6B8A3D" },
  priorizado: { label: "Priorizado", color: "#4A5516" },
  nao_aprovado: { label: "Não aprovado", color: "#8B6F47" },
};

export default function StatusPieChart({ entregas, projetos = [] }: StatusPieChartProps) {
  // Combine both sources
  const allItems = useMemo(() => [...entregas, ...projetos], [entregas, projetos]);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach((e) => {
      const key = e.status === "aprovada" ? "concluido" : (e.status || "pendente");
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      status,
    }));
  }, [allItems]);

  return (
    <Card className="border-border bg-card border-l-4 border-l-[#9EB038]">
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription>Projetos e entregas combinados</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "hsl(var(--muted))"} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
