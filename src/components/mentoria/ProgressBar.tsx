import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, titulo: "Perfil" },
  { id: 2, titulo: "IA" },
  { id: 3, titulo: "Objetivos" },
  { id: 4, titulo: "Cenário" },
  { id: 5, titulo: "Aprendizagem" },
  { id: 6, titulo: "Motivação" },
  { id: 7, titulo: "Expectativas" },
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center ${
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-1 ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {step.id}
            </div>
            <div className="text-xs text-center hidden sm:block">{step.titulo}</div>
          </div>
        ))}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
