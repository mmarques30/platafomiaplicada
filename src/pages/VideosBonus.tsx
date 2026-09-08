import { useSearchParams } from "react-router-dom";
import { VideosVisitante } from "@/components/dashboard/VideosVisitante";
import { MateriaisGratuitosTab } from "@/components/comunidade/MateriaisGratuitosTab";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";

export default function VideosBonus() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'aula';

  return (
    <PageContainer>
      <PageTitle primary="Sala" secondary="de aula" eyebrow="Aprender" icon={<GraduationCap className="h-7 w-7 text-primary" />} />

        {/* Tabs */}
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:inline-flex md:w-auto mb-6">
            <TabsTrigger 
              value="aula"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              Aula
            </TabsTrigger>
            <TabsTrigger 
              value="materiais"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
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
    </PageContainer>
  );
}
