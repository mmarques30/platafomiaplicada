import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";
import type { AcademyFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<AcademyFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const objetivoOptions = [
  { value: "produtividade", label: "Aumentar minha produtividade pessoal" },
  { value: "carreira", label: "Crescer na carreira usando IA" },
  { value: "automatizar", label: "Automatizar tarefas repetitivas" },
  { value: "criar-conteudo", label: "Criar conteúdo com IA" },
  { value: "analise-dados", label: "Analisar dados e informações" },
  { value: "novo-negocio", label: "Iniciar um negócio com IA" },
  { value: "outro", label: "Outro" },
];

export function AcademyStep3Objetivos({ form, onNext, onPrev }: StepProps) {
  const objetivoAtual = form.watch("objetivo_principal");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seus Objetivos</h3>
          <p className="text-sm text-muted-foreground">O que você quer alcançar com IA</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="objetivo_principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu objetivo principal? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-2"
              >
                {objetivoOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={opt.value} id={`obj-${opt.value}`} />
                    <label htmlFor={`obj-${opt.value}`} className="text-sm cursor-pointer flex-1">
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

      {objetivoAtual === "outro" && (
        <FormField
          control={form.control}
          name="objetivo_especifico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descreva seu objetivo</FormLabel>
              <FormControl>
                <Input placeholder="Qual é o seu objetivo específico?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="area_aplicacao_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Em que área/atividade você mais quer aplicar IA? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Escrever e-mails, criar apresentações, analisar planilhas..."
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
        name="meta_3_meses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual sua meta para os próximos 3 meses? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o que você quer ter conquistado daqui 3 meses..."
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
        name="projetos_pessoais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tem algum projeto pessoal que quer fazer com IA?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Conte se tem alguma ideia de projeto que quer tirar do papel..."
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
