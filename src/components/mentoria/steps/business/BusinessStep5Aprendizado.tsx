import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const interesseAlemEntregaOptions = [
  { id: "skills", label: "Capacitar minha equipe em IA (Skills)" },
  { id: "consultoria", label: "Consultoria contínua para novos projetos" },
  { id: "suporte", label: "Suporte prioritário estendido" },
  { id: "suficiente", label: "Apenas a entrega é suficiente" },
];

const areasFuturoIAOptions = [
  { id: "atendimento", label: "Atendimento ao Cliente" },
  { id: "vendas", label: "Vendas / Comercial" },
  { id: "marketing", label: "Marketing / Conteúdo" },
  { id: "operacoes", label: "Operações / Processos" },
  { id: "financeiro", label: "Financeiro / Contábil" },
  { id: "rh", label: "RH / People" },
  { id: "produto", label: "Produto / Desenvolvimento" },
  { id: "dados", label: "Dados / Analytics" },
];

export function BusinessStep5Aprendizado({ form, onNext, onPrev }: StepProps) {
  const interesseAlemEntrega = form.watch("interesse_alem_entrega") || [];
  const querCapacitarEquipe = interesseAlemEntrega.includes("skills");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Interesse em Expansão</h3>
          <p className="text-sm text-muted-foreground">Além da entrega, o que mais te interessa?</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
        <p className="text-sm text-foreground/80">
          <strong className="text-primary">Você já tem acesso à plataforma Academy!</strong> Aqui 
          queremos entender como podemos agregar ainda mais valor para você e sua empresa.
        </p>
      </div>

      <FormField
        control={form.control}
        name="interesse_alem_entrega"
        render={() => (
          <FormItem>
            <FormLabel>Além da entrega da solução, o que mais te interessaria?</FormLabel>
            <p className="text-xs text-muted-foreground mb-3">Selecione todas as opções que fazem sentido</p>
            <div className="space-y-3">
              {interesseAlemEntregaOptions.map((option) => (
                <FormField
                  key={option.id}
                  control={form.control}
                  name="interesse_alem_entrega"
                  render={({ field }) => {
                    const value = field.value || [];
                    return (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={value.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...value, option.id]);
                              } else {
                                field.onChange(value.filter((v: string) => v !== option.id));
                              }
                            }}
                          />
                        </FormControl>
                        <label className="text-sm cursor-pointer font-normal">
                          {option.label}
                        </label>
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

      {querCapacitarEquipe && (
        <FormField
          control={form.control}
          name="pessoas_para_capacitar_skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantas pessoas você gostaria de capacitar?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: 5 pessoas do time de atendimento, 3 do marketing..."
                  className="min-h-[60px]"
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
        name="areas_futuro_ia"
        render={() => (
          <FormItem>
            <FormLabel>Quais áreas da empresa você pretende automatizar no futuro?</FormLabel>
            <p className="text-xs text-muted-foreground mb-3">Selecione as áreas com potencial para IA</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {areasFuturoIAOptions.map((area) => (
                <FormField
                  key={area.id}
                  control={form.control}
                  name="areas_futuro_ia"
                  render={({ field }) => {
                    const value = field.value || [];
                    return (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={value.includes(area.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...value, area.id]);
                              } else {
                                field.onChange(value.filter((v: string) => v !== area.id));
                              }
                            }}
                          />
                        </FormControl>
                        <label className="text-xs cursor-pointer">{area.label}</label>
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

      <FormField
        control={form.control}
        name="proximo_projeto_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Se pudesse fazer mais um projeto de IA, qual seria?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva brevemente outro processo ou área que você gostaria de automatizar..."
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
