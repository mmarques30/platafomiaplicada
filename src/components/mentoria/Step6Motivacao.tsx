import { UseFormReturn } from "react-hook-form";
import { FormData } from "./schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface StepProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export function Step6Motivacao({ form, onNext, onPrev }: StepProps) {
  const nivelComprometimento = form.watch("nivel_comprometimento") || 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Motivação</h2>
        <p className="text-muted-foreground">O que te move</p>
      </div>

      <FormField
        control={form.control}
        name="motivacao_mentoria"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que te motivou a buscar esta mentoria agora? *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Teve algum gatilho específico?"
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
        name="maior_medo_ia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual sua maior preocupação/medo em relação à IA?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Seja sincero sobre suas preocupações..."
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
        name="nivel_comprometimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nível de comprometimento (1-10):</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[field.value || 5]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 = Baixo</span>
                  <span className="font-semibold text-primary">{nivelComprometimento}</span>
                  <span>10 = Máximo</span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="zona_conforto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você está aberto a sair da zona de conforto? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim-completo" id="sim-completo" />
                  <label htmlFor="sim-completo" className="cursor-pointer">Sim, completamente</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim-cuidado" id="sim-cuidado" />
                  <label htmlFor="sim-cuidado" className="cursor-pointer">Sim, mas com cuidado</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="depende-zona" id="depende-zona" />
                  <label htmlFor="depende-zona" className="cursor-pointer">Depende do que for</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="devagar" id="devagar" />
                  <label htmlFor="devagar" className="cursor-pointer">Prefiro ir devagar</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nao_negociaveis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>O que você NÃO quer mudar na sua forma de trabalhar?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Seus não-negociáveis..."
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
