import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEquipesSkillsAdmin } from "@/hooks/admin/useEquipesSkillsAdmin";
import { Users, Building2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipesSkillsTabProps {
  selectedEquipeId: string | null;
  onSelectEquipe: (id: string | null) => void;
}

export default function EquipesSkillsTab({ selectedEquipeId, onSelectEquipe }: EquipesSkillsTabProps) {
  const { data: equipes, isLoading } = useEquipesSkillsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!equipes || equipes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma equipe cadastrada</h3>
          <p className="text-muted-foreground text-center">
            As equipes Skills aparecerão aqui quando forem criadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecione uma equipe para gerenciar diagnósticos e conteúdos
        </p>
        {selectedEquipeId && (
          <Button variant="ghost" size="sm" onClick={() => onSelectEquipe(null)}>
            Limpar seleção
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipes.map((equipe) => (
          <Card
            key={equipe.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedEquipeId === equipe.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelectEquipe(equipe.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {equipe.nome}
                    {selectedEquipeId === equipe.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CardTitle>
                  {equipe.empresa_nome && (
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {equipe.empresa_nome}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={equipe.status === "ativo" ? "default" : "secondary"}>
                  {equipe.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{equipe.membros_count} membro{equipe.membros_count !== 1 ? "s" : ""}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
