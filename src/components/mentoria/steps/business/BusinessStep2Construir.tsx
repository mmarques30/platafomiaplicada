import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Wrench } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onNext: () => void;
  onPrev: () => void;
}

export function BusinessStep2Construir({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
          <Wrench className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">O Que Vamos Construir</h3>
          <p className="text-sm text-muted-foreground">Descreva o que precisa ser feito</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 mb-6">
        <p className="text-sm text-foreground/80">
          <strong className="text-purple-400">Importante:</strong> Quanto mais detalhes você fornecer, 
          mais precisa será a solução que vamos construir para você.
        </p>
      </div>

      <FormField
        control={form.control}
        name="problema_principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual problema você quer resolver com IA? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Gastamos muito tempo respondendo e-mails de clientes com dúvidas repetitivas..."
                className="min-h-[100px] bg-card border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="processo_automatizar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descreva o processo/tarefa que quer automatizar *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Hoje recebemos cerca de 50 e-mails por dia. Cada um precisa ser lido, categorizado e respondido manualmente..."
                className="min-h-[100px] bg-card border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="resultado_esperado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual resultado você espera dessa solução? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Quero que a IA responda automaticamente 80% dos e-mails e me notifique apenas os urgentes..."
                className="min-h-[100px] bg-card border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ja_tentou_antes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você já tentou resolver isso antes? Como?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Conte se já tentou alguma solução e o que não funcionou..."
                className="min-h-[80px] bg-card border-border"
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
