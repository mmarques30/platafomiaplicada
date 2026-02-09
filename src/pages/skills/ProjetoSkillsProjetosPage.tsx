import { PageTitle } from "@/components/shared/PageTitle";
import SkillsAdminGuard from "@/components/skills/SkillsAdminGuard";
import ProjetoSkillsKanban from "@/components/skills/ProjetoSkillsKanban";

export default function ProjetoSkillsProjetosPage() {
  return (
    <SkillsAdminGuard>
      <div className="space-y-6 p-4 md:p-6">
        <PageTitle primary="Projeto" secondary="Skills" />
        <ProjetoSkillsKanban />
      </div>
    </SkillsAdminGuard>
  );
}
