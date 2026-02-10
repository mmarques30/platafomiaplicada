import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

import logoSimbol from "@/assets/logo-aplicada-simbolo.png";

interface StepLabel {
  id: number;
  titulo: string;
}

interface FormularioLayoutProps {
  /** Título principal do formulário */
  titulo: string;
  /** Subtítulo com destaque colorido */
  subtitulo?: string;
  /** Descrição adicional */
  descricao?: string;
  /** Step atual (0-indexed) */
  currentStep: number;
  /** Total de steps */
  totalSteps: number;
  /** Labels para cada step */
  stepLabels?: StepLabel[];
  /** Exibir indicador de salvamento */
  isSaving?: boolean;
  /** Se o rascunho foi salvo */
  draftSaved?: boolean;
  /** Função para voltar ao step anterior */
  onPrev?: () => void;
  /** Função para avançar ao próximo step */
  onNext?: () => void;
  /** Função para cancelar/voltar */
  onCancel?: () => void;
  /** Está no modo business/premium */
  isPremium?: boolean;
  /** Badge label para premium */
  premiumLabel?: string;
  /** Conteúdo do step atual */
  children: ReactNode;
  /** Exibir header com logo */
  showHeader?: boolean;
  /** Exibir navegação padrão */
  showNavigation?: boolean;
}

export function FormularioLayout({
  titulo,
  subtitulo,
  descricao,
  currentStep,
  totalSteps,
  stepLabels = [],
  isSaving = false,
  draftSaved = false,
  onPrev,
  onNext,
  onCancel,
  isPremium = false,
  premiumLabel = "Premium",
  children,
  showHeader = true,
  showNavigation = false,
}: FormularioLayoutProps) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 relative overflow-hidden">
      {/* Botão Voltar Global */}
      {onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="absolute top-4 left-4 z-20 text-foreground hover:bg-muted"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Voltar
        </Button>
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        {showHeader && (
          <div className="text-center mb-8">
            <img 
              src={logoSimbol} 
              alt="IAplicada" 
              className="h-14 md:h-16 mx-auto mb-4" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {titulo} {subtitulo && <span className="text-primary">{subtitulo}</span>}
            </h1>
            {descricao && (
              <p className="text-muted-foreground">{descricao}</p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Etapa {currentStep + 1} de {totalSteps}</span>
            <div className="flex items-center gap-2">
              {(draftSaved || isSaving) && (
                <span className="flex items-center gap-1 text-xs text-primary animate-in fade-in duration-300">
                  <Save className="h-3 w-3" />
                  {isSaving ? "Salvando..." : "Rascunho salvo"}
                </span>
              )}
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
          
          {/* Step Labels */}
          {stepLabels.length > 0 && (
            <div className="hidden md:flex justify-between mb-3 px-1">
              {stepLabels.map((step, idx) => (
                <span 
                  key={step.id}
                  className={cn(
                    "text-xs transition-colors",
                    idx <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.titulo}
                </span>
              ))}
            </div>
          )}
          
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Card Principal */}
        <Card className={cn(
          "bg-card/95 backdrop-blur-sm border border-primary/20 shadow-lg relative overflow-hidden",
          isPremium && "bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 border-purple-500/30"
        )}>
          {/* Premium Badge */}
          {isPremium && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full flex items-center gap-1.5 shadow-lg shadow-purple-500/25">
                <Crown className="h-3.5 w-3.5" />
                {premiumLabel}
              </span>
            </div>
          )}

          <CardContent className="pt-6 pb-6 px-4 md:px-8">
            {children}
          </CardContent>
        </Card>

        {/* Navegação Padrão (opcional) */}
        {showNavigation && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              onClick={onNext}
              disabled={currentStep >= totalSteps - 1}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
