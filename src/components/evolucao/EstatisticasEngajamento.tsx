import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Wrench, MessageCircle } from "lucide-react";

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
      icon: Users,
    },
    {
      label: "Vídeos Assistidos",
      value: totalVideos,
      icon: Video,
    },
    {
      label: "Ferramentas Compartilhadas",
      value: totalFerramentas,
      icon: Wrench,
    },
    {
      label: "Comentários",
      value: totalComentarios,
      icon: MessageCircle,
    },
  ];

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-2xl">Estatísticas da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-zinc-800/50 border border-aplicada-green-900/30 space-y-2"
              >
                <Icon className="h-5 w-5 text-primary/60 mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
