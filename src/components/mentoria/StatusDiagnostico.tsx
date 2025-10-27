import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function StatusDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted animate-pulse h-12 w-12" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${completo ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Brain className={`h-6 w-6 ${completo ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <CardTitle className="text-xl">Diagnóstico IA</CardTitle>
              <CardDescription>
                {completo 
                  ? "Seu diagnóstico está completo" 
                  : "Inicie seu diagnóstico personalizado"
                }
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {completo ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completo
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Pendente
              </Badge>
            )}
            {preenchidoPorAdmin && (
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                Preenchido pelo mentor
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {completo ? (
          <>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ Perfil analisado</p>
              <p>✓ Objetivos definidos</p>
              <p>✓ Plano personalizado gerado</p>
              {formulario?.insight_gerado_em && (
                <p className="mt-2">
                  Última análise: {format(new Date(formulario.insight_gerado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
            <Button 
              onClick={() => navigate("/mentoria/diagnostico")}
              variant="outline"
              className="w-full"
            >
              Ver Diagnóstico Completo
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Complete seu diagnóstico para receber um plano personalizado com IA baseado no seu perfil e objetivos.
            </p>
            <Button 
              onClick={() => navigate("/mentoria/diagnostico")}
              className="w-full"
            >
              Iniciar Diagnóstico
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
