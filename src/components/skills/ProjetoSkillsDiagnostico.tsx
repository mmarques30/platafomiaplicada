import { useState } from "react";
import DiagnosticoForm from "./diagnostico/DiagnosticoForm";
import DiagnosticoProcessing from "./diagnostico/DiagnosticoProcessing";
import DiagnosticoResults from "./diagnostico/DiagnosticoResults";
import { useSkillsDiagnostico } from "@/hooks/useSkillsDiagnostico";
import { Loader2 } from "lucide-react";

export default function ProjetoSkillsDiagnostico() {
  const {
    diagnostico,
    versoes,
    versaoSelecionada,
    criandoNovo,
    isLoading,
    isProcessing,
    isSaving,
    saveAndProcess,
    saveRascunho,
    hasInsight,
    iniciarNovoDiagnostico,
    cancelarNovoDiagnostico,
    selecionarVersao,
  } = useSkillsDiagnostico();

  // Estado local apenas para controlar transição submit → processing → results
  const [manualState, setManualState] = useState<"idle" | "processing" | "results">("idle");

  // Estado derivado: prioridade para manualState durante submit flow
  const currentView = criandoNovo
    ? "form"
    : manualState === "processing" || isProcessing
      ? "processing"
      : manualState === "results" || (diagnostico?.completado && hasInsight)
        ? "results"
        : "form";

  const handleSubmit = async (formData: Record<string, any>) => {
    setManualState("processing");
    try {
      await saveAndProcess(formData);
      setManualState("results");
    } catch {
      setManualState("idle");
    }
  };

  const handleResetForm = () => {
    setManualState("idle");
  };

  const handleNovoDiagnostico = () => {
    setManualState("idle");
    iniciarNovoDiagnostico();
  };

  const handleCancelarNovo = () => {
    cancelarNovoDiagnostico();
    setManualState("results");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (currentView === "processing") {
    return <DiagnosticoProcessing />;
  }

  if (currentView === "results") {
    return (
      <DiagnosticoResults
        onRefill={handleResetForm}
        diagnostico={diagnostico}
        versoes={versoes}
        versaoSelecionada={versaoSelecionada}
        onSelecionarVersao={selecionarVersao}
        onNovoDiagnostico={handleNovoDiagnostico}
      />
    );
  }

  return (
    <DiagnosticoForm
      onSubmit={handleSubmit}
      onSaveRascunho={saveRascunho}
      isSaving={isSaving || isProcessing}
      initialData={criandoNovo ? undefined : diagnostico}
      onCancel={criandoNovo ? handleCancelarNovo : undefined}
    />
  );
}
