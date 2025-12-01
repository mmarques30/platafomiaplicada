import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useTodasAulas } from "@/hooks/useCalendarioAulas";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function CalendarioVisaoCalendario() {
  const { data: aulas, isLoading } = useTodasAulas();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!aulas || aulas.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma aula agendada no momento.</p>
      </Card>
    );
  }

  // Criar array de datas com aulas
  const datasComAulas = aulas
    .filter(aula => aula.data_aula)
    .map(aula => parseISO(aula.data_aula!));

  // Encontrar aulas do dia selecionado
  const aulasDoDia = selectedDate
    ? aulas.filter(
        aula => aula.data_aula && isSameDay(parseISO(aula.data_aula), selectedDate)
      )
    : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          className="pointer-events-auto"
          modifiers={{
            hasClass: datasComAulas,
          }}
          modifiersClassNames={{
            hasClass: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-bold",
          }}
        />
      </Card>

      <div className="space-y-4">
        {selectedDate ? (
          aulasDoDia.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-foreground">
                Aulas em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              {aulasDoDia.map((aula) => (
                <Card key={aula.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{aula.tema}</h4>
                        {aula.horario && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {aula.horario}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          aula.ativo
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        )}
                      >
                        {aula.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    {aula.descricao && (
                      <p className="text-sm text-muted-foreground">{aula.descricao}</p>
                    )}
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma aula agendada para {format(selectedDate, "dd/MM/yyyy")}
              </p>
            </Card>
          )
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Selecione uma data no calendário para ver as aulas
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
