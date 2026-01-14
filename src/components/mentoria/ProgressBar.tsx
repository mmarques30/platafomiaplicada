import { Progress } from "@/components/ui/progress";
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
              index <= currentStep 
                ? isBusiness ? "text-purple-400" : "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-1 transition-all duration-300",
                index <= currentStep
                  ? isBusiness 
                    ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25" 
                    : "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
                index === currentStep && isBusiness && "ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900"
              )}
            >
              {step.id}
            </div>
            <div className="text-xs text-center hidden sm:block">{step.titulo}</div>
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className={cn(
        "relative h-2 rounded-full overflow-hidden",
        isBusiness ? "bg-purple-950/50" : "bg-secondary"
      )}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            isBusiness 
              ? "bg-gradient-to-r from-purple-500 to-violet-500" 
              : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
        
        {/* Shimmer effect for Business */}
        {isBusiness && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{ 
              width: `${progress}%`,
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
