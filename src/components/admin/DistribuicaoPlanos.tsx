import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DistribuicaoPlanosProps {
  distribuicao: {
    academy: number;
    skills: number;
    business_parceria: number;
    business_sistemas: number;
    sem_plano: number;
  };
}

const COLORS: Record<string, string> = {
  academy: "#22c55e",
  skills: "#f59e0b",
  business_parceria: "#8b5cf6",
  business_sistemas: "#6366f1",
  sem_plano: "#6b7280",
};

const LABELS: Record<string, string> = {
  academy: "Academy",
  skills: "Skills",
  business_parceria: "Business Parceria",
  business_sistemas: "Business Sistemas",
  sem_plano: "Sem Plano",
};

export function DistribuicaoPlanos({ distribuicao }: DistribuicaoPlanosProps) {
  const data = Object.entries(distribuicao)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value,
      color: COLORS[key] || "#6b7280",
    }))
    .filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Distribuição por Plano</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [value, 'Usuários']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 flex flex-col justify-center">
            {Object.entries(distribuicao).map(([key, value]) => {
              if (value === 0) return null;
              const percent = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[key] || "#6b7280" }}
                    />
                    <span className="text-sm font-medium">
                      {LABELS[key] || key}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{value}</span>
                    <span className="text-xs text-muted-foreground">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
