import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface WeeklyBarChartProps {
  data: { semana: string; maturidade: number }[];
}

const chartConfig: ChartConfig = {
  maturidade: { label: "Índice Semanal", color: "hsl(72, 50%, 35%)" },
};

export default function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Evolução por Semana</CardTitle>
        <CardDescription>Performance semanal do programa</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="semana" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="maturidade" fill="hsl(72, 50%, 35%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
