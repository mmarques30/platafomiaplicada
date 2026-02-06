import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import SkillsPainelLider from "./SkillsPainelLider";
import { Loader2 } from "lucide-react";

export default function SkillsMeuProgresso() {
  const navigate = useNavigate();
  const { isLider, isLoading } = useSkillsMembro();

  // Redirecionar não-líderes para /skills/equipe
  useEffect(() => {
    if (!isLoading && !isLider) {
      navigate("/skills/equipe", { replace: true });
    }
  }, [isLoading, isLider, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não é líder, não renderiza (redirect vai acontecer)
  if (!isLider) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        <SkillsPainelLider />
      </div>
    </div>
  );
}
