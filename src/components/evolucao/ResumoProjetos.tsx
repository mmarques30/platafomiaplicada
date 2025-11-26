import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { FolderKanban, Target, Clock, CheckCircle2 } from "lucide-react";

export function ResumoProjetos() {
  const { projetos, isLoading } = useMentoriaProjetos();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const total = projetos?.length || 0;
  const planejamento = projetos?.filter(p => p.status === 'planejamento').length || 0;
  const emAndamento = projetos?.filter(p => p.status === 'em_andamento').length || 0;
  const concluidos = projetos?.filter(p => p.status === 'concluido').length || 0;

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FolderKanban className="h-5 w-5 text-primary" />
            Resumo de Projetos
          </CardTitle>
          <Badge variant="secondary" className="text-base">
            {total}
          </Badge>
        </div>
        <CardDescription>
          Acompanhamento dos seus projetos práticos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <div className="text-center py-6 text-zinc-500">
            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum projeto cadastrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-aplicada-green-900/30">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-white">Planejamento</span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                {planejamento}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-aplicada-green-900/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-white">Em Andamento</span>
              </div>
              <Badge variant="outline" className="border-orange-500/30 text-orange-500">
                {emAndamento}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-aplicada-green-900/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-white">Concluídos</span>
              </div>
              <Badge variant="outline" className="border-green-500/30 text-green-500">
                {concluidos}
              </Badge>
            </div>
          </div>
        )}

        {total > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Total de projetos cadastrados: <span className="font-semibold text-foreground">{total}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
