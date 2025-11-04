import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
      label: "Vídeos Assistidos",
      value: evolucao?.totalVideos || 0,
    },
    {
      label: "Projetos Entregues",
      value: evolucao?.totalProjetos || 0,
    },
    {
      label: "Ferramentas Compartilhadas",
      value: evolucao?.totalFerramentas || 0,
      extra: `${evolucao?.totalVisualizacoes || 0} visualizações`,
    },
    {
      label: "Comentários nos Vídeos",
      value: evolucao?.totalComentarios || 0,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Minha Evolução Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">{stat.label}</p>
                {stat.extra && (
                  <p className="text-xs text-card-foreground/60">{stat.extra}</p>
                )}
              </div>
              <span className="text-2xl font-bold text-card-foreground">{stat.value}</span>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
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
