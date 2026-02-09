
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
        />
        <ProjetoSkillsDiagnostico />
      </div>
    </SkillsAdminGuard>
  );
}
