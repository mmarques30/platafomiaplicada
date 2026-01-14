import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const urgenciaOptions = [
  { value: "imediato", label: "Imediato (preciso ontem)" },
  { value: "30dias", label: "Próximos 30 dias" },
  { value: "90dias", label: "Próximos 90 dias" },
  { value: "sempressa", label: "Sem pressa definida" },
];

const sistemasOptions = [
  { id: "crm", label: "CRM (Salesforce, Pipedrive, etc.)" },
  { id: "erp", label: "ERP (SAP, TOTVS, etc.)" },
  { id: "planilhas", label: "Planilhas (Excel, Google Sheets)" },
  { id: "email", label: "E-mail (Gmail, Outlook)" },
  { id: "whatsapp", label: "WhatsApp / Mensageiros" },
  { id: "site", label: "Site / Landing Pages" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "notion", label: "Notion / Ferramentas de gestão" },
];

const volumeOptions = [
  { value: "baixo", label: "Baixo (algumas vezes por semana)" },
  { value: "medio", label: "Médio (algumas vezes por dia)" },
  { value: "alto", label: "Alto (dezenas de vezes por dia)" },
  { value: "intenso", label: "Intenso (centenas de vezes por dia)" },
];

export function BusinessStep3Contexto({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
          <Layers className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Contexto da Entrega</h3>
          <p className="text-sm text-muted-foreground">Detalhes técnicos e de uso</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="urgencia_solucao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual a urgência dessa solução? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-2"
              >
                {urgenciaOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card/50 hover:border-purple-500/40 transition-all">
                    <RadioGroupItem value={opt.value} id={`urg-${opt.value}`} />
                    <label htmlFor={`urg-${opt.value}`} className="text-sm cursor-pointer flex-1">
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
        name="sistemas_integrar"
        render={() => (
          <FormItem>
            <FormLabel>Existem sistemas que precisam integrar?</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sistemasOptions.map((sistema) => (
                <FormField
                  key={sistema.id}
                  control={form.control}
                  name="sistemas_integrar"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-card/50 hover:border-purple-500/40 transition-all">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(sistema.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, sistema.id]);
                            } else {
                              field.onChange(current.filter((v) => v !== sistema.id));
                            }
                          }}
                        />
                      </FormControl>
                      <label className="text-sm cursor-pointer">{sistema.label}</label>
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
        name="outros_sistemas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Outros sistemas</FormLabel>
            <FormControl>
              <Input placeholder="Liste outros sistemas que usa" className="bg-card border-border" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="quem_vai_usar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quem vai usar a solução no dia a dia? *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Equipe de atendimento (5 pessoas), eu mesmo, etc." 
                className="bg-card border-border" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="volume_uso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual o volume de uso esperado? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-2"
              >
                {volumeOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card/50 hover:border-purple-500/40 transition-all">
                    <RadioGroupItem value={opt.value} id={`vol-${opt.value}`} />
                    <label htmlFor={`vol-${opt.value}`} className="text-sm cursor-pointer flex-1">
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
        <Button 
          onClick={onNext} 
          className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          Próximo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
