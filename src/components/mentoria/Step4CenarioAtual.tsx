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

export function Step4CenarioAtual({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Cenário Atual</h2>
        <p className="text-muted-foreground">Seus desafios e limitações</p>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Liste seus 3 maiores desafios profissionais hoje: *</h3>
        
        <FormField
          control={form.control}
          name="desafio_1"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>1º maior desafio</FormLabel>
              <FormControl>
                <Input placeholder="Descreva o primeiro desafio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desafio_2"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>2º maior desafio</FormLabel>
              <FormControl>
                <Input placeholder="Descreva o segundo desafio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desafio_3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>3º maior desafio</FormLabel>
              <FormControl>
                <Input placeholder="Descreva o terceiro desafio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="tempo_disponivel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quanto tempo você tem disponível por semana para a mentoria? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-2h" id="1-2h" />
                  <label htmlFor="1-2h" className="cursor-pointer">1-2 horas</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3-5h" id="3-5h" />
                  <label htmlFor="3-5h" className="cursor-pointer">3-5 horas</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6-10h" id="6-10h" />
                  <label htmlFor="6-10h" className="cursor-pointer">6-10 horas</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10+h" id="10+h" />
                  <label htmlFor="10+h" className="cursor-pointer">+10 horas</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maior_ladrao_tempo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual é seu maior "ladrão de tempo" hoje? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Aquela tarefa que consome horas e você sabe que poderia ser otimizada"
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
        name="nivel_autonomia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você tem autonomia para implementar mudanças/IA no seu trabalho? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="total" id="total" />
                  <label htmlFor="total" className="cursor-pointer">Sim, total liberdade</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parcial" id="parcial" />
                  <label htmlFor="parcial" className="cursor-pointer">Parcial, preciso de aprovação</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="influenciar" id="influenciar" />
                  <label htmlFor="influenciar" className="cursor-pointer">Não, mas posso influenciar</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resistente" id="resistente" />
                  <label htmlFor="resistente" className="cursor-pointer">Não, ambiente muito resistente</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="processo_otimizar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cite um processo específico que você quer otimizar com IA:</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o processo..."
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
