import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTodasAulas } from "@/hooks/useCalendarioAulas";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Clock, Video, HelpCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tipoEventoConfig = {
  aula_ao_vivo: {
    label: "Aula ao Vivo",
    color: "bg-primary",
    borderColor: "border-primary",
    icon: Video,
  },
  qa: {
    label: "Q&A",
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    icon: HelpCircle,
  },
  outro: {
    label: "Outro",
    color: "bg-muted-foreground",
    borderColor: "border-muted-foreground",
    icon: CalendarIcon,
  },
};

export function CalendarioVisaoCalendario() {
  const { data: aulas, isLoading } = useTodasAulas();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

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

  // Agrupar datas por tipo de evento
  const aulasAoVivo = aulas
    .filter(aula => aula.data_aula && (aula.tipo_evento === 'aula_ao_vivo' || !aula.tipo_evento))
    .map(aula => parseISO(aula.data_aula!));
  
  const qaSessions = aulas
    .filter(aula => aula.data_aula && aula.tipo_evento === 'qa')
    .map(aula => parseISO(aula.data_aula!));
  
  const outrosEventos = aulas
    .filter(aula => aula.data_aula && aula.tipo_evento === 'outro')
    .map(aula => parseISO(aula.data_aula!));

  // Encontrar aulas do dia selecionado
  const aulasDoDia = selectedDate
    ? aulas.filter(
        aula => aula.data_aula && isSameDay(parseISO(aula.data_aula), selectedDate)
      )
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const temAulas = aulas.some(
        aula => aula.data_aula && isSameDay(parseISO(aula.data_aula), date)
      );
      if (temAulas) {
        setShowModal(true);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Aula ao Vivo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">Q&A</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-muted-foreground" />
          <span className="text-sm text-muted-foreground">Outro</span>
        </div>
      </div>

      <Card className="p-4 md:p-8">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={ptBR}
          className="pointer-events-auto w-full"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
            month: "space-y-4 w-full",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
            row: "flex w-full mt-2",
            cell: "h-12 md:h-16 flex-1 text-center text-base p-0 relative flex items-center justify-center focus-within:relative focus-within:z-20",
            day: "h-10 w-10 md:h-14 md:w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-md transition-colors",
            day_selected: "bg-transparent ring-2 ring-offset-2 ring-offset-background ring-primary/70 text-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
          }}
          modifiers={{
            aulaAoVivo: aulasAoVivo,
            qa: qaSessions,
            outro: outrosEventos,
          }}
          modifiersClassNames={{
            aulaAoVivo: "border-2 border-primary font-semibold text-foreground",
            qa: "border-2 border-blue-500 font-semibold text-foreground",
            outro: "border-2 border-muted-foreground font-semibold text-foreground",
          }}
        />
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {aulasDoDia.map((aula) => {
              const tipo = aula.tipo_evento || 'aula_ao_vivo';
              const config = tipoEventoConfig[tipo as keyof typeof tipoEventoConfig];
              const Icon = config.icon;
              
              return (
                <div 
                  key={aula.id} 
                  className={cn(
                    "p-4 rounded-lg border-l-4",
                    config.borderColor,
                    "bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-white", config.color)}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        {aula.horario && (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {aula.horario}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground">{aula.tema}</h4>
                      {aula.descricao && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{aula.descricao}</p>
                      )}
                      {aula.link_reuniao && (
                        <a 
                          href={aula.link_reuniao.startsWith('http') ? aula.link_reuniao : `https://${aula.link_reuniao}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                        >
                          <Video className="h-4 w-4" />
                          Acessar Reunião
                        </a>
                      )}
                    </div>
                    {!aula.ativo && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
