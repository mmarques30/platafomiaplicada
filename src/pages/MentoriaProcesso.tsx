import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProcessoRoadmap } from "@/components/admin/mentoria/ProcessoRoadmap";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";

export default function MentoriaProcesso() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <PageContainer>
      <Button
        variant="ghost"
        onClick={() => navigate("/mentoria")}
        className="-ml-2 w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <PageTitle primary="Meu" secondary="processo" eyebrow="Mentoria" />

      <ProcessoRoadmap userId={user.id} isAdmin={false} />
    </PageContainer>
  );
}
