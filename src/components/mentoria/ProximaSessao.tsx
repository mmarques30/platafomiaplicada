import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ExternalLink, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ProximaSessao() {
  const navigate = useNavigate();
  const { sessoes, isLoading } = useMentoriaSessoes();

  if (isLoading) {
    return null;
  }

  // Buscar próxima sessão agendada
  const proximaSessao = sessoes
    .filter(s => s.status === "agendada" && new Date(s.data_sessao) > new Date())
    .sort((a, b) => new Date(a.data_sessao).getTime() - new Date(b.data_sessao).getTime())[0];

  if (!proximaSessao) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Próxima Sessão</CardTitle>
              <CardDescription>Nenhuma sessão agendada no momento</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/mentoria/sessoes")}
            variant="outline"
            className="w-full"
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
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Próxima Sessão</CardTitle>
              <CardDescription>{proximaSessao.titulo}</CardDescription>
            </div>
          </div>
          <Badge variant={urgenciaVariant}>{urgenciaTexto}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(dataSessao, "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(dataSessao, "HH:mm", { locale: ptBR })}
              {proximaSessao.duracao && ` - ${proximaSessao.duracao}min`}
            </span>
          </div>
        </div>
        
        {proximaSessao.notas && (
          <p className="text-sm text-muted-foreground">{proximaSessao.notas}</p>
        )}

        <div className="flex gap-2">
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
              className="flex-1 gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Link da Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
