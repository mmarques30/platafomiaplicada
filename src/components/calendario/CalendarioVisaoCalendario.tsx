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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Card className="p-8">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          className="pointer-events-auto w-full"
          classNames={{
            day_selected: "ring-2 ring-offset-2 ring-offset-background ring-primary/70",
          }}
          modifiers={{
            hasClass: datasComAulas,
          }}
          modifiersClassNames={{
            hasClass: "bg-primary/80 text-primary-foreground font-bold hover:bg-primary/60 hover:text-primary-foreground transition-colors duration-150",
          }}
        />
      </Card>

      <div className="space-y-4">
        {selectedDate ? (
          aulasDoDia.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-foreground text-center">
                Aulas em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              {aulasDoDia.map((aula) => (
                <Card key={aula.id} className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-lg text-sidebar">{aula.tema}</h4>
                        {aula.horario && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sidebar text-white text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            {aula.horario}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-semibold rounded-full",
                          aula.ativo
                            ? "bg-sidebar text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {aula.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    {aula.descricao && (
                      <p className="text-muted-foreground">{aula.descricao}</p>
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
