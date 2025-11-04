import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Share2, MessageSquare } from "lucide-react";

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
      icon: Users,
      label: "Usuários Ativos",
      value: totalUsuarios,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Video,
      label: "Vídeos Assistidos",
      value: totalVideos,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Share2,
      label: "Ferramentas Compartilhadas",
      value: totalFerramentas,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: MessageSquare,
      label: "Comentários",
      value: totalComentarios,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg ${stat.bgColor} space-y-2`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
