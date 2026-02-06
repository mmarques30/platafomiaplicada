import { useState } from "react";
import DiagnosticoForm from "./diagnostico/DiagnosticoForm";
import DiagnosticoProcessing from "./diagnostico/DiagnosticoProcessing";
import DiagnosticoResults from "./diagnostico/DiagnosticoResults";
import { useSkillsDiagnostico } from "@/hooks/useSkillsDiagnostico";

type DiagnosticoState = "form" | "processing" | "results";

export default function ProjetoSkillsDiagnostico() {
  const {
    diagnostico,
    isLoading,
    isProcessing,
    isSaving,
    saveAndProcess,
    hasInsight,
  } = useSkillsDiagnostico();

  // Determinar estado inicial: se já tem insight, mostra resultados
  const [state, setState] = useState<DiagnosticoState>(
    diagnostico?.completado && hasInsight ? "results" : "results" // default results com mocks
  );

  // Atualizar estado quando diagnostico carregar do banco
  useState(() => {
    if (diagnostico?.completado && hasInsight) {
      setState("results");
    }
  });

  const handleSubmit = async (formData: Record<string, any>) => {
    setState("processing");
    try {
      await saveAndProcess(formData);
      setState("results");
    } catch {
      setState("form");
    }
  };

  const handleResetForm = () => {
    setState("form");
  };

  if (state === "processing" || isProcessing) {
    return <DiagnosticoProcessing />;
  }

  if (state === "results") {
    return (
      <DiagnosticoResults
        onRefill={handleResetForm}
        diagnostico={diagnostico}
      />
    );
  }

  return (
    <DiagnosticoForm
      onSubmit={handleSubmit}
      isSaving={isSaving || isProcessing}
    />
  );
}
