import { UseFormReturn } from "react-hook-form";
import { FormData } from "./schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface StepProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

const ferramentasOptions = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "copilot", label: "Copilot/GitHub Copilot" },
  { id: "midjourney", label: "Midjourney/DALL-E" },
  { id: "perplexity", label: "Perplexity" },
  { id: "manus", label: "manus.ai" },
  { id: "automacao", label: "Ferramentas de automação (Zapier, Make, n8n)" },
];

export function Step2ExperienciaIA({ form, onNext, onPrev }: StepProps) {
  const ferramentasSelecionadas = form.watch("ferramentas_ia") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Experiência com IA</h2>
        <p className="text-muted-foreground">Seu momento com IA</p>
      </div>

      <FormField
        control={form.control}
        name="nivel_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você classificaria seu nível atual? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="iniciante" id="iniciante" />
                  <label htmlFor="iniciante" className="cursor-pointer">
                    Iniciante (nunca ou quase nunca usei)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basico" id="basico" />
                  <label htmlFor="basico" className="cursor-pointer">
                    Básico (uso para tarefas simples)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediario" id="intermediario" />
                  <label htmlFor="intermediario" className="cursor-pointer">
                    Intermediário (uso regularmente com bons resultados)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="avancado" id="avancado" />
                  <label htmlFor="avancado" className="cursor-pointer">
                    Avançado (domino várias ferramentas e técnicas)
                  </label>
                </div>
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
            <FormLabel>Ferramentas que já usa:</FormLabel>
            <div className="space-y-2">
              {ferramentasOptions.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="ferramentas_ia"
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

      <FormField
        control={form.control}
        name="outras_ferramentas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Outras ferramentas:</FormLabel>
            <FormControl>
              <Input placeholder="Digite outras ferramentas que você usa" {...field} />
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
            <FormLabel>Frequência de uso de IA: *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nunca" id="nunca" />
                  <label htmlFor="nunca" className="cursor-pointer">Nunca usei</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="raramente" id="raramente" />
                  <label htmlFor="raramente" className="cursor-pointer">Raramente (1x por mês)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="as-vezes" id="as-vezes" />
                  <label htmlFor="as-vezes" className="cursor-pointer">Às vezes (1x por semana)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="frequentemente" id="frequentemente" />
                  <label htmlFor="frequentemente" className="cursor-pointer">
                    Frequentemente (várias vezes por semana)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="diariamente" id="diariamente" />
                  <label htmlFor="diariamente" className="cursor-pointer">
                    Diariamente (parte da rotina)
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="experiencia_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Conte sua experiência com IA até agora:</FormLabel>
            <FormControl>
              <Textarea
                placeholder="O que já tentou fazer? O que deu certo? O que não funcionou?"
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
        name="maior_dificuldade_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual sua maior dificuldade com IA hoje?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva seus principais obstáculos..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
