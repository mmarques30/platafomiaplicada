import { useAuth } from "@/hooks/useAuth";
import { MentoriaHeroDashboard } from "@/components/mentoria/MentoriaHeroDashboard";
import { StatusDiagnostico } from "@/components/mentoria/StatusDiagnostico";
import { ProximaSessao } from "@/components/mentoria/ProximaSessao";
import { TarefasUrgentes } from "@/components/mentoria/TarefasUrgentes";
import { NavegacaoRapida } from "@/components/mentoria/NavegacaoRapida";
import { ResumoProgresso } from "@/components/mentoria/ResumoProgresso";
import { PendenciasUrgentes } from "@/components/mentoria/PendenciasUrgentes";
import { FaseAtualCard } from "@/components/mentoria/FaseAtualCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Target, ListTodo } from "lucide-react";

export default function Mentoria() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl">
      {/* Hero Dashboard */}
      <MentoriaHeroDashboard />

      {/* Tabs Padronizados */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 mb-6">
          <TabsTrigger
            value="visao-geral"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="processo"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Meu Processo
          </TabsTrigger>
          <TabsTrigger
            value="acoes"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Ações
          </TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="visao-geral" className="mt-0 space-y-6">
          {/* Alertas/Pendências */}
          <PendenciasUrgentes />

          {/* Grid 2x2 com Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <StatusDiagnostico />
            <ProximaSessao />
            <TarefasUrgentes />
            <NavegacaoRapida />
          </div>
        </TabsContent>

        {/* Aba Meu Processo */}
        <TabsContent value="processo" className="mt-0 space-y-6">
          {/* Fase Atual em Destaque */}
          <FaseAtualCard />

          {/* Resumo de Progresso */}
          <ResumoProgresso />
        </TabsContent>

        {/* Aba Ações */}
        <TabsContent value="acoes" className="mt-0 space-y-6">
          {/* Pendências Urgentes */}
          <PendenciasUrgentes />

          {/* Grid com Tarefas e Sessões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <TarefasUrgentes />
            <ProximaSessao />
          </div>

          {/* Navegação Rápida */}
          <NavegacaoRapida />
        </TabsContent>
      </Tabs>
    </div>
  );
}
