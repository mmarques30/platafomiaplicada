import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { chartColors } from "@/lib/chartColors";

interface Entrega {
  prazo?: string | null;
  concluido_em?: string | null;
  [key: string]: unknown;
}

interface Props {
  entregas: Entrega[];
}

export default function EntregasProjetadasVsExecutadasChart({ entregas }: Props) {
  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(now, 5 - i)));

    return months.map((month) => ({
      name: format(month, "MMM", { locale: ptBR }),
      projetadas: entregas.filter(
        (e) => e.prazo && isSameMonth(new Date(e.prazo), month)
      ).length,
      executadas: entregas.filter(
        (e) => e.concluido_em && isSameMonth(new Date(e.concluido_em), month)
      ).length,
    }));
  }, [entregas]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#0D0D0D] rounded-t-xl pb-2">
        <CardTitle className="text-base font-semibold text-white">
          Entregas Projetadas vs Executadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis allowDecimals={false} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Bar
              dataKey="projetadas"
              name="Projetadas"
              fill={chartColors.states.neutral}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="executadas"
              name="Executadas"
              fill={chartColors.states.positive}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
