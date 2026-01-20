import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MessageSquare } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const acompanhamentoOptions = [
  { value: "reunioes-semanais", label: "Reuniões semanais de alinhamento" },
  { value: "assincrono", label: "Atualizações assíncronas (mensagens/e-mail)" },
  { value: "reports", label: "Reports periódicos com status" },
  { value: "minimo", label: "Mínimo possível - só me avise quando estiver pronto" },
];

const envolvimentoOptions = [
  { value: "hands-on", label: "Hands-on - quero participar de perto" },
  { value: "validacoes", label: "Validações - só preciso aprovar etapas" },
  { value: "delegar", label: "Delegar totalmente - confio no processo" },
];

const comunicacaoOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "calls", label: "Calls/Reuniões" },
  { value: "plataforma", label: "Plataforma/Chat interno" },
];

export function BusinessStep4Acompanhamento({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Acompanhamento do Projeto</h3>
          <p className="text-sm text-muted-foreground">Como você prefere acompanhar a entrega</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="preferencia_acompanhamento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como prefere acompanhar o desenvolvimento? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {acompanhamentoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`acomp-${opt.value}`} />
                    <label htmlFor={`acomp-${opt.value}`} className="text-sm cursor-pointer">
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
        name="nivel_envolvimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu nível de envolvimento desejado? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {envolvimentoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`env-${opt.value}`} />
                    <label htmlFor={`env-${opt.value}`} className="text-sm cursor-pointer">
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
        name="outros_decisores"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quem mais precisa estar envolvido nas decisões?</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Meu sócio, diretor de TI, ninguém mais..." 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferencia_comunicacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferência de comunicação *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                {comunicacaoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`com-${opt.value}`} />
                    <label htmlFor={`com-${opt.value}`} className="text-sm cursor-pointer">
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
