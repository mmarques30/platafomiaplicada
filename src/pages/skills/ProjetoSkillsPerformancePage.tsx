
import { PageTitle } from "@/components/shared/PageTitle";
import SkillsAdminGuard from "@/components/skills/SkillsAdminGuard";
import ProjetoSkillsPerformance from "@/components/skills/ProjetoSkillsPerformance";

export default function ProjetoSkillsPerformancePage() {
  return (
    <SkillsAdminGuard>
      <div className="p-6 space-y-6">
        <PageTitle
          primary="Projeto"
          secondary="Skills"
        />
        <ProjetoSkillsPerformance />
      </div>
    </SkillsAdminGuard>
  );
}
