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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StepProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
}

export function Step1InformacoesPessoais({ form, onNext }: StepProps) {
  const areaAtuacao = form.watch("area_atuacao");
  const lideraEquipe = form.watch("lidera_equipe");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Informações Pessoais</h2>
        <p className="text-muted-foreground">Quem é você?</p>
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
                  placeholder="18"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
            <FormLabel>LinkedIn</FormLabel>
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
            <FormLabel>Profissão/Cargo atual *</FormLabel>
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
            <FormLabel>Área/Setor de atuação *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua área" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="marketing">Marketing/Comunicação</SelectItem>
                <SelectItem value="vendas">Vendas/Comercial</SelectItem>
                <SelectItem value="rh">RH/People</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="operacoes">Operações</SelectItem>
                <SelectItem value="produto">Produto</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {areaAtuacao === "outro" && (
        <FormField
          control={form.control}
          name="area_atuacao_outro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especifique sua área</FormLabel>
              <FormControl>
                <Input placeholder="Digite sua área de atuação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="tempo_experiencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo de experiência *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-1">0-1 ano</SelectItem>
                  <SelectItem value="1-3">1-3 anos</SelectItem>
                  <SelectItem value="3-5">3-5 anos</SelectItem>
                  <SelectItem value="5-10">5-10 anos</SelectItem>
                  <SelectItem value="10+">+10 anos</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="freelancer">Freelancer/Autônomo</SelectItem>
                  <SelectItem value="startup">Startup (até 50)</SelectItem>
                  <SelectItem value="pequena">Pequena (50-100)</SelectItem>
                  <SelectItem value="media">Média (100-500)</SelectItem>
                  <SelectItem value="grande">Grande (500-5000)</SelectItem>
                  <SelectItem value="multinacional">Multinacional (+5000)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="lidera_equipe"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você lidera equipe? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "sim")}
                value={field.value ? "sim" : "nao"}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="sim" />
                  <label htmlFor="sim" className="cursor-pointer">Sim</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="nao" />
                  <label htmlFor="nao" className="cursor-pointer">Não</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {lideraEquipe && (
        <FormField
          control={form.control}
          name="tamanho_equipe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantas pessoas?</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
