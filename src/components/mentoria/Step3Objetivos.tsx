import { UseFormReturn } from "react-hook-form";
import { FormData } from "./schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface StepProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3Objetivos({ form, onNext, onPrev }: StepProps) {
  const objetivoPrincipal = form.watch("objetivo_principal");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Objetivos</h2>
        <p className="text-muted-foreground">Onde você quer chegar</p>
      </div>

      <FormField
        control={form.control}
        name="objetivo_principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual seu principal objetivo com a mentoria? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="produtividade" id="produtividade" />
                  <label htmlFor="produtividade" className="cursor-pointer">
                    Aumentar minha produtividade pessoal
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="carreira" id="carreira" />
                  <label htmlFor="carreira" className="cursor-pointer">
                    Acelerar minha carreira/mudar de área
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inovacao" id="inovacao" />
                  <label htmlFor="inovacao" className="cursor-pointer">
                    Inovar e criar soluções na empresa
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="produto" id="produto" />
                  <label htmlFor="produto" className="cursor-pointer">
                    Desenvolver um produto/serviço com IA
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transformacao" id="transformacao" />
                  <label htmlFor="transformacao" className="cursor-pointer">
                    Liderar transformação digital na empresa
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro" id="outro-obj" />
                  <label htmlFor="outro-obj" className="cursor-pointer">Outro</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {objetivoPrincipal === "outro" && (
        <FormField
          control={form.control}
          name="objetivo_especifico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descreva seu objetivo específico</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu objetivo" {...field} />
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
            <FormLabel>Em qual área você mais quer aplicar IA? *</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Automação de relatórios, criação de conteúdo, análise de dados..."
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
            <FormLabel>O que você quer conquistar em 3 meses? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Seja mensurável e realista"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="meta_12_meses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E em 12 meses, onde você se vê? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Pense grande mas factível"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metricas_sucesso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você vai medir se teve sucesso?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Quais métricas/indicadores?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
