import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import ProjetoSkillsKanban from "@/components/skills/ProjetoSkillsKanban";

export default function ProjetoSkillsProjetosPage() {
  const navigate = useNavigate();
  const { equipeId, isLoading } = useSkillsMembro();

  useEffect(() => {
    if (!isLoading && !equipeId) {
      navigate("/skills/projeto", { replace: true });
    }
  }, [isLoading, equipeId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!equipeId) return null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle primary="Projeto" secondary="Skills" />
      <ProjetoSkillsKanban />
    </div>
  );
}
