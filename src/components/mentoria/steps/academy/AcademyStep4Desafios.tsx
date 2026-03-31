import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap, TrendingUp, Sparkles } from "lucide-react";
import type { AcademyFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<AcademyFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const tempoOptions = [
  { value: "1-2h", label: "1-2 horas por semana" },
  { value: "3-5h", label: "3-5 horas por semana" },
  { value: "6-10h", label: "6-10 horas por semana" },
  { value: "10h+", label: "Mais de 10 horas por semana" },
];

const trabalhaEmEmpresaOptions = [
  { value: "autonomo", label: "Sou autônomo/freelancer" },
  { value: "empresa-pequena", label: "Trabalho em empresa pequena (até 50 pessoas)" },
  { value: "empresa-media", label: "Trabalho em empresa média (50-500 pessoas)" },
  { value: "empresa-grande", label: "Trabalho em empresa grande (500+ pessoas)" },
  { value: "empreendedor", label: "Tenho meu próprio negócio" },
];

const equipeUsarIaOptions = [
  { value: "nao", label: "Não, é só pra mim" },
  { value: "talvez", label: "Talvez, preciso ver primeiro" },
  { value: "sim-poucos", label: "Sim, algumas pessoas (2-5)" },
  { value: "sim-muitos", label: "Sim, toda a equipe/departamento" },
];

const interesseProjetoOptions = [
  { value: "nao", label: "Não no momento" },
  { value: "talvez-futuro", label: "Talvez no futuro" },
  { value: "sim-curioso", label: "Sim, tenho curiosidade" },
  { value: "sim-urgente", label: "Sim, tenho um projeto específico em mente" },
];

export function AcademyStep4Desafios({ form, onNext, onPrev }: StepProps) {
  const trabalhaEmpresa = form.watch("trabalha_em_empresa");
  const showEquipeQuestion = trabalhaEmpresa && !["autonomo"].includes(trabalhaEmpresa);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Contexto e Potencial</h3>
          <p className="text-sm text-muted-foreground">Entender seu cenário atual</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="maior_desafio_profissional"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu maior desafio profissional hoje? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o desafio que mais te impacta no trabalho..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tempo_disponivel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quanto tempo você tem disponível para aprender? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-2"
              >
                {tempoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`tempo-${opt.value}`} />
                    <label htmlFor={`tempo-${opt.value}`} className="text-sm cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tarefa_repetitiva_automatizar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tem alguma tarefa repetitiva que adoraria automatizar?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva uma tarefa que te consome tempo e poderia ser automatizada..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="trabalha_em_empresa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu contexto de trabalho? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {trabalhaEmEmpresaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`trabalha-${opt.value}`} />
                    <label htmlFor={`trabalha-${opt.value}`} className="text-sm cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showEquipeQuestion && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <TrendingUp className="h-4 w-4" />
            Potencial de Expansão
          </div>

          <FormField
            control={form.control}
            name="equipe_poderia_usar_ia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outras pessoas da sua equipe poderiam se beneficiar de IA?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-2"
                  >
                    {equipeUsarIaOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors bg-background">
                        <RadioGroupItem value={opt.value} id={`equipe-${opt.value}`} />
                        <label htmlFor={`equipe-${opt.value}`} className="text-sm cursor-pointer">
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interesse_projeto_customizado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Você tem interesse em projetos de automação sob medida?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-2"
                  >
                    {interesseProjetoOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors bg-background">
                        <RadioGroupItem value={opt.value} id={`projeto-${opt.value}`} />
                        <label htmlFor={`projeto-${opt.value}`} className="text-sm cursor-pointer">
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Card informativo sobre InsightIA */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Diagnóstico personalizado com IA</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ao finalizar, nossa IA vai gerar um diagnóstico personalizado com seus principais gaps e recomendações de onde começar. Você receberá insights exclusivos baseados no seu perfil.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} className="gap-2">
          Próximo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
