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
        <h2 className="text-2xl font-bold mb-2">Suas Prioridades</h2>
        <p className="text-muted-foreground">O que você quer conquistar primeiro</p>
      </div>

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
            <FormLabel>Marque até 3 coisas que você quer aprender URGENTE:</FormLabel>
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
