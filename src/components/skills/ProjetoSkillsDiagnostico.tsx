import { useState, useEffect } from "react";
import DiagnosticoForm from "./diagnostico/DiagnosticoForm";
import DiagnosticoProcessing from "./diagnostico/DiagnosticoProcessing";
import DiagnosticoResults from "./diagnostico/DiagnosticoResults";
import { useSkillsDiagnostico } from "@/hooks/useSkillsDiagnostico";
import { Loader2 } from "lucide-react";

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

  // Determinar estado inicial: mostra results (com mocks ou dados reais)
  const [state, setState] = useState<DiagnosticoState>("results");

  // Atualizar estado quando diagnostico carregar do banco
  useEffect(() => {
    if (!isLoading) {
      if (diagnostico?.completado && hasInsight) {
        setState("results");
      }
    }
  }, [isLoading, diagnostico, hasInsight]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
