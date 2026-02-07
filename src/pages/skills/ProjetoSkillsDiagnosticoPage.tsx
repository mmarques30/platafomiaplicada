import { Briefcase } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import SkillsAdminGuard from "@/components/skills/SkillsAdminGuard";
import ProjetoSkillsDiagnostico from "@/components/skills/ProjetoSkillsDiagnostico";

export default function ProjetoSkillsDiagnosticoPage() {
  return (
    <SkillsAdminGuard>
      <div className="p-6 space-y-6">
        <PageTitle
          primary="Projeto"
          secondary="Skills"
          icon={<Briefcase className="h-7 w-7 text-[hsl(72,50%,35%)]" />}
        />
        <ProjetoSkillsDiagnostico />
      </div>
    </SkillsAdminGuard>
  );
}
