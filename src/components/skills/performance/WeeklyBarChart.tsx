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

interface Projeto {
  responsavelId: string | null;
  status: string;
}

interface WeeklyBarChartProps {
  ranking: RankingItem[];
  entregas: any[];
  projetos?: Projeto[];
}

export default function WeeklyBarChart({ ranking, entregas, projetos = [] }: WeeklyBarChartProps) {
  const hasEntregas = entregas.length > 0;

  return (
    <Card className="bg-[#0D0D0D] border-[#0D0D0D] dark-header">
      <CardHeader>
        <CardTitle>Evolução de Maturidade</CardTitle>
        <CardDescription>
          {hasEntregas
            ? `Total Entregas: ${ranking.reduce((a, r) => a + r.totalEntregas, 0)}`
            : `Total Projetos: ${projetos.length}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">Sem dados</p>
        ) : (
          <div className="space-y-5">
            {ranking.map((member) => {
              const pct = member.totalEntregas > 0
                ? Math.round((member.entregasConcluidas / member.totalEntregas) * 100)
                : 0;
              return (
                <div key={member.userId} className="space-y-1.5">
                  <p className="text-sm font-medium text-white">{member.nome}</p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>
                      {member.entregasConcluidas} / {member.totalEntregas} {hasEntregas ? "entregas" : "projetos"}
                    </span>
                    <span className="font-semibold text-white">{pct}%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-3 w-full">
                    <div
                      className="bg-[#9EB038] rounded-full h-3 transition-all"
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
