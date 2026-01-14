import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Rocket } from "lucide-react";
import type { AcademyFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<AcademyFormData>;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const estiloOptions = [
  { value: "visual", label: "Visual - Prefiro vídeos e demonstrações" },
  { value: "pratico", label: "Prático - Aprendo fazendo" },
  { value: "leitura", label: "Leitura - Prefiro textos e artigos" },
  { value: "misto", label: "Misto - Um pouco de cada" },
];

const preferenciaOptions = [
  { value: "individual", label: "Estudo individual, no meu ritmo" },
  { value: "grupo", label: "Aprender em grupo, com troca" },
  { value: "mentoria", label: "Acompanhamento individual" },
];

const quickWinsOptions = [
  { id: "escrever-melhor", label: "Escrever textos e e-mails melhores" },
  { id: "criar-apresentacoes", label: "Criar apresentações rapidamente" },
  { id: "analisar-dados", label: "Analisar dados e planilhas" },
  { id: "automatizar-tarefas", label: "Automatizar tarefas repetitivas" },
  { id: "pesquisar-rapido", label: "Pesquisar e resumir informações" },
  { id: "gerar-imagens", label: "Gerar imagens e artes" },
];

export function AcademyStep5Comprometimento({ form, onPrev, onSubmit, isSubmitting }: StepProps) {
  const comprometimento = form.watch("nivel_comprometimento") || 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Comprometimento</h3>
          <p className="text-sm text-muted-foreground">Como você prefere aprender</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="estilo_aprendizagem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu estilo de aprendizagem? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {estiloOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`estilo-${opt.value}`} />
                    <label htmlFor={`estilo-${opt.value}`} className="text-sm cursor-pointer flex-1">
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
        name="preferencia_aprendizado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você prefere aprender? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {preferenciaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`pref-${opt.value}`} />
                    <label htmlFor={`pref-${opt.value}`} className="text-sm cursor-pointer flex-1">
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
        name="nivel_comprometimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Qual seu nível de comprometimento? (1-10) *
              <span className="ml-2 text-primary font-bold">{comprometimento}</span>
            </FormLabel>
            <FormControl>
              <div className="px-2 py-4">
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[field.value || 5]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Farei o que puder</span>
                  <span>Totalmente comprometido</span>
                </div>
              </div>
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
            <FormLabel>O que você mais quer aprender primeiro? (selecione até 3)</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickWinsOptions.map((qw) => (
                <FormField
                  key={qw.id}
                  control={form.control}
                  name="quick_wins"
                  render={({ field }) => {
                    const current = field.value || [];
                    const isChecked = current.includes(qw.id);
                    const isDisabled = !isChecked && current.length >= 3;

                    return (
                      <FormItem className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${isChecked ? 'border-primary bg-primary/5' : 'border-border'} ${isDisabled ? 'opacity-50' : 'hover:border-primary/40'}`}>
                        <FormControl>
                          <Checkbox
                            checked={isChecked}
                            disabled={isDisabled}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...current, qw.id]);
                              } else {
                                field.onChange(current.filter((v) => v !== qw.id));
                              }
                            }}
                          />
                        </FormControl>
                        <label className="text-sm cursor-pointer">{qw.label}</label>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

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
              Finalizar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
