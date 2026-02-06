import { Briefcase } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import ProjetoSkillsPerformance from "@/components/skills/ProjetoSkillsPerformance";
import ProjetoSkillsDiagnostico from "@/components/skills/ProjetoSkillsDiagnostico";

export default function ProjetoSkills() {
  const { isAdmin } = useUserRole();
  const { isLider } = useSkillsMembro();

  const canSeePerformance = isAdmin || isLider;

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        primary="Projeto"
        secondary="Skills"
        icon={<Briefcase className="h-7 w-7 text-[hsl(72,50%,35%)]" />}
      />

      {canSeePerformance ? (
        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <VisaoGeralPlaceholder />
          </TabsContent>

          <TabsContent value="performance">
            <ProjetoSkillsPerformance />
          </TabsContent>

          <TabsContent value="diagnostico">
            <ProjetoSkillsDiagnostico />
          </TabsContent>
        </Tabs>
      ) : (
        <VisaoGeralPlaceholder />
      )}
    </div>
  );
}

function VisaoGeralPlaceholder() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <p className="text-muted-foreground">
        Em breve: acompanhe o projeto Skills da sua equipe
      </p>
    </div>
  );
}
