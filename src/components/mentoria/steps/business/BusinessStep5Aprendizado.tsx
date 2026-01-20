import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const querAprenderOptions = [
  { value: "sim", label: "Sim, quero aprender a usar IA pessoalmente" },
  { value: "nao", label: "Não, prefiro apenas receber a solução pronta" },
  { value: "depois", label: "Talvez depois, quando tiver mais tempo" },
];

const equipeOptions = [
  { value: "sim", label: "Sim, a equipe precisará ser capacitada" },
  { value: "nao", label: "Não, a solução deve ser autossuficiente" },
  { value: "depois", label: "Talvez depois, dependendo da solução" },
];

const disponibilidadeOptions = [
  { value: "1-2h", label: "1-2 horas por semana" },
  { value: "3-5h", label: "3-5 horas por semana" },
  { value: "flexivel", label: "Flexível conforme necessidade" },
  { value: "nenhuma", label: "Não temos disponibilidade agora" },
];

export function BusinessStep5Aprendizado({ form, onNext, onPrev }: StepProps) {
  const querAprender = form.watch("quer_aprender");
  const equipePrecisa = form.watch("equipe_precisa_aprender");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Interesse em Aprendizado</h3>
          <p className="text-sm text-muted-foreground">Você ou sua equipe querem aprender IA?</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border border-border mb-6">
        <p className="text-sm text-foreground/80">
          <strong className="text-primary">Opcional:</strong> Além da entrega da solução, você e/ou sua equipe 
          podem aprender a usar IA. Isso é um diferencial do plano Business.
        </p>
      </div>

      <FormField
        control={form.control}
        name="quer_aprender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você pessoalmente quer aprender a usar IA? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {querAprenderOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`aprender-${opt.value}`} />
                    <label htmlFor={`aprender-${opt.value}`} className="text-sm cursor-pointer">
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

      {querAprender === "sim" && (
        <FormField
          control={form.control}
          name="o_que_aprender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>O que você gostaria de aprender a fazer sozinho?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Quero aprender a criar prompts melhores, usar ChatGPT para análise de dados..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="equipe_precisa_aprender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sua equipe precisa aprender a usar/manter a solução? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {equipeOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
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

      {equipePrecisa === "sim" && (
        <>
          <FormField
            control={form.control}
            name="quantos_capacitar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantas pessoas precisam ser capacitadas?</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Número de pessoas"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || "")}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disponibilidade_treinamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qual a disponibilidade da equipe para treinamentos?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-2"
                  >
                    {disponibilidadeOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={`disp-${opt.value}`} />
                        <label htmlFor={`disp-${opt.value}`} className="text-sm cursor-pointer">
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
        </>
      )}

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
