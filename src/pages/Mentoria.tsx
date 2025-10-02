import { useState } from "react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { FormularioWizard } from "@/components/mentoria/FormularioWizard";
import { ResumoDiagnostico } from "@/components/mentoria/ResumoDiagnostico";

export default function Mentoria() {
  const { formulario, isLoading } = useMentoriaForm();
  const [modoEdicao, setModoEdicao] = useState(false);

  const jaPreencheu = formulario?.completado && !modoEdicao;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Aplicada Mentoria IA</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {jaPreencheu
            ? "Confira abaixo o resumo do seu diagnóstico de mentoria"
            : "Complete o formulário diagnóstico para iniciar sua jornada de transformação com IA"}
        </p>
      </div>

      {jaPreencheu ? (
        <ResumoDiagnostico 
          formulario={formulario} 
          onEditar={() => setModoEdicao(true)} 
        />
      ) : (
        <FormularioWizard />
      )}
    </div>
  );
}
