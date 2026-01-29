import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Trophy } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const gatilhoRenovacaoOptions = [
  { value: "resultados", label: "Ver resultados concretos / ROI" },
  { value: "confianca", label: "Construir confiança no parceiro" },
  { value: "equipe", label: "Equipe dominar a solução" },
  { value: "expansao", label: "Identificar mais oportunidades" },
  { value: "preco", label: "Condições comerciais atrativas" },
];

const agendarCallOptions = [
  { value: "sim", label: "Sim, quanto antes" },
  { value: "em_breve", label: "Em breve, preciso organizar agenda" },
  { value: "por_email", label: "Prefiro alinhar por e-mail" },
  { value: "ja_conversamos", label: "Já conversamos, posso prosseguir" },
];

export function BusinessStep6Expectativas({ form, onPrev, onSubmit, isSubmitting }: StepProps) {
  const importancia = form.watch("importancia_projeto") || 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sucesso e Parceria</h3>
          <p className="text-sm text-muted-foreground">O que define sucesso para você</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="definicao_sucesso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você define sucesso para esse projeto?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Reduzir tempo de atendimento em 50%, economizar R$ 20.000/mês, liberar 10h semanais da equipe..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="importancia_projeto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>De 1 a 10, qual a importância desse projeto para a empresa?</FormLabel>
            <div className="pt-4 pb-2">
              <FormControl>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[field.value || 5]}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="w-full"
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 - Pouco importante</span>
                <span className="font-bold text-primary text-lg">{importancia}</span>
                <span>10 - Crítico</span>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gatilho_renovacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que faria você renovar/expandir a parceria conosco?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {gatilhoRenovacaoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`gatilho-${opt.value}`} />
                    <label htmlFor={`gatilho-${opt.value}`} className="text-sm cursor-pointer">
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
        name="maior_preocupacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu maior medo ou preocupação com esse projeto?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Conte suas preocupações para que possamos endereçá-las..."
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
        name="agendar_call_alinhamento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gostaria de agendar uma call de alinhamento?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-2"
              >
                {agendarCallOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`call-${opt.value}`} />
                    <label htmlFor={`call-${opt.value}`} className="text-sm cursor-pointer">
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

      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-foreground/80">
          <strong className="text-primary">Próximos passos:</strong> Após enviar este formulário, 
          nossa equipe vai analisar suas informações e entrar em contato para alinhar os detalhes do projeto.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>Finalizando...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Finalizar Diagnóstico
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
