import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Edit, ChevronRight } from "lucide-react";

export function StatusDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg animate-pulse">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    );
  }

  const completo = formulario?.completado;
  const preenchidoPorAdmin = formulario?.preenchido_por === 'admin';
  const dataAnalise = formulario?.insight_gerado_em 
    ? format(new Date(formulario.insight_gerado_em), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <div className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Status Badge */}
        {completo ? (
          <Badge variant="default" className="shrink-0">Completo</Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">Pendente</Badge>
        )}

        {/* Título */}
        <span className="font-medium text-sm truncate">Diagnóstico IA</span>

        {/* Data ou Info adicional */}
        {completo && dataAnalise && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            Análise: {dataAnalise}
          </span>
        )}

        {/* Badge mentor */}
        {preenchidoPorAdmin && (
          <Badge variant="outline" className="text-xs hidden md:inline-flex">
            Mentor
          </Badge>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 shrink-0">
        {completo ? (
          <>
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => navigate("/mentoria/diagnostico")}
              className="hidden sm:flex"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate("/mentoria/painel-diagnostico")}
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ver Painel</span>
              <ChevronRight className="w-4 h-4 sm:hidden" />
            </Button>
          </>
        ) : (
          <Button 
            size="sm"
            onClick={() => navigate("/mentoria/diagnostico")}
          >
            Iniciar
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
