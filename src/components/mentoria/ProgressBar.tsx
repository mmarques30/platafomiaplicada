import { cn } from "@/lib/utils";

interface StepLabel {
  id: number;
  titulo: string;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps?: StepLabel[];
  isBusiness?: boolean;
}

const defaultSteps: StepLabel[] = [
  { id: 1, titulo: "Perfil" },
  { id: 2, titulo: "IA" },
  { id: 3, titulo: "Objetivos" },
  { id: 4, titulo: "Cenário" },
  { id: 5, titulo: "Aprendizagem" },
  { id: 6, titulo: "Motivação" },
  { id: 7, titulo: "Expectativas" },
];

export function ProgressBar({ currentStep, totalSteps, steps, isBusiness = false }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const stepLabels = steps || defaultSteps.slice(0, totalSteps);

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-4">
        {stepLabels.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center transition-all duration-300",
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-1 transition-all duration-300",
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {step.id}
            </div>
            <div className="text-xs text-center hidden sm:block">{step.titulo}</div>
          </div>
        ))}
      </div>
      
      <div className="relative h-2 rounded-full overflow-hidden bg-secondary">
        <div
          className="h-full transition-all duration-500 ease-out bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
