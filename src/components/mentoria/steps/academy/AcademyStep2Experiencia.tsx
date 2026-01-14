import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Bot } from "lucide-react";
import type { AcademyFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<AcademyFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const ferramentasOptions = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "claude", label: "Claude" },
  { id: "perplexity", label: "Perplexity" },
  { id: "copilot", label: "Microsoft Copilot" },
  { id: "midjourney", label: "Midjourney" },
  { id: "canva-ia", label: "Canva IA" },
  { id: "notion-ai", label: "Notion AI" },
];

const nivelOptions = [
  { value: "iniciante", label: "Iniciante - Ainda estou descobrindo" },
  { value: "basico", label: "Básico - Uso ocasionalmente" },
  { value: "intermediario", label: "Intermediário - Uso regularmente" },
  { value: "avancado", label: "Avançado - Uso diariamente com profundidade" },
];

const frequenciaOptions = [
  { value: "nunca", label: "Nunca usei" },
  { value: "raramente", label: "Raramente (1-2x por mês)" },
  { value: "semanalmente", label: "Semanalmente" },
  { value: "diariamente", label: "Diariamente" },
];

export function AcademyStep2Experiencia({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sua Experiência com IA</h3>
          <p className="text-sm text-muted-foreground">Como está sua jornada até aqui</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="nivel_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu nível atual com IA? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {nivelOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <label htmlFor={opt.value} className="text-sm cursor-pointer flex-1">
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
        name="ferramentas_ia"
        render={() => (
          <FormItem>
            <FormLabel>Quais ferramentas de IA você já usa?</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ferramentasOptions.map((ferramenta) => (
                <FormField
                  key={ferramenta.id}
                  control={form.control}
                  name="ferramentas_ia"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(ferramenta.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, ferramenta.id]);
                            } else {
                              field.onChange(current.filter((v) => v !== ferramenta.id));
                            }
                          }}
                        />
                      </FormControl>
                      <label className="text-sm cursor-pointer">{ferramenta.label}</label>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="outras_ferramentas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Outras ferramentas</FormLabel>
            <FormControl>
              <Input placeholder="Liste outras ferramentas que usa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="frequencia_uso_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Com que frequência você usa IA? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-2"
              >
                {frequenciaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`freq-${opt.value}`} />
                    <label htmlFor={`freq-${opt.value}`} className="text-sm cursor-pointer">
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
        name="maior_dificuldade_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual sua maior dificuldade com IA?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o que mais te trava ou confunde..."
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
