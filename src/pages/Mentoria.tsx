import { useState } from "react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { FormularioWizard } from "@/components/mentoria/FormularioWizard";
import { ResumoDiagnostico } from "@/components/mentoria/ResumoDiagnostico";
import { HeroMentoria } from "@/components/mentoria/HeroMentoria";
import { InsightIA } from "@/components/mentoria/InsightIA";
import { Loader2 } from "lucide-react";

export default function Mentoria() {
  const { formulario, isLoading, refetch } = useMentoriaForm();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  const naoPreencheu = !formulario?.completado;
  const preenchido = formulario?.completado && !modoEdicao;

  const handleFormularioFinalizado = () => {
    setMostrarFormulario(false);
    setModoEdicao(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Hero Section - quando não preencheu */}
      {naoPreencheu && !mostrarFormulario && (
        <HeroMentoria onIniciar={() => setMostrarFormulario(true)} />
      )}

      {/* Formulário Wizard - quando está preenchendo ou editando */}
      {(mostrarFormulario || modoEdicao) && (
        <FormularioWizard 
          onCancelar={() => {
            setMostrarFormulario(false);
            setModoEdicao(false);
          }}
          onFinalizado={handleFormularioFinalizado}
        />
      )}

      {/* Resumo + Insight - quando já preencheu */}
      {preenchido && (
        <div className="max-w-5xl mx-auto space-y-6">
          <ResumoDiagnostico 
            formulario={formulario} 
            onEditar={() => setModoEdicao(true)}
          />
          <InsightIA 
            formulario={formulario}
            onInsightGerado={refetch}
          />
        </div>
      )}
    </div>
  );
}
