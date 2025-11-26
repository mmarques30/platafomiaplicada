import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ListaProjetosSimples() {
  const { projetos, isLoading } = useMentoriaProjetos();
  const navigate = useNavigate();

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejamento':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-500">Planejamento</Badge>;
      case 'em_andamento':
        return <Badge variant="outline" className="border-orange-500/30 text-orange-500">Em Andamento</Badge>;
      case 'concluido':
        return <Badge variant="outline" className="border-green-500/30 text-green-500">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FolderKanban className="h-5 w-5 text-primary" />
              Meus Projetos
            </CardTitle>
            <CardDescription>
              Projetos práticos para aplicar seus conhecimentos
            </CardDescription>
          </div>
          <Button onClick={() => navigate("/mentoria/projetos")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!projetos || projetos.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="h-16 w-16 mx-auto mb-4 text-zinc-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2 text-white">Nenhum projeto ainda</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Crie seu primeiro projeto para começar a aplicar seus conhecimentos
            </p>
            <Button onClick={() => navigate("/mentoria/projetos")}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="p-4 border border-aplicada-green-900/20 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-primary/20 rounded-lg transition-all cursor-pointer"
                onClick={() => navigate("/mentoria/projetos")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-white">{projeto.titulo}</h4>
                      {getStatusBadge(projeto.status)}
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-zinc-400">
                      <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/60" />
                      <p className="line-clamp-2">{projeto.objetivo_projeto}</p>
                    </div>

                    {projeto.data_entrega && (
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Prazo: {format(new Date(projeto.data_entrega), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {projetos.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/mentoria/projetos")}
              >
                Ver Todos os Projetos ({projetos.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
