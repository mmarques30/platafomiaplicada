import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { formSchema, type FormData } from "./schema";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserPlan } from "@/hooks/useUserPlan";
import { ProgressBar } from "./ProgressBar";
import { Step1InformacoesPessoais } from "./Step1InformacoesPessoais";
import { Step2ExperienciaIA } from "./Step2ExperienciaIA";
import { Step3Objetivos } from "./Step3Objetivos";
import { Step4CenarioAtual } from "./Step4CenarioAtual";
import { Step5EstiloAprendizagem } from "./Step5EstiloAprendizagem";
import { Step6Motivacao } from "./Step6Motivacao";
import { Step7Expectativas } from "./Step7Expectativas";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FormularioWizardProps {
  onCancelar?: () => void;
  onFinalizado?: () => void;
}

export function FormularioWizard({ onCancelar, onFinalizado }: FormularioWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { formulario, finalizarFormulario, isSaving } = useMentoriaForm();
  const { plan } = useUserPlan();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formulario ? {
      ...formulario,
      ferramentas_ia: Array.isArray(formulario.ferramentas_ia) ? formulario.ferramentas_ia as string[] : [],
      quick_wins: Array.isArray(formulario.quick_wins) ? formulario.quick_wins as string[] : [],
    } : {
      ferramentas_ia: [],
      quick_wins: [],
      nivel_comprometimento: 5,
    },
  });

  const totalSteps = 7;

  const nextStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await form.trigger(fields);
    
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Finalizar formulário
      await finalizarFormulario(data);
      
      // Mostrar toast informando sobre geração de insight
      toast({
        title: "Gerando sua análise personalizada...",
        description: "Aguarde alguns segundos enquanto a IA analisa seu perfil"
      });

      // Auto-gerar insight após finalização
      if (formulario?.id) {
        const { error } = await supabase.functions.invoke('gerar-insight-mentoria', {
          body: { formulario_id: formulario.id }
        });

        if (error) {
          console.error("Erro ao gerar insight:", error);
          toast({
            title: "Formulário salvo!",
            description: "Você pode gerar o insight posteriormente na página de mentoria.",
            variant: "default"
          });
        }
      }

      // Callback ou navegação
      if (onFinalizado) {
        onFinalizado();
      } else {
        const destino = plan === 'academy' ? '/evolucao' : '/mentoria';
        setTimeout(() => {
          navigate(destino);
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao finalizar formulário:", error);
    }
  };

  const getStepFields = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ["nome_completo", "idade", "profissao", "area_atuacao", "tempo_experiencia", "tamanho_empresa"];
      case 1:
        return ["nivel_ia", "frequencia_uso_ia"];
      case 2:
        return ["objetivo_principal", "area_aplicacao_ia", "meta_3_meses", "meta_12_meses"];
      case 3:
        return ["desafio_1", "desafio_2", "desafio_3", "tempo_disponivel", "maior_ladrao_tempo", "nivel_autonomia"];
      case 4:
        return ["estilo_aprendizagem", "preferencia_aprendizado", "melhor_horario", "tipo_feedback"];
      case 5:
        return ["motivacao_mentoria", "nivel_comprometimento", "zona_conforto"];
      case 6:
        return ["tipo_suporte", "frequencia_feedback", "preferencia_sessoes"];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        {onCancelar && (
          <div className="flex justify-end mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancelar}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
        
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {currentStep === 0 && <Step1InformacoesPessoais form={form} onNext={nextStep} />}
            {currentStep === 1 && <Step2ExperienciaIA form={form} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 2 && <Step3Objetivos form={form} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 3 && <Step4CenarioAtual form={form} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 4 && <Step5EstiloAprendizagem form={form} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 5 && <Step6Motivacao form={form} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 6 && (
              <Step7Expectativas
                form={form}
                onPrev={prevStep}
                onSubmit={form.handleSubmit(onSubmit)}
                isSubmitting={isSaving}
              />
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
