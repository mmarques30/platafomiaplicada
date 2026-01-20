import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
}

const tamanhoEmpresaOptions = [
  { value: "mei", label: "MEI / Autônomo" },
  { value: "micro", label: "Micro (até 9 funcionários)" },
  { value: "pequena", label: "Pequena (10-49 funcionários)" },
  { value: "media", label: "Média (50-249 funcionários)" },
  { value: "grande", label: "Grande (250+ funcionários)" },
];

export function BusinessStep1Perfil({ form, onNext }: StepProps) {
  const temEquipe = form.watch("tem_equipe");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seu Perfil</h3>
          <p className="text-sm text-muted-foreground">Informações sobre você e sua empresa</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="nome_completo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu nome completo *</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cargo_atual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu cargo *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Diretor de Operações" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="empresa_nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da empresa *</FormLabel>
            <FormControl>
              <Input placeholder="Nome da sua empresa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tamanho_empresa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tamanho da empresa *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {tamanhoEmpresaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`size-${opt.value}`} />
                    <label htmlFor={`size-${opt.value}`} className="text-sm cursor-pointer">
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
        name="tem_equipe"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between py-2">
            <div>
              <FormLabel className="text-base">Você lidera uma equipe?</FormLabel>
              <p className="text-sm text-muted-foreground">Marque se você tem pessoas sob sua gestão</p>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {temEquipe && (
        <FormField
          control={form.control}
          name="tamanho_equipe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantas pessoas na sua equipe?</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Número de pessoas"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          Próximo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
