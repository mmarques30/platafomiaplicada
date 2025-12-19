import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioVisaoCalendario } from "@/components/calendario/CalendarioVisaoCalendario";
import { CalendarioVisaoTabela } from "@/components/calendario/CalendarioVisaoTabela";
import { Calendar, History } from "lucide-react";

export default function Calendario() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-4 md:py-6 px-4 md:px-6 space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendário de Aulas</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
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
          </TabsContent>
          
          <TabsContent value="tabela" className="mt-6">
            <CalendarioVisaoTabela />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
