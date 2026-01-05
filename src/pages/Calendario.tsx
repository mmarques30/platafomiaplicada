import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioVisaoCalendario } from "@/components/calendario/CalendarioVisaoCalendario";
import { CalendarioVisaoTabela } from "@/components/calendario/CalendarioVisaoTabela";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, History, Clock, Video, HelpCircle, CheckCircle } from "lucide-react";
import { useProximaAula } from "@/hooks/useCalendarioAulas";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const tipoEventoConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  aula_ao_vivo: { label: "Aula ao Vivo", icon: Video, color: "text-primary" },
  qa: { label: "Q&A", icon: HelpCircle, color: "text-blue-500" },
  outro: { label: "Evento", icon: Calendar, color: "text-orange-500" },
};

function ProximoEncontroCard() {
  const { data: proximaAula, isLoading } = useProximaAula();

  if (isLoading) {
    return (
      <Card className="mt-6">
        <div className="p-4 flex items-center gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20" />
        </div>
      </Card>
    );
  }

  if (!proximaAula) {
    return (
      <Card className="mt-6">
        <div className="p-4 text-center">
          <p className="text-muted-foreground text-sm">Nenhum encontro agendado no momento.</p>
        </div>
      </Card>
    );
  }

  const hoje = new Date();
  const dataAula = proximaAula.data_aula ? parseISO(proximaAula.data_aula) : null;
  const isHoje = dataAula && isSameDay(dataAula, hoje);

  const tipoEvento = proximaAula.tipo_evento || "aula_ao_vivo";
  const config = tipoEventoConfig[tipoEvento] || tipoEventoConfig.outro;
  const TipoIcon = config.icon;

  const status = proximaAula.link_reuniao ? "Confirmado" : "Aguardando";
  const statusColor = proximaAula.link_reuniao ? "text-primary" : "text-yellow-500";
  const StatusIcon = proximaAula.link_reuniao ? CheckCircle : Clock;

  return (
    <Card className="mt-6">
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        {/* Tipo + Data/Hora */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={cn("flex items-center gap-1.5 font-medium", config.color)}>
            <TipoIcon className="h-4 w-4" />
            <span className="text-sm">{config.label}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-foreground">
            {dataAula 
              ? format(dataAula, "dd/MM (EEE)", { locale: ptBR })
              : "A definir"
            }
            {proximaAula.horario && ` ${proximaAula.horario}`}
          </span>
        </div>

        {/* Tema */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{proximaAula.tema}</span>
        </div>

        {/* Status + Botão */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={cn("flex items-center gap-1.5 text-sm font-medium", statusColor)}>
            <StatusIcon className="h-4 w-4" />
            {status}
          </span>
          {proximaAula.link_reuniao && isHoje && (
            <Button size="sm" asChild>
              <a 
                href={proximaAula.link_reuniao.startsWith('http') ? proximaAula.link_reuniao : `https://${proximaAula.link_reuniao}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Entrar
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Calendario() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 md:py-8 px-4 md:px-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendário de Aulas</h1>
          <p className="text-muted-foreground mt-1">
            Confira as próximas aulas semanais e seus temas
          </p>
        </div>

        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendario" className="gap-1 md:gap-2 text-xs md:text-sm">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Calendário</span>
              <span className="sm:hidden">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="tabela" className="gap-1 md:gap-2 text-xs md:text-sm">
              <History className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Histórico de Encontros</span>
              <span className="sm:hidden">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="mt-6">
            <CalendarioVisaoCalendario />
            <ProximoEncontroCard />
          </TabsContent>

          <TabsContent value="tabela" className="mt-6">
            <CalendarioVisaoTabela />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
