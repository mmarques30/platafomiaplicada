import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const decisoresOptions = [
  { value: "apenas_eu", label: "Apenas eu decido" },
  { value: "eu_e_socio", label: "Eu e meu sócio/diretoria" },
  { value: "comite", label: "Comitê de decisão / Board" },
  { value: "ti_envolvida", label: "TI precisa aprovar" },
  { value: "outro", label: "Outro processo" },
];

const motivoEscolhaOptions = [
  { value: "reputacao", label: "Reputação / Cases de sucesso" },
  { value: "indicacao", label: "Indicação de alguém confiável" },
  { value: "conteudo", label: "Conteúdos da IAplicada (LinkedIn, etc)" },
  { value: "reuniao", label: "Conversa / Reunião comercial" },
  { value: "diferencial", label: "Diferencial do modelo (entrega + capacitação)" },
];

const experienciaConsultoriasOptions = [
  { value: "primeira_vez", label: "Primeira vez contratando consultoria de IA" },
  { value: "ja_contratou_bem", label: "Já contratei e foi positivo" },
  { value: "ja_contratou_mal", label: "Já contratei e não gostei da experiência" },
  { value: "time_interno", label: "Tenho time interno de tecnologia" },
];

export function BusinessStep4Acompanhamento({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-strong">Tomada de Decisão</h3>
          <p className="text-sm text-muted-foreground">Quem decide e por que escolheu a IAplicada</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="decisores_tecnologia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Quem são os decisores para projetos de tecnologia na empresa?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {decisoresOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`dec-${opt.value}`} />
                    <label htmlFor={`dec-${opt.value}`} className="text-sm cursor-pointer text-foreground">
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
        name="decisor_especifico"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Quem especificamente precisa aprovar esse projeto?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: CEO João Silva, Diretora de TI Maria Santos..."
                className="min-h-[60px] bg-background border-brand-hairline text-foreground placeholder:text-muted-foreground"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="motivo_escolha_iaplicada"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Por que você escolheu a IAplicada?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {motivoEscolhaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`motivo-${opt.value}`} />
                    <label htmlFor={`motivo-${opt.value}`} className="text-sm cursor-pointer text-foreground">
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
        name="experiencia_consultorias"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">Qual sua experiência com consultorias/agências de tecnologia?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {experienciaConsultoriasOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`exp-${opt.value}`} />
                    <label htmlFor={`exp-${opt.value}`} className="text-sm cursor-pointer text-foreground">
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
