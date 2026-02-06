import { useState } from "react";
import DiagnosticoForm from "./diagnostico/DiagnosticoForm";
import DiagnosticoProcessing from "./diagnostico/DiagnosticoProcessing";
import DiagnosticoResults from "./diagnostico/DiagnosticoResults";

type DiagnosticoState = "form" | "processing" | "results";

export default function ProjetoSkillsDiagnostico() {
  // Start with results (mock data) to show populated dashboard
  const [state, setState] = useState<DiagnosticoState>("results");

  const handleSubmit = () => {
    setState("processing");
    setTimeout(() => {
      setState("results");
    }, 3000);
  };

  const handleResetForm = () => {
    setState("form");
  };

  if (state === "processing") {
    return <DiagnosticoProcessing />;
  }

  if (state === "results") {
    return <DiagnosticoResults onRefill={handleResetForm} />;
  }

  return <DiagnosticoForm onSubmit={handleSubmit} />;
}
