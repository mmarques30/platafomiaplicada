import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Trophy } from "lucide-react";
import type { BusinessFormData } from "../../schema";

interface StepProps {
  form: UseFormReturn<BusinessFormData>;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function BusinessStep6Expectativas({ form, onPrev, onSubmit, isSubmitting }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
          <Trophy className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Expectativas e Sucesso</h3>
          <p className="text-sm text-muted-foreground">O que define sucesso para você</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="como_medir_sucesso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você vai medir se a solução funcionou? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Redução de 50% no tempo de resposta aos clientes, economia de 20h semanais da equipe..."
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
        name="maior_preocupacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu maior medo ou preocupação com esse projeto?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Conte suas preocupações para que possamos endereçá-las..."
                className="min-h-[80px] bg-card border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="vitoria_30_dias"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que seria uma "vitória" em 30 dias? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o que você considera um marco de sucesso nos primeiros 30 dias..."
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
        name="nao_pode_acontecer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que definitivamente NÃO pode acontecer?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Não podemos expor dados de clientes, não pode ter erros de cálculo, etc..."
                className="min-h-[80px] bg-card border-border"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20">
        <p className="text-sm text-foreground/80">
          <strong className="text-purple-400">Próximos passos:</strong> Após enviar este formulário, 
          vamos analisar suas informações e entrar em contato para alinhar os detalhes do projeto.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting} 
          className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          {isSubmitting ? (
            <>Finalizando...</>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Finalizar Diagnóstico
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
