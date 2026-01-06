import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, ChevronRight, Calendar } from "lucide-react";

export function ProximaSessao() {
  const navigate = useNavigate();
  const { sessoes, isLoading } = useMentoriaSessoes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg animate-pulse">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    );
  }

  // Buscar próxima sessão agendada
  const proximaSessao = sessoes
    .filter(s => s.status === "agendada" && new Date(s.data_sessao) > new Date())
    .sort((a, b) => new Date(a.data_sessao).getTime() - new Date(b.data_sessao).getTime())[0];

  if (!proximaSessao) {
    return (
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          <Badge variant="outline" className="shrink-0">
            <Calendar className="w-3 h-3 mr-1" />
            Sem Sessão
          </Badge>
          <span className="text-sm text-muted-foreground">Nenhuma sessão agendada</span>
        </div>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/mentoria/sessoes")}
        >
          Ver Sessões
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
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
    <div className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Badge prazo */}
        <Badge variant={urgenciaVariant} className="shrink-0">
          {urgenciaTexto}
        </Badge>

        {/* Título */}
        <span className="font-medium text-sm truncate">{proximaSessao.titulo}</span>

        {/* Data/Hora */}
        <span className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">
          {format(dataSessao, "dd/MM 'às' HH:mm", { locale: ptBR })}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 shrink-0">
        {proximaSessao.video_url && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(proximaSessao.video_url, '_blank')}
            className="hidden sm:flex"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/mentoria/sessoes")}
        >
          <span className="hidden sm:inline">Ver Detalhes</span>
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
