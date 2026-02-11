import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import ProjetoSkillsKanban from "@/components/skills/ProjetoSkillsKanban";

export default function ProjetoSkillsProjetosPage() {
  const { equipeId, isLoading } = useSkillsMembro();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!equipeId) return <Navigate to="/skills/projeto" replace />;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle primary="Projeto" secondary="Skills" />
      <ProjetoSkillsKanban />
    </div>
  );
}
