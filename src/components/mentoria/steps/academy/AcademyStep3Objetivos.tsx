import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";
import type { AcademyFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<AcademyFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const objetivoOptions = [
  { value: "produtividade-pessoal", label: "Aumentar minha produtividade pessoal" },
  { value: "destacar-carreira", label: "Me destacar na carreira usando IA" },
  { value: "automatizar-tarefas", label: "Automatizar tarefas repetitivas do meu dia" },
  { value: "criar-conteudo", label: "Criar conteúdo de qualidade mais rápido" },
  { value: "entender-ia-profundo", label: "Entender IA profundamente para tomar decisões" },
  { value: "aplicar-negocio", label: "Aplicar IA no meu negócio/empresa" },
  { value: "capacitar-equipe", label: "Aprender para capacitar minha equipe depois" },
];

export function AcademyStep3Objetivos({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seus Objetivos</h3>
          <p className="text-sm text-muted-foreground">O que você quer alcançar com o Academy</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="objetivo_principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu objetivo principal? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {objetivoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`obj-${opt.value}`} />
                    <label htmlFor={`obj-${opt.value}`} className="text-sm cursor-pointer flex-1">
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
        name="area_aplicacao_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Em que área/atividade você mais quer aplicar IA? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Escrever e-mails, criar apresentações, analisar planilhas..."
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
        name="resultado_esperado_30_dias"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que seria uma vitória nos primeiros 30 dias? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva um resultado concreto que te deixaria satisfeito..."
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
        name="como_medir_sucesso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você vai saber que o Academy valeu a pena? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva como você vai medir o sucesso da sua jornada..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
