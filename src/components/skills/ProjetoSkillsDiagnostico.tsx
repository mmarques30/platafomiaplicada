import { useState } from "react";
import DiagnosticoForm from "./diagnostico/DiagnosticoForm";
import DiagnosticoProcessing from "./diagnostico/DiagnosticoProcessing";
import DiagnosticoResults from "./diagnostico/DiagnosticoResults";

type DiagnosticoState = "form" | "processing" | "results";

export default function ProjetoSkillsDiagnostico() {
  const [state, setState] = useState<DiagnosticoState>("form");

  const handleSubmit = () => {
    setState("processing");
    // Simula processamento de 3 segundos
    setTimeout(() => {
      setState("results");
    }, 3000);
  };

  if (state === "processing") {
    return <DiagnosticoProcessing />;
  }

  if (state === "results") {
    return <DiagnosticoResults />;
  }

  return <DiagnosticoForm onSubmit={handleSubmit} />;
}
