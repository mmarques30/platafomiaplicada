import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckSquare, Clock, FileText, Send, CheckCircle2, AlertCircle, Play, XCircle } from "lucide-react";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "bg-slate-100 text-slate-700", icon: Clock },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-700", icon: FileText },
  aguardando_validacao: { label: "Aguardando Validação", color: "bg-amber-100 text-amber-700", icon: Send },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export default function SkillsEntregas() {
  const { entregas, isLoading, isLider, submeterEntrega, iniciarEntrega } = useSkillsEntregas();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const entregasPendentes = entregas?.filter(e => e.status === 'pendente' || e.status === 'em_andamento') || [];
  const entregasAguardando = entregas?.filter(e => e.status === 'aguardando_validacao') || [];
  const entregasAprovadas = entregas?.filter(e => e.status === 'aprovada') || [];

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <CheckSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLider ? "Entregas da Equipe" : "Minhas Entregas"}
          </h1>
          <p className="text-muted-foreground">
            {isLider 
              ? "Visualize e acompanhe todas as entregas da equipe" 
              : "Tarefas atribuídas a você no projeto"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{entregasPendentes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Validação</p>
                <p className="text-2xl font-bold">{entregasAguardando.length}</p>
              </div>
              <Send className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold">{entregasAprovadas.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendentes">
        <TabsList className="skills-tabs-list">
          <TabsTrigger value="pendentes" className="skills-tabs-trigger">
            Pendentes ({entregasPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="aguardando" className="skills-tabs-trigger">
            Aguardando ({entregasAguardando.length})
          </TabsTrigger>
          <TabsTrigger value="aprovadas" className="skills-tabs-trigger">
            Aprovadas ({entregasAprovadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-6 space-y-4">
          {entregasPendentes.map((entrega) => (
            <EntregaCard 
              key={entrega.id} 
              entrega={entrega} 
              isLider={isLider}
              onIniciar={() => iniciarEntrega.mutate(entrega.id)}
              onSubmeter={() => submeterEntrega.mutate(entrega.id)}
            />
          ))}
          {entregasPendentes.length === 0 && <EmptyState message="Nenhuma entrega pendente" />}
        </TabsContent>

        <TabsContent value="aguardando" className="mt-6 space-y-4">
          {entregasAguardando.map((entrega) => (
            <EntregaCard 
              key={entrega.id} 
              entrega={entrega} 
              isLider={isLider}
            />
          ))}
          {entregasAguardando.length === 0 && <EmptyState message="Nenhuma entrega aguardando validação" />}
        </TabsContent>

        <TabsContent value="aprovadas" className="mt-6 space-y-4">
          {entregasAprovadas.map((entrega) => (
            <EntregaCard 
              key={entrega.id} 
              entrega={entrega} 
              isLider={isLider}
            />
          ))}
          {entregasAprovadas.length === 0 && <EmptyState message="Nenhuma entrega aprovada ainda" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EntregaCardProps {
  entrega: any;
  isLider?: boolean;
  onIniciar?: () => void;
  onSubmeter?: () => void;
}

function EntregaCard({ entrega, isLider, onIniciar, onSubmeter }: EntregaCardProps) {
  const status = STATUS_CONFIG[entrega.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = status?.icon || Clock;
  const isAtrasada = entrega.prazo && new Date(entrega.prazo) < new Date() && entrega.status !== 'aprovada';

  return (
    <Card className={isAtrasada ? 'border-red-200' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Show responsible avatar for leader */}
              {isLider && entrega.responsavel && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entrega.responsavel.avatar_url} />
                  <AvatarFallback>
                    {entrega.responsavel.nome_completo?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{entrega.titulo}</h3>
                {isAtrasada && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Atrasada
                  </Badge>
                )}
              </div>
            </div>
            
            {isLider && entrega.responsavel && (
              <p className="text-sm text-muted-foreground mt-1">
                Responsável: {entrega.responsavel.nome_completo}
              </p>
            )}
            
            {entrega.descricao && (
              <p className="text-sm text-muted-foreground mt-1">{entrega.descricao}</p>
            )}
            
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {entrega.prazo && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Prazo: {format(new Date(entrega.prazo), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Badge variant="secondary" className={status?.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status?.label}
            </Badge>
            
            {/* Actions based on status and role */}
            {!isLider && entrega.status === 'pendente' && onIniciar && (
              <Button size="sm" onClick={onIniciar}>
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            )}
            
            {!isLider && entrega.status === 'em_andamento' && onSubmeter && (
              <Button size="sm" onClick={onSubmeter}>
                <Send className="h-4 w-4 mr-1" />
                Enviar para Validação
              </Button>
            )}
            
            {(entrega.status === 'pendente' || entrega.status === 'em_andamento') && entrega.instrucoes && (
              <Button size="sm" variant="outline">
                Ver Instruções
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
