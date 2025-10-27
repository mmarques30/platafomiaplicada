import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ConquistaCardProps {
  titulo: string;
  descricao: string;
  desbloqueada: boolean;
  dataDesbloqueio?: string;
  progresso?: number;
  progressoNecessario?: number;
}

export function ConquistaCard({
  titulo,
  descricao,
  desbloqueada,
  dataDesbloqueio,
  progresso,
  progressoNecessario,
}: ConquistaCardProps) {
  const mostrarProgresso = !desbloqueada && progresso !== undefined && progressoNecessario !== undefined;
  const percentualProgresso = mostrarProgresso ? Math.round((progresso / progressoNecessario) * 100) : 0;

  return (
    <Card className={desbloqueada ? "" : "opacity-60"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Badge variant={desbloqueada ? "default" : "secondary"}>
              {desbloqueada ? "Desbloqueada" : "Bloqueada"}
            </Badge>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{titulo}</h3>
              {mostrarProgresso && (
                <Badge variant="secondary" className="text-xs">
                  {progresso}/{progressoNecessario}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{descricao}</p>
            {desbloqueada && dataDesbloqueio && (
              <p className="text-xs text-muted-foreground">
                Desbloqueada em: {new Date(dataDesbloqueio).toLocaleDateString("pt-BR")}
              </p>
            )}
            {mostrarProgresso && (
              <Progress value={percentualProgresso} className="h-2 mt-2" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
