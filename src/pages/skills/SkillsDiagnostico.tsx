import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, ClipboardList } from "lucide-react";
import { useSkillsDiagnostico } from "@/hooks/useSkillsDiagnostico";
import { SkillsDiagnosticoStep1 } from "@/components/skills/diagnostico/SkillsDiagnosticoStep1";
import { SkillsDiagnosticoStep2 } from "@/components/skills/diagnostico/SkillsDiagnosticoStep2";
import { SkillsDiagnosticoStep3 } from "@/components/skills/diagnostico/SkillsDiagnosticoStep3";
import { SkillsDiagnosticoStep4 } from "@/components/skills/diagnostico/SkillsDiagnosticoStep4";

const STEPS = [
  { id: 1, title: "Seu Contexto", description: "Informações sobre você e sua atuação" },
  { id: 2, title: "Tarefas Manuais", description: "O que você faz no dia a dia" },
  { id: 3, title: "Gargalos", description: "Onde você perde mais tempo" },
  { id: 4, title: "Potencial IA", description: "Oportunidades de automação" },
];

export default function SkillsDiagnostico() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { diagnostico, isLoading, updateDiagnostico, saveDiagnostico, isSaving } = useSkillsDiagnostico();

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    await saveDiagnostico();
    navigate("/skills/equipe");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Diagnóstico Skills</h1>
          <p className="text-muted-foreground">
            Mapeie suas tarefas e identifique oportunidades de automação
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Etapa {currentStep} de {STEPS.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id === currentStep
                      ? "text-primary"
                      : step.id < currentStep
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <SkillsDiagnosticoStep1 
              data={diagnostico} 
              onChange={updateDiagnostico} 
            />
          )}
          {currentStep === 2 && (
            <SkillsDiagnosticoStep2 
              data={diagnostico} 
              onChange={updateDiagnostico} 
            />
          )}
          {currentStep === 3 && (
            <SkillsDiagnosticoStep3 
              data={diagnostico} 
              onChange={updateDiagnostico} 
            />
          )}
          {currentStep === 4 && (
            <SkillsDiagnosticoStep4 
              data={diagnostico} 
              onChange={updateDiagnostico} 
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        {currentStep < STEPS.length ? (
          <Button onClick={handleNext}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Concluir Diagnóstico"}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
