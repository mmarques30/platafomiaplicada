import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RankingItem {
  userId: string;
  nome: string;
  entregasConcluidas: number;
  totalEntregas: number;
  horasEconomizadas: number;
  performanceMedia: number;
  posicao: number;
}

interface WeeklyBarChartProps {
  ranking: RankingItem[];
  entregas: any[];
}

export default function WeeklyBarChart({ ranking }: WeeklyBarChartProps) {
  const totalConcluidas = ranking.reduce((a, r) => a + r.entregasConcluidas, 0);
  const totalEntregas = ranking.reduce((a, r) => a + r.totalEntregas, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Evolução de Maturidade</CardTitle>
        <CardDescription>Total Entregas: {totalEntregas}</CardDescription>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
        ) : (
          <div className="space-y-5">
            {ranking.map((member) => {
              const pct = member.totalEntregas > 0
                ? Math.round((member.entregasConcluidas / member.totalEntregas) * 100)
                : 0;
              return (
                <div key={member.userId} className="space-y-1.5">
                  <p className="text-sm font-medium">{member.nome}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{member.entregasConcluidas} / {member.totalEntregas} entregas</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="bg-muted rounded-full h-3 w-full">
                    <div
                      className="bg-[hsl(72,50%,35%)] rounded-full h-3 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
