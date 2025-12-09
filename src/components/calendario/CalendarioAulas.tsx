import { useAulasCalendario, useProximaAula } from "@/hooks/useCalendarioAulas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CalendarioAulas() {
  const { data: aulas, isLoading } = useAulasCalendario();
  const { data: proximaAula } = useProximaAula();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!aulas || aulas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma aula programada no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const outrasAulas = aulas.filter(aula => aula.id !== proximaAula?.id);

  return (
    <div className="space-y-6">
      {proximaAula && (
        <Card className="bg-zinc-900 border-primary text-white">
          <CardHeader>
            <CardTitle className="text-white">Próxima Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="text-xl font-semibold text-white">
              {proximaAula.tema}
            </h3>
            <div className="flex items-center gap-4 text-zinc-300">
              {proximaAula.data_aula && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(proximaAula.data_aula), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
              )}
              {proximaAula.horario && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{proximaAula.horario}</span>
                </div>
              )}
            </div>
            {proximaAula.descricao && (
              <p className="text-zinc-300 mt-2 whitespace-pre-line">
                {proximaAula.descricao}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {outrasAulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Aulas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outrasAulas.map((aula) => (
                <div
                  key={aula.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{aula.tema}</h4>
                    {aula.descricao && (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                        {aula.descricao}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {aula.data_aula && (
                      <div>{format(new Date(aula.data_aula), "dd/MM", { locale: ptBR })}</div>
                    )}
                    {aula.horario && <div>{aula.horario}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
