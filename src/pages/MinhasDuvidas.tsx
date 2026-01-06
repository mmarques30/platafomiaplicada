import { AbaDuvidas } from "@/components/evolucao/AbaDuvidas";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, HelpCircle } from "lucide-react";
import { DuvidasAplicadasTab } from "@/components/evolucao/DuvidasAplicadasTab";

export default function MinhasDuvidas() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle primary="Central de" secondary="Dúvidas" />
      
      <Tabs defaultValue="minhas-duvidas" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
          <TabsTrigger 
            value="minhas-duvidas"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Minhas Dúvidas
          </TabsTrigger>
          <TabsTrigger 
            value="duvidas-aplicadas"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Dúvidas Aplicadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="minhas-duvidas" className="mt-6">
          <AbaDuvidas />
        </TabsContent>

        <TabsContent value="duvidas-aplicadas" className="mt-6">
          <DuvidasAplicadasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
