import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EstatisticasEngajamentoProps {
  ranking: any[];
}

export function EstatisticasEngajamento({ ranking }: EstatisticasEngajamentoProps) {
  const totalVideos = ranking?.reduce((sum, r) => sum + (r.total_videos_assistidos || 0), 0) || 0;
  const totalFerramentas = ranking?.reduce((sum, r) => sum + (r.total_ferramentas_compartilhadas || 0), 0) || 0;
  const totalComentarios = ranking?.reduce((sum, r) => sum + (r.total_comentarios || 0), 0) || 0;
  const totalUsuarios = ranking?.length || 0;

  const stats = [
    {
      label: "Usuários Ativos",
      value: totalUsuarios,
    },
    {
      label: "Vídeos Assistidos",
      value: totalVideos,
    },
    {
      label: "Ferramentas Compartilhadas",
      value: totalFerramentas,
    },
    {
      label: "Comentários",
      value: totalComentarios,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-card border space-y-2"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
