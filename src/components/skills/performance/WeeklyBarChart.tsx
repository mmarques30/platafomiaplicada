import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RankingItem {
  userId: string;
  nome: string;
  entregasConcluidas: number;
  totalEntregas: number;
  horasEconomizadas: number;
  performanceMedia: number;
  posicao: number;
  totalProjetos?: number;
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
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="bg-[#9EB038]/10 rounded-t-xl">
        <CardTitle>Evolução de Maturidade</CardTitle>
        <CardDescription>
          {`${projetos.length} projetos · ${entregas.length} entregas`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
        ) : (
          <div className="space-y-5">
            {ranking.map((member) => {
              const totalItems = (member.totalProjetos || 0) + member.totalEntregas;
              const doneItems = member.entregasConcluidas;
              const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
              return (
                <div key={member.userId} className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">{member.nome}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {member.entregasConcluidas} entregas · {member.totalProjetos || 0} projetos · {member.horasEconomizadas}h
                    </span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="bg-muted rounded-full h-3 w-full">
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
