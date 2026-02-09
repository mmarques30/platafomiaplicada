import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useSkillsLider } from "@/hooks/useSkillsLider";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo, useState } from "react";
import { parseISO } from "date-fns";

const chartConfig = {
  projetado: {
    label: "ROI Projetado",
    color: "hsl(var(--muted-foreground))",
  },
  executado: {
    label: "ROI Executado",
    color: "hsl(78, 54%, 34%)",
  },
} satisfies ChartConfig;

export default function GraficoCalendarioSection() {
  const { roiChartData, entregas } = useSkillsLider();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Dias com prazo de entrega para destacar no calendário
  const eventDays = useMemo(() => {
    if (!entregas) return [];
    return entregas
      .filter((e) => e.prazo)
      .map((e) => parseISO(e.prazo!));
  }, [entregas]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
      {/* Gráfico de Área */}
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-3 px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--muted-foreground))" }} />
              <span className="text-xs text-muted-foreground">ROI Projetado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(78, 54%, 34%)" }} />
              <span className="text-xs text-muted-foreground">ROI Executado</span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <AreaChart data={roiChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradProjetado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradExecutado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(78, 54%, 34%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(78, 54%, 34%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="semana"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="projetado"
                stroke="hsl(var(--muted-foreground))"
                fill="url(#gradProjetado)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="executado"
                stroke="hsl(78, 54%, 34%)"
                fill="url(#gradExecutado)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Mini Calendário */}
      <Card className="border-border bg-card">
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ event: eventDays }}
            modifiersClassNames={{
              event: "bg-orange-500/20 text-orange-700 dark:text-orange-400 font-semibold",
            }}
            className="p-0 pointer-events-auto"
            classNames={{
              months: "flex flex-col w-full",
              month: "space-y-3 w-full",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-semibold",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              table: "w-full border-collapse",
              head_row: "flex w-full justify-between",
              head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[11px] text-center",
              row: "flex w-full mt-1 justify-between",
              cell: "h-8 flex-1 text-center text-xs p-0 relative flex items-center justify-center",
              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-md text-xs",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary",
              day_today: "bg-accent text-accent-foreground font-bold",
              day_outside: "text-muted-foreground opacity-40",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
