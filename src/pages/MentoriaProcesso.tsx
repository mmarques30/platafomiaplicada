import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProcessoRoadmap } from "@/components/admin/mentoria/ProcessoRoadmap";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MentoriaProcesso() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/mentoria")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Mentoria
        </Button>

        <div className="space-y-2">
          <PageTitle primary="Meu Processo" secondary="de Mentoria" />
          <p className="text-muted-foreground">
            Acompanhe sua evolução fase a fase no processo de mentoria
          </p>
        </div>
      </div>

      <ProcessoRoadmap userId={user.id} readonly />
    </div>
  );
}
