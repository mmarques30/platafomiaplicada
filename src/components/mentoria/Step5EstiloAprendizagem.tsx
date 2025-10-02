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
import { Button } from "@/components/ui/button";

interface StepProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onPrev: () => void;
}

export function Step5EstiloAprendizagem({ form, onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Estilo de Aprendizagem</h2>
        <p className="text-muted-foreground">Seu jeito de aprender</p>
      </div>

      <FormField
        control={form.control}
        name="estilo_aprendizagem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como você aprende melhor? *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="praticando" id="praticando" />
                  <label htmlFor="praticando" className="cursor-pointer">Praticando (mão na massa)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teoria" id="teoria" />
                  <label htmlFor="teoria" className="cursor-pointer">Estudando teoria primeiro</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exemplos" id="exemplos" />
                  <label htmlFor="exemplos" className="cursor-pointer">Vendo exemplos reais</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="discutindo" id="discutindo" />
                  <label htmlFor="discutindo" className="cursor-pointer">Discutindo com outros</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="combinacao" id="combinacao" />
                  <label htmlFor="combinacao" className="cursor-pointer">Combinação de tudo</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferencia_aprendizado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prefere aprender: *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sozinho" id="sozinho" />
                  <label htmlFor="sozinho" className="cursor-pointer">Sozinho no meu ritmo</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grupo" id="grupo" />
                  <label htmlFor="grupo" className="cursor-pointer">Em grupo trocando ideias</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexivel-pref" id="flexivel-pref" />
                  <label htmlFor="flexivel-pref" className="cursor-pointer">Tanto faz, me adapto</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="melhor_horario"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Melhor horário para as sessões: *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manha" id="manha" />
                  <label htmlFor="manha" className="cursor-pointer">Manhã (8h-12h)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tarde" id="tarde" />
                  <label htmlFor="tarde" className="cursor-pointer">Tarde (12h-18h)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="noite" id="noite" />
                  <label htmlFor="noite" className="cursor-pointer">Noite (18h-22h)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexivel-hora" id="flexivel-hora" />
                  <label htmlFor="flexivel-hora" className="cursor-pointer">Flexível</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_feedback"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de feedback preferido: *</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direto" id="direto" />
                  <label htmlFor="direto" className="cursor-pointer">Direto ao ponto (sem rodeios)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="construtivo" id="construtivo" />
                  <label htmlFor="construtivo" className="cursor-pointer">Construtivo e encorajador</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="depende" id="depende" />
                  <label htmlFor="depende" className="cursor-pointer">Depende do momento</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="limitacoes_tecnicas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tem alguma limitação técnica?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Computador, internet, acesso a ferramentas, etc."
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
