import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const tempoExperienciaOptions = [
  { value: "0-2", label: "0-2 anos" },
  { value: "3-5", label: "3-5 anos" },
  { value: "6-10", label: "6-10 anos" },
  { value: "10+", label: "Mais de 10 anos" },
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
          <h3 className="text-lg font-semibold text-foreground">Seu Perfil Profissional</h3>
          <p className="text-sm text-muted-foreground">Conte um pouco sobre você</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="nome_completo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo *</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idade *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Sua idade"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="linkedin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="https://linkedin.com/in/seu-perfil" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
        name="tempo_experiencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tempo de experiência na área *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                {tempoExperienciaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`exp-${opt.value}`} />
                    <label htmlFor={`exp-${opt.value}`} className="text-sm cursor-pointer">
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

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          Próximo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
