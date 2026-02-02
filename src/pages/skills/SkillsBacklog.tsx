import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodo, Clock, User, GripVertical, ArrowUpDown } from "lucide-react";
import { useSkillsBacklog } from "@/hooks/useSkillsBacklog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const STATUS_CONFIG = {
  levantado: { label: "Levantado", color: "bg-slate-100 text-slate-700" },
  priorizado: { label: "Priorizado", color: "bg-blue-100 text-blue-700" },
  em_execucao: { label: "Em Execução", color: "bg-amber-100 text-amber-700" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-700" },
};

const PRIORIDADE_CONFIG = {
  alta: { label: "Alta", color: "bg-red-100 text-red-700" },
  media: { label: "Média", color: "bg-amber-100 text-amber-700" },
  baixa: { label: "Baixa", color: "bg-green-100 text-green-700" },
};

export default function SkillsBacklog() {
  const { items, isLoading } = useSkillsBacklog();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const columns = [
    { status: "levantado", title: "Levantado" },
    { status: "priorizado", title: "Priorizado" },
    { status: "em_execucao", title: "Em Execução" },
    { status: "entregue", title: "Entregue" },
  ];

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <ListTodo className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Backlog de Soluções</h1>
            <p className="text-muted-foreground">
              Soluções priorizadas para automação e produtividade
            </p>
          </div>
        </div>
        <Button variant="outline">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordenar
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnItems = items?.filter((item) => item.status === column.status) || [];
          
          return (
            <div key={column.status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">{columnItems.length}</Badge>
              </div>
              
              <div className="space-y-3 min-h-[200px] p-2 rounded-lg bg-muted/30">
                {columnItems.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.titulo}</h4>
                          {item.descricao && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.descricao}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Badge 
                          variant="secondary" 
                          className={PRIORIDADE_CONFIG[item.prioridade as keyof typeof PRIORIDADE_CONFIG]?.color}
                        >
                          {PRIORIDADE_CONFIG[item.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label}
                        </Badge>
                        
                        {item.horas_estimadas_economia > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.horas_estimadas_economia}h
                          </div>
                        )}
                      </div>

                      {item.responsavel && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={item.responsavel.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {item.responsavel.nome?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {item.responsavel.nome}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {columnItems.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    Nenhum item
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!items || items.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">Backlog Vazio</h3>
            <p className="text-sm text-muted-foreground">
              O backlog será preenchido após a conversa de alinhamento com a IAplicada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
