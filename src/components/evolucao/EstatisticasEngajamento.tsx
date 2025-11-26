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
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-2xl">Estatísticas da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-zinc-800/50 border border-aplicada-green-900/30 space-y-2"
            >
              <p className="text-xs text-zinc-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
