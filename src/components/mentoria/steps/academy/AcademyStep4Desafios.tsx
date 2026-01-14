import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
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

export function AcademyStep4Desafios({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Desafios e Tempo</h3>
          <p className="text-sm text-muted-foreground">Entender sua rotina atual</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Quais são os 3 maiores desafios que você enfrenta no seu dia a dia profissional?
        </p>

        <FormField
          control={form.control}
          name="desafio_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desafio #1 *</FormLabel>
              <FormControl>
                <Input placeholder="Seu maior desafio no trabalho" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desafio_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desafio #2 *</FormLabel>
              <FormControl>
                <Input placeholder="Outro desafio importante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desafio_3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desafio #3 *</FormLabel>
              <FormControl>
                <Input placeholder="Mais um desafio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
        name="maior_ladrao_tempo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual atividade mais te rouba tempo no trabalho? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva aquela tarefa que te consome muito tempo..."
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
