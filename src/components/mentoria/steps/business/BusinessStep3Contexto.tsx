import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const impactoFinanceiroOptions = [
  { value: "ate_10k", label: "Até R$ 10.000/mês" },
  { value: "10k_50k", label: "R$ 10.000 - R$ 50.000/mês" },
  { value: "50k_100k", label: "R$ 50.000 - R$ 100.000/mês" },
  { value: "acima_100k", label: "Acima de R$ 100.000/mês" },
  { value: "nao_sei", label: "Ainda não tenho essa estimativa" },
];

const orcamentoExpansaoOptions = [
  { value: "ate_5k", label: "Até R$ 5.000/mês" },
  { value: "5k_15k", label: "R$ 5.000 - R$ 15.000/mês" },
  { value: "15k_30k", label: "R$ 15.000 - R$ 30.000/mês" },
  { value: "acima_30k", label: "Acima de R$ 30.000/mês" },
  { value: "a_definir", label: "A definir conforme resultados" },
];

export function BusinessStep3Contexto({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-strong">Visão de Impacto</h3>
          <p className="text-sm text-muted-foreground">Quanto essa solução pode gerar de valor</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-brand-cream border border-brand-hairline mb-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">Por que perguntamos?</strong> Essas informações nos ajudam 
          a priorizar as entregas que geram mais impacto para você.
        </p>
      </div>

      <FormField
        control={form.control}
        name="impacto_financeiro_estimado"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Qual o impacto financeiro estimado dessa solução?</FormLabel>
            <p className="text-xs text-muted-foreground mb-2">
              Quanto você estima economizar ou gerar com essa automação por mês?
            </p>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {impactoFinanceiroOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`impacto-${opt.value}`} />
                    <label htmlFor={`impacto-${opt.value}`} className="text-sm cursor-pointer text-foreground">
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
        name="kpi_principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Qual é o principal indicador (KPI) que você quer melhorar?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Tempo de resposta ao cliente, taxa de conversão, custo por lead, NPS..."
                className="min-h-[80px] bg-background border-brand-hairline text-foreground placeholder:text-muted-foreground"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="outras_areas_potencial"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Além dessa solução, quais outras áreas da empresa poderiam usar IA?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: RH, Financeiro, Marketing, Vendas, Operações..."
                className="min-h-[80px] bg-background border-brand-hairline text-foreground placeholder:text-muted-foreground"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="orcamento_expansao"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Qual orçamento você tem em mente para expandir o uso de IA?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {orcamentoExpansaoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`orc-${opt.value}`} />
                    <label htmlFor={`orc-${opt.value}`} className="text-sm cursor-pointer text-foreground">
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
