import { Briefcase } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useUserRole } from "@/hooks/useUserRole";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import { Navigate } from "react-router-dom";
import ProjetoSkillsDiagnostico from "@/components/skills/ProjetoSkillsDiagnostico";

export default function ProjetoSkillsDiagnosticoPage() {
  const { isAdmin } = useUserRole();
  const { isLider } = useSkillsMembro();

  if (!isAdmin && !isLider) {
    return <Navigate to="/skills/projeto" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        primary="Projeto"
        secondary="Skills"
        icon={<Briefcase className="h-7 w-7 text-[hsl(72,50%,35%)]" />}
      />
      <ProjetoSkillsDiagnostico />
    </div>
  );
}
