import { UseFormReturn } from "react-hook-form";
import { FormData } from "./schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface StepProps {
  form: UseFormReturn<FormData>;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const quickWinsOptions = [
  { id: "prompts", label: "Prompts matadores que funcionam" },
  { id: "automacao", label: "Automação de tarefas chatas" },
  { id: "analise", label: "Análise de dados/planilhas com IA" },
  { id: "conteudo", label: "Criar conteúdo 10x mais rápido" },
  { id: "apresentacoes", label: "Fazer apresentações impressionantes" },
  { id: "segundo-cerebro", label: "Construir um segundo cérebro com IA" },
  { id: "estrategia", label: "Estratégia para implementar IA na equipe" },
];

export function Step7Expectativas({ form, onPrev, onSubmit, isSubmitting }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Expectativas</h2>
        <p className="text-muted-foreground">O que espera da mentoria</p>
      </div>

      <FormField
        control={form.control}
        name="tipo_suporte"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Que tipo de suporte você mais precisa? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tecnico" id="tecnico" />
                  <label htmlFor="tecnico" className="cursor-pointer">Técnico (como fazer)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="estrategico" id="estrategico" />
                  <label htmlFor="estrategico" className="cursor-pointer">Estratégico (o que fazer)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="motivacional" id="motivacional" />
                  <label htmlFor="motivacional" className="cursor-pointer">Motivacional (apoio e energia)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pratico" id="pratico" />
                  <label htmlFor="pratico" className="cursor-pointer">Prático (implementação)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="todos" id="todos" />
                  <label htmlFor="todos" className="cursor-pointer">Todos acima</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="frequencia_feedback"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frequência ideal de feedback: *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tempo-real" id="tempo-real" />
                  <label htmlFor="tempo-real" className="cursor-pointer">Tempo real (durante as sessões)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semanal" id="semanal" />
                  <label htmlFor="semanal" className="cursor-pointer">Semanal</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quinzenal" id="quinzenal" />
                  <label htmlFor="quinzenal" className="cursor-pointer">Quinzenal</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mensal" id="mensal" />
                  <label htmlFor="mensal" className="cursor-pointer">Mensal</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferencia_sessoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prefere sessões: *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="estruturadas" id="estruturadas" />
                  <label htmlFor="estruturadas" className="cursor-pointer">Bem estruturadas com agenda</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexiveis" id="flexiveis" />
                  <label htmlFor="flexiveis" className="cursor-pointer">Flexíveis conforme necessidade</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mix" id="mix" />
                  <label htmlFor="mix" className="cursor-pointer">Mix dos dois</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duvidas_preocupacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tem alguma pergunta ou preocupação específica antes de começarmos?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Compartilhe suas dúvidas..."
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
        name="vitoria_30_dias"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que seria uma grande vitória para você nos primeiros 30 dias?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva sua vitória..."
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
        name="quick_wins"
        render={() => (
          <FormItem>
            <FormLabel>Marque 3 coisas que você quer aprender URGENTE:</FormLabel>
            <div className="space-y-2">
              {quickWinsOptions.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="quick_wins"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            field.onChange(
                              checked
                                ? [...current, item.id]
                                : current.filter((val) => val !== item.id)
                            );
                          }}
                        />
                      </FormControl>
                      <label className="cursor-pointer">{item.label}</label>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}
