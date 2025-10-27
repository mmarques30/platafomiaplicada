import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function StatusDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();

  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardHeader>
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

  const completo = formulario?.completado;
  const preenchidoPorAdmin = formulario?.preenchido_por === 'admin';

  return (
    <Card className="h-full min-h-[400px] flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Diagnóstico IA</CardTitle>
            <CardDescription>
              {completo 
                ? "Seu diagnóstico está completo" 
                : "Inicie seu diagnóstico personalizado"
              }
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {completo ? (
              <Badge variant="default">
                Completo
              </Badge>
            ) : (
              <Badge variant="secondary">
                Pendente
              </Badge>
            )}
            {preenchidoPorAdmin && (
              <Badge variant="outline">
                Preenchido pelo mentor
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {completo ? (
          <>
            <div className="text-sm text-muted-foreground space-y-1 flex-1">
              <p>Perfil analisado</p>
              <p>Objetivos definidos</p>
              <p>Plano personalizado gerado</p>
              {formulario?.insight_gerado_em && (
                <p className="mt-2">
                  Última análise: {format(new Date(formulario.insight_gerado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
            <Button 
              onClick={() => navigate("/mentoria/diagnostico")}
              variant="outline"
              className="w-full mt-auto"
            >
              Ver Diagnóstico Completo
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground flex-1">
              Complete seu diagnóstico para receber um plano personalizado com IA baseado no seu perfil e objetivos.
            </p>
            <Button 
              onClick={() => navigate("/mentoria/diagnostico")}
              className="w-full mt-auto"
            >
              Iniciar Diagnóstico
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
