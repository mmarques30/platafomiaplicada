import { useSearchParams } from "react-router-dom";
import { VideosVisitante } from "@/components/dashboard/VideosVisitante";
import { MateriaisGratuitosTab } from "@/components/comunidade/MateriaisGratuitosTab";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";

export default function VideosBonus() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'aula';

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        {/* Header */}
        <section>
          <PageTitle primary="Sala" secondary="de Aula" icon={<GraduationCap className="h-7 w-7 text-primary" />} />
        </section>

        {/* Tabs */}
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 mb-6">
            <TabsTrigger 
              value="aula"
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              Aula
            </TabsTrigger>
            <TabsTrigger 
              value="materiais"
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              Materiais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aula" className="mt-0 min-h-[calc(100vh-250px)]">
            <VideosVisitante />
          </TabsContent>
          <TabsContent value="materiais" className="mt-0 min-h-[calc(100vh-250px)]">
            <MateriaisGratuitosTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
