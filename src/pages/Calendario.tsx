import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioVisaoCalendario } from "@/components/calendario/CalendarioVisaoCalendario";
import { CalendarioVisaoTabela } from "@/components/calendario/CalendarioVisaoTabela";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, History, Clock, Video, CheckCircle } from "lucide-react";
import { useProximaAula } from "@/hooks/useCalendarioAulas";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ProximoEncontroCard() {
  const { data: proximaAula, isLoading } = useProximaAula();

  if (isLoading) {
    return (
      <Card className="mt-6 bg-[#0D0D0D] border-white/10">
        <div className="p-4 md:p-6 space-y-4">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <Skeleton className="h-12 w-full bg-white/10" />
          <Skeleton className="h-12 w-full bg-white/10" />
        </div>
      </Card>
    );
  }

  if (!proximaAula) {
    return (
      <Card className="mt-6 bg-[#0D0D0D] border-white/10">
        <div className="p-4 md:p-6 text-center">
          <p className="text-white/60 text-sm">Nenhum encontro agendado no momento.</p>
        </div>
      </Card>
    );
  }

  const hoje = new Date();
  const dataAula = proximaAula.data_aula ? parseISO(proximaAula.data_aula) : null;
  const isHoje = dataAula && isSameDay(dataAula, hoje);

  // Status: "Confirmado" se tem link_reuniao, "Aguardando confirmação" se não
  const status = proximaAula.link_reuniao ? "Confirmado" : "Aguardando confirmação";
  const statusColor = proximaAula.link_reuniao ? "text-primary" : "text-yellow-500";
  const StatusIcon = proximaAula.link_reuniao ? CheckCircle : Clock;

  return (
    <Card className="mt-6 bg-[#0D0D0D] border-white/10">
      <div className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
          Próximo Encontro
        </h3>

        <table className="w-full">
          <tbody className="text-sm">
            <tr className="border-b border-white/10">
              <td className="py-3 text-white/60">Tema</td>
              <td className="py-3 text-white font-medium text-right">
                {proximaAula.tema}
              </td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-3 text-white/60">Data</td>
              <td className="py-3 text-white text-right">
                {dataAula 
                  ? format(dataAula, "dd/MM/yyyy (EEEE)", { locale: ptBR })
                  : "A definir"
                }
              </td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-3 text-white/60">Horário</td>
              <td className="py-3 text-white text-right">
                {proximaAula.horario || "A definir"}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-white/60">Status</td>
              <td className="py-3 text-right">
                <span className={cn("inline-flex items-center gap-2 font-medium", statusColor)}>
                  <StatusIcon className="h-4 w-4" />
                  {status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {proximaAula.link_reuniao && isHoje && (
          <Button className="w-full mt-4" asChild>
            <a href={proximaAula.link_reuniao.startsWith('http') ? proximaAula.link_reuniao : `https://${proximaAula.link_reuniao}`} target="_blank" rel="noopener noreferrer">
              <Video className="mr-2 h-4 w-4" />
              Entrar na Reunião
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function Calendario() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header escuro */}
      <div className="bg-[#0D0D0D] py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Calendário de Aulas
          </h1>
          <p className="text-sm md:text-base text-white/70 mt-2">
            Confira as próximas aulas semanais e seus temas
          </p>
        </div>
      </div>

      <main className="container py-6 md:py-8 px-4 md:px-6 space-y-6">
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
