import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateDesconto,
  useUpdateDesconto,
  useProdutosAtivos,
  type Desconto,
} from "@/hooks/admin/useProdutos";

const descontoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().optional(),
  motivo: z.string().min(1, "Motivo é obrigatório"),
  tipo_desconto: z.enum(["percentual", "valor_fixo"]),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  produtos_ids: z.array(z.string()).default([]),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  ativo: z.boolean().default(true),
});

type DescontoFormData = z.infer<typeof descontoSchema>;

interface DescontoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  desconto?: Desconto;
}

export function DescontoModal({ open, onOpenChange, desconto }: DescontoModalProps) {
  const { data: produtos } = useProdutosAtivos();
  const createDesconto = useCreateDesconto();
  const updateDesconto = useUpdateDesconto();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DescontoFormData>({
    resolver: zodResolver(descontoSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      motivo: "",
      tipo_desconto: "percentual",
      valor: 0,
      produtos_ids: [],
      data_inicio: "",
      data_fim: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (desconto) {
      form.reset({
        nome: desconto.nome,
        codigo: desconto.codigo || "",
        motivo: desconto.motivo,
        tipo_desconto: desconto.tipo_desconto,
        valor: desconto.valor,
        produtos_ids: desconto.produtos_ids || [],
        data_inicio: desconto.data_inicio
          ? new Date(desconto.data_inicio).toISOString().split("T")[0]
          : "",
        data_fim: desconto.data_fim
          ? new Date(desconto.data_fim).toISOString().split("T")[0]
          : "",
        ativo: desconto.ativo,
      });
    } else {
      form.reset({
        nome: "",
        codigo: "",
        motivo: "",
        tipo_desconto: "percentual",
        valor: 0,
        produtos_ids: [],
        data_inicio: "",
        data_fim: "",
        ativo: true,
      });
    }
  }, [desconto, form]);

  const onSubmit = async (data: DescontoFormData) => {
    setIsSubmitting(true);
    try {
      const descontoData: Omit<Desconto, "id" | "created_at" | "updated_at"> = {
        nome: data.nome,
        codigo: data.codigo || undefined,
        motivo: data.motivo,
        tipo_desconto: data.tipo_desconto,
        valor: data.valor,
        produtos_ids: data.produtos_ids,
        ativo: data.ativo,
        data_inicio: data.data_inicio ? new Date(data.data_inicio).toISOString() : undefined,
        data_fim: data.data_fim ? new Date(data.data_fim).toISOString() : undefined,
      };

      if (desconto) {
        await updateDesconto.mutateAsync({
          id: desconto.id,
          ...descontoData,
        });
      } else {
        await createDesconto.mutateAsync(descontoData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar desconto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {desconto ? "Editar Desconto" : "Novo Desconto"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do desconto abaixo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Desconto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Black Friday 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Cupom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: BF25" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo/Justificativa *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Campanha anual de Black Friday"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_desconto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Desconto *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                        <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="produtos_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Produtos Aplicáveis</FormLabel>
                  <div className="space-y-2">
                    {produtos?.map((produto) => (
                      <FormField
                        key={produto.id}
                        control={form.control}
                        name="produtos_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(produto.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  const newValue = checked
                                    ? [...currentValue, produto.id]
                                    : currentValue.filter((id) => id !== produto.id);
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {produto.nome}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    Selecione os produtos onde este desconto será aplicado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Fim</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Status Ativo</FormLabel>
                    <FormDescription>
                      Desconto ativo e disponível para uso
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : desconto ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
