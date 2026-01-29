import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowRight, User } from "lucide-react";
import type { AcademyFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<AcademyFormData>;
  onNext: () => void;
}

const areasAtuacao = [
  { value: "tecnologia", label: "Tecnologia / TI" },
  { value: "marketing", label: "Marketing / Comunicação" },
  { value: "vendas", label: "Vendas / Comercial" },
  { value: "rh", label: "RH / Pessoas" },
  { value: "financeiro", label: "Financeiro / Contabilidade" },
  { value: "operacoes", label: "Operações / Processos" },
  { value: "design", label: "Design / Criativo" },
  { value: "juridico", label: "Jurídico" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "outro", label: "Outro" },
];

const comoConheceuOptions = [
  { value: "indicacao", label: "Indicação de amigo/colega" },
  { value: "google", label: "Pesquisa no Google" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "evento", label: "Evento/Palestra" },
  { value: "outro", label: "Outro" },
];

export function AcademyStep1Perfil({ form, onNext }: StepProps) {
  const areaAtual = form.watch("area_atuacao");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Perfil e Motivação</h3>
          <p className="text-sm text-muted-foreground">Conte sobre você e o que te trouxe aqui</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="profissao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profissão atual *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Analista de Marketing" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="area_atuacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Área de atuação *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {areasAtuacao.map((area) => (
                  <div key={area.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={area.value} id={area.value} />
                    <label htmlFor={area.value} className="text-sm cursor-pointer">
                      {area.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {areaAtual === "outro" && (
        <FormField
          control={form.control}
          name="area_atuacao_outro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qual área?</FormLabel>
              <FormControl>
                <Input placeholder="Descreva sua área" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="como_conheceu_iaplicada"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você conheceu a IAplicada? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {comoConheceuOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`conheceu-${opt.value}`} />
                    <label htmlFor={`conheceu-${opt.value}`} className="text-sm cursor-pointer">
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
        name="motivo_compra"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que te motivou a adquirir o Academy? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Conta pra gente o que te fez tomar essa decisão..."
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
        name="expectativa_produto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que você espera conquistar com o Academy? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva suas principais expectativas..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          Próximo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
