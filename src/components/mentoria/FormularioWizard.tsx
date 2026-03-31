import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { 
  formSchema, academyFormSchema, businessFormSchema,
  type FormData, type AcademyFormData, type BusinessFormData 
} from "./schema";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { ProgressBar } from "./ProgressBar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, Save, Crown, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightIA } from "./InsightIA";

// Academy Steps
import { AcademyStep1Perfil } from "./steps/academy/AcademyStep1Perfil";
import { AcademyStep2Experiencia } from "./steps/academy/AcademyStep2Experiencia";
import { AcademyStep3Objetivos } from "./steps/academy/AcademyStep3Objetivos";
import { AcademyStep4Desafios } from "./steps/academy/AcademyStep4Desafios";
import { AcademyStep5Comprometimento } from "./steps/academy/AcademyStep5Comprometimento";

// Business Steps
import { BusinessStep1Perfil } from "./steps/business/BusinessStep1Perfil";
import { BusinessStep2Construir } from "./steps/business/BusinessStep2Construir";
import { BusinessStep3Contexto } from "./steps/business/BusinessStep3Contexto";
import { BusinessStep4Acompanhamento } from "./steps/business/BusinessStep4Acompanhamento";
import { BusinessStep5Aprendizado } from "./steps/business/BusinessStep5Aprendizado";
import { BusinessStep6Expectativas } from "./steps/business/BusinessStep6Expectativas";

const STEP_KEY = "diagnostico_current_step";

const academyStepLabels = [
  { id: 1, titulo: "Perfil" },
  { id: 2, titulo: "IA" },
  { id: 3, titulo: "Objetivos" },
  { id: 4, titulo: "Desafios" },
  { id: 5, titulo: "Pronto!" },
];

const businessStepLabels = [
  { id: 1, titulo: "Perfil" },
  { id: 2, titulo: "Solução" },
  { id: 3, titulo: "Impacto" },
  { id: 4, titulo: "Decisão" },
  { id: 5, titulo: "Expansão" },
  { id: 6, titulo: "Sucesso" },
];

interface FormularioWizardProps {
  onCancelar?: () => void;
  onFinalizado?: () => void;
}

export function FormularioWizard({ onCancelar, onFinalizado }: FormularioWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [insightReady, setInsightReady] = useState(false);
  const { formulario, finalizarFormulario, salvarRascunho, isSaving, refetch } = useMentoriaForm();
  const { isAdmin } = useUserRole();
  const { effectivePlan, isBusiness } = useEffectivePlan(isAdmin);
  const navigate = useNavigate();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = isBusiness ? 6 : 5;
  const stepLabels = isBusiness ? businessStepLabels : academyStepLabels;

  // Use appropriate schema based on plan
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

  // Restore step from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem(STEP_KEY);
    if (savedStep && formulario) {
      const stepNum = parseInt(savedStep);
      if (stepNum >= 0 && stepNum < totalSteps) {
        setCurrentStep(stepNum);
        toast({
          title: "Rascunho restaurado",
          description: "Continuando de onde você parou",
        });
      }
    }
  }, [formulario, totalSteps]);

  // Auto-save draft on form changes (debounced)
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await salvarRascunho(data as FormData);
          localStorage.setItem(STEP_KEY, String(currentStep));
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 2000);
        } catch (error) {
          console.error("Erro ao salvar rascunho:", error);
        }
      }, 2000);
    });
    
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form.watch, currentStep, salvarRascunho]);

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
      await finalizarFormulario(data);
      localStorage.removeItem(STEP_KEY);
      setSubmitted(true);

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
          // Navigate away since insight failed
          const destino = effectivePlan === 'academy' ? '/evolucao' : '/mentoria';
          setTimeout(() => navigate(destino), 1500);
          return;
        }

        await refetch();
        setInsightReady(true);
      } else {
        if (onFinalizado) {
          onFinalizado();
        } else {
          const destino = effectivePlan === 'academy' ? '/evolucao' : '/mentoria';
          navigate(destino);
        }
      }
    } catch (error) {
      console.error("Erro ao finalizar formulário:", error);
    }
  };

  const getStepFields = (step: number): (keyof FormData)[] => {
    if (isBusiness) {
      switch (step) {
        case 0: return ["tamanho_empresa"] as (keyof FormData)[]; // nome_completo preenchido automaticamente
        case 1: return [] as (keyof FormData)[];
        case 2: return [] as (keyof FormData)[];
        case 3: return [] as (keyof FormData)[];
        case 4: return [] as (keyof FormData)[];
        case 5: return [] as (keyof FormData)[];
        default: return [];
      }
    }
    
    // Academy steps
    switch (step) {
      case 0: return ["nome_completo", "idade", "profissao", "area_atuacao", "tempo_experiencia"];
      case 1: return ["nivel_ia", "frequencia_uso_ia"];
      case 2: return ["objetivo_principal", "area_aplicacao_ia", "meta_3_meses"];
      case 3: return ["desafio_1", "desafio_2", "desafio_3", "tempo_disponivel", "maior_ladrao_tempo"];
      case 4: return ["estilo_aprendizagem", "preferencia_aprendizado", "nivel_comprometimento"];
      default: return [];
    }
  };

  // Render Academy Steps
  const renderAcademyStep = () => {
    const academyForm = form as unknown as ReturnType<typeof useForm<AcademyFormData>>;
    
    switch (currentStep) {
      case 0: return <AcademyStep1Perfil form={academyForm} onNext={nextStep} />;
      case 1: return <AcademyStep2Experiencia form={academyForm} onNext={nextStep} onPrev={prevStep} />;
      case 2: return <AcademyStep3Objetivos form={academyForm} onNext={nextStep} onPrev={prevStep} />;
      case 3: return <AcademyStep4Desafios form={academyForm} onNext={nextStep} onPrev={prevStep} />;
      case 4: return <AcademyStep5Comprometimento form={academyForm} onPrev={prevStep} onSubmit={form.handleSubmit(onSubmit)} isSubmitting={isSaving} />;
      default: return null;
    }
  };

  // Render Business Steps
  const renderBusinessStep = () => {
    const businessForm = form as unknown as ReturnType<typeof useForm<BusinessFormData>>;
    
    switch (currentStep) {
      case 0: return <BusinessStep1Perfil form={businessForm} onNext={nextStep} />;
      case 1: return <BusinessStep2Construir form={businessForm} onNext={nextStep} onPrev={prevStep} />;
      case 2: return <BusinessStep3Contexto form={businessForm} onNext={nextStep} onPrev={prevStep} />;
      case 3: return <BusinessStep4Acompanhamento form={businessForm} onNext={nextStep} onPrev={prevStep} />;
      case 4: return <BusinessStep5Aprendizado form={businessForm} onNext={nextStep} onPrev={prevStep} />;
      case 5: return <BusinessStep6Expectativas form={businessForm} onPrev={prevStep} onSubmit={form.handleSubmit(onSubmit)} isSubmitting={isSaving} />;
      default: return null;
    }
  };

  return (
    <Card className={cn(
      "w-full max-w-4xl mx-auto relative overflow-hidden",
      isBusiness && "bg-zinc-900 border-zinc-700"
    )}>
      <CardContent className={cn("pt-6", isBusiness && "text-white")}>
        <div className="flex justify-between items-center mb-4">
          {/* Business Premium Badge */}
          {isBusiness && (
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              Business
            </span>
          )}
          {!isBusiness && <div />}
          
          {onCancelar && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancelar}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
            steps={stepLabels}
            isBusiness={isBusiness}
          />
          {draftSaved && (
            <span className="flex items-center gap-1 text-xs text-primary animate-in fade-in duration-300">
              <Save className="h-3 w-3" />
              Rascunho salvo
            </span>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isBusiness ? renderBusinessStep() : renderAcademyStep()}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
