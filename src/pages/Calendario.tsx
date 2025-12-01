import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioVisaoCalendario } from "@/components/calendario/CalendarioVisaoCalendario";
import { CalendarioVisaoTabela } from "@/components/calendario/CalendarioVisaoTabela";
import { Calendar, TableIcon } from "lucide-react";

export default function Calendario() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário de Aulas</h1>
          <p className="text-muted-foreground mt-1">
            Confira as próximas aulas semanais e seus temas
          </p>
        </div>
        
        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendario" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="tabela" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Tabela
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
