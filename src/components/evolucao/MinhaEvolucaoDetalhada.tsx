import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Video, FolderKanban, Share2, MessageSquare, Plus } from "lucide-react";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { CompartilharFerramentaModal } from "./CompartilharFerramentaModal";

export function MinhaEvolucaoDetalhada() {
  const { data: evolucao, isLoading } = useMinhaEvolucao();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      icon: Video,
      label: "Vídeos Assistidos",
      value: evolucao?.totalVideos || 0,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: FolderKanban,
      label: "Projetos Entregues",
      value: evolucao?.totalProjetos || 0,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Share2,
      label: "Ferramentas Compartilhadas",
      value: evolucao?.totalFerramentas || 0,
      extra: `${evolucao?.totalVisualizacoes || 0} visualizações`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: MessageSquare,
      label: "Comentários nos Vídeos",
      value: evolucao?.totalComentarios || 0,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Minha Evolução Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="font-medium">{stat.label}</p>
                      {stat.extra && (
                        <p className="text-xs text-muted-foreground">{stat.extra}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t">
            <Button 
              onClick={() => setModalOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compartilhar Nova Ferramenta
            </Button>
          </div>
        </CardContent>
      </Card>

      <CompartilharFerramentaModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
