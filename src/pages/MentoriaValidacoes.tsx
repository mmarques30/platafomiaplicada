import PendenciasValidacao from "@/components/mentoria/business/PendenciasValidacao";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MentoriaValidacoes() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>
      
      <PageTitle primary="Pendências" secondary="de Validação" />
      <p className="text-muted-foreground mb-6">
        Revise e responda às solicitações de validação do seu projeto
      </p>
      
      <PendenciasValidacao />
    </div>
  );
}
