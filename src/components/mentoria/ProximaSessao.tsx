import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ProximaSessao() {
  const navigate = useNavigate();
  const { sessoes, isLoading } = useMentoriaSessoes();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 bg-muted animate-pulse rounded w-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-10 bg-muted animate-pulse rounded w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  // Buscar próxima sessão agendada
  const proximaSessao = sessoes
    .filter(s => s.status === "agendada" && new Date(s.data_sessao) > new Date())
    .sort((a, b) => new Date(a.data_sessao).getTime() - new Date(b.data_sessao).getTime())[0];

  if (!proximaSessao) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-lg">Próxima Sessão</CardTitle>
            <CardDescription className="text-sm">Nenhuma sessão agendada</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Você não possui sessões agendadas no momento.
          </p>
          <Button 
            onClick={() => navigate("/mentoria/sessoes")}
            variant="outline"
            className="w-full mt-auto"
          >
            Ver Todas as Sessões
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dataSessao = new Date(proximaSessao.data_sessao);
  const diasRestantes = differenceInDays(dataSessao, new Date());
  
  let urgenciaTexto = "";
  let urgenciaVariant: "default" | "secondary" | "destructive" = "default";
  
  if (diasRestantes === 0) {
    urgenciaTexto = "Hoje";
    urgenciaVariant = "destructive";
  } else if (diasRestantes === 1) {
    urgenciaTexto = "Amanhã";
    urgenciaVariant = "default";
  } else if (diasRestantes <= 3) {
    urgenciaTexto = `Em ${diasRestantes} dias`;
    urgenciaVariant = "default";
  } else {
    urgenciaTexto = `Em ${diasRestantes} dias`;
    urgenciaVariant = "secondary";
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Próxima Sessão</CardTitle>
            <CardDescription className="text-sm">{proximaSessao.titulo}</CardDescription>
          </div>
          <Badge variant={urgenciaVariant}>{urgenciaTexto}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span>{format(dataSessao, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div>
              <span>
                {format(dataSessao, "HH:mm", { locale: ptBR })}
                {proximaSessao.duracao && ` - ${proximaSessao.duracao}min`}
              </span>
            </div>
          </div>
          
          {proximaSessao.notas && (
            <p className="text-sm text-muted-foreground mt-3">
              {proximaSessao.notas}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <Button 
            onClick={() => navigate("/mentoria/sessoes")}
            variant="outline"
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          {proximaSessao.video_url && (
            <Button
              onClick={() => window.open(proximaSessao.video_url, '_blank')}
              className="flex-1"
            >
              Link da Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
