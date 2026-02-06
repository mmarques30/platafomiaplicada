import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useUserRole } from "@/hooks/useUserRole";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import ProjetoSkillsDiagnostico from "@/components/skills/ProjetoSkillsDiagnostico";

export default function ProjetoSkillsDiagnosticoPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isLider, isLoading: membroLoading } = useSkillsMembro();
  const isLoading = roleLoading || membroLoading;

  useEffect(() => {
    if (!isLoading && !isAdmin && !isLider) {
      navigate("/skills/projeto", { replace: true });
    }
  }, [isLoading, isAdmin, isLider, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin && !isLider) {
    return null;
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
