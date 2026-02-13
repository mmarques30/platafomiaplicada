import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, addMonths, isSameMonth, startOfMonth, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Entrega {
  prazo?: string | null;
  concluido_em?: string | null;
  [key: string]: unknown;
}

interface Props {
  entregas: Entrega[];
  dataInicio?: string | null;
  dataFim?: string | null;
  filtroDataInicio?: Date;
  filtroDataFim?: Date;
}

const CustomLegend = () => (
  <div className="flex items-center justify-center gap-6 pt-2">
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#a1a1aa" }} />
      <span className="text-xs text-muted-foreground">Projetadas</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#9EB038" }} />
      <span className="text-xs text-muted-foreground">Executadas</span>
    </div>
  </div>
);

export default function EntregasProjetadasVsExecutadasChart({
  entregas,
  dataInicio,
  dataFim,
  filtroDataInicio,
  filtroDataFim,
}: Props) {
  const data = useMemo(() => {
    // Determine the range start: filter > contract start > fallback to now
    const contractStart = dataInicio
      ? startOfMonth(new Date(dataInicio))
      : startOfMonth(new Date());

    const contractEnd = dataFim
      ? startOfMonth(new Date(dataFim))
      : null;

    // Use filter dates when provided, otherwise use contract dates
    const rangeStart = filtroDataInicio
      ? startOfMonth(filtroDataInicio)
      : contractStart;

    const now = new Date();
    const defaultEnd = contractEnd
      ? contractEnd
      : startOfMonth(addMonths(contractStart, 5)); // 6 months forward by default

    const rangeEnd = filtroDataFim
      ? startOfMonth(filtroDataFim)
      : (differenceInMonths(now, rangeStart) > 0
          ? startOfMonth(now) > defaultEnd ? startOfMonth(now) : defaultEnd
          : defaultEnd);

    // Generate months forward from rangeStart to rangeEnd
    const monthCount = Math.max(differenceInMonths(rangeEnd, rangeStart) + 1, 1);
    const months = Array.from({ length: Math.min(monthCount, 24) }, (_, i) =>
      startOfMonth(addMonths(rangeStart, i))
    );

    return months.map((month) => ({
      name: format(month, "MMM/yy", { locale: ptBR }),
      projetadas: entregas.filter(
        (e) => e.prazo && isSameMonth(new Date(e.prazo), month)
      ).length,
      executadas: entregas.filter(
        (e) => e.concluido_em && isSameMonth(new Date(e.concluido_em), month)
      ).length,
    }));
  }, [entregas, dataInicio, dataFim, filtroDataInicio, filtroDataFim]);

  return (
    <Card className="overflow-hidden border-border rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Entregas Projetadas vs Executadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradProjetadas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExecutadas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9EB038" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9EB038" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="projetadas"
              name="Projetadas"
              stroke="#a1a1aa"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradProjetadas)"
            />
            <Area
              type="monotone"
              dataKey="executadas"
              name="Executadas"
              stroke="#9EB038"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradExecutadas)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}
