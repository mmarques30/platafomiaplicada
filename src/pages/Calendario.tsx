import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioVisaoCalendario } from "@/components/calendario/CalendarioVisaoCalendario";
import { CalendarioVisaoTabela } from "@/components/calendario/CalendarioVisaoTabela";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, History, Clock, Video, HelpCircle, CheckCircle, Youtube } from "lucide-react";
import { useProximaAula } from "@/hooks/useCalendarioAulas";
import { format, isSameDay } from "date-fns";

// Helper function to parse date string as local date (avoiding timezone issues)
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/shared/PageTitle";

const tipoEventoConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  aula_ao_vivo: { label: "Aula ao Vivo", icon: Video, color: "text-primary" },
  qa: { label: "Q&A", icon: HelpCircle, color: "text-blue-500" },
  live_youtube: { label: "Live YouTube", icon: Youtube, color: "text-red-500" },
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
  const dataAula = proximaAula.data_aula ? parseLocalDate(proximaAula.data_aula) : null;
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
          <PageTitle primary="Calendário" secondary="de Aulas" />
          <p className="text-muted-foreground mt-2">
            Confira as próximas aulas semanais e seus temas
          </p>
        </div>

        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
            <TabsTrigger 
              value="calendario" 
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Calendário</span>
              <span className="sm:hidden">Agenda</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tabela" 
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Histórico</span>
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
