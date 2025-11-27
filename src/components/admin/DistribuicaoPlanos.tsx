import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DistribuicaoPlanosProps {
  distribuicao: {
    academy: number;
    lab: number;
    skills: number;
    club: number;
    sem_plano: number;
  };
}

const COLORS = {
  academy: "#22c55e",
  lab: "#3b82f6",
  skills: "#f59e0b",
  club: "#8b5cf6",
  sem_plano: "#6b7280",
};

const LABELS = {
  academy: "Academy",
  lab: "Lab",
  skills: "Skills",
  club: "Club",
  sem_plano: "Sem Plano",
};

export function DistribuicaoPlanos({ distribuicao }: DistribuicaoPlanosProps) {
  const data = Object.entries(distribuicao)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS],
      value,
      color: COLORS[key as keyof typeof COLORS],
    }))
    .filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Plano</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {Object.entries(distribuicao).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
                  />
                  <span className="text-sm font-medium">
                    {LABELS[key as keyof typeof LABELS]}
                  </span>
                </div>
                <span className="text-lg font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
