import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Loader2, Map } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoadmapSkillsTabProps {
  equipeId: string | null;
}

export default function RoadmapSkillsTab({ equipeId }: RoadmapSkillsTabProps) {
  const { data: fases, isLoading } = useQuery({
    queryKey: ["roadmap-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];

      const { data, error } = await supabase
        .from("roadmap_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("semana_inicio", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!equipeId,
  });

  if (!equipeId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecione uma equipe</h3>
          <p className="text-muted-foreground text-center">
            Escolha uma equipe na aba "Equipes" para visualizar o roadmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!fases || fases.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Map className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Roadmap não configurado</h3>
          <p className="text-muted-foreground text-center">
            O roadmap de 12 semanas ainda não foi definido para esta equipe.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "concluida": return "bg-green-500";
      case "em_andamento": return "bg-blue-500";
      case "pendente": return "bg-gray-300";
      default: return "bg-gray-200";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "concluida": return "Concluída";
      case "em_andamento": return "Em Andamento";
      case "pendente": return "Pendente";
      default: return "Não iniciada";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Roadmap de 12 Semanas</CardTitle>
        </div>
        <CardDescription>
          Fases do programa Skills para a equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fases.map((fase) => (
            <div
              key={fase.id}
              className="flex items-center gap-4 p-4 rounded-lg border"
            >
              <div className={`w-3 h-3 rounded-full ${getStatusColor(fase.status)}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{fase.titulo}</h4>
                  <Badge variant="outline">
                    Sem. {fase.semana_inicio}-{fase.semana_fim}
                  </Badge>
                </div>
                {fase.descricao && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {fase.descricao}
                  </p>
                )}
              </div>
              <Badge variant={fase.status === "concluida" ? "default" : "secondary"}>
                {getStatusLabel(fase.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
