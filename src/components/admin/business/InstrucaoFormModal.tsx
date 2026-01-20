import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateInstrucao, useUpdateInstrucao, type InstrucaoEtapa } from "@/hooks/useEtapasBusiness";

const formSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  responsavel: z.enum(["voce", "mentor", "conjunto"]),
  ferramenta: z.enum(["claude", "lovable", "reuniao", "outro"]).optional(),
  prompt_sugerido: z.string().optional(),
  dicas: z.string().optional(),
  recursos_url: z.string().url("URL inválida").optional().or(z.literal("")),
  ordem: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InstrucaoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etapaId: string;
  instrucao?: InstrucaoEtapa | null;
  defaultResponsavel?: 'voce' | 'mentor' | 'conjunto';
}

export function InstrucaoFormModal({
  open,
  onOpenChange,
  etapaId,
  instrucao,
  defaultResponsavel = 'voce',
}: InstrucaoFormModalProps) {
  const createInstrucao = useCreateInstrucao();
  const updateInstrucao = useUpdateInstrucao();
  const isEditing = !!instrucao;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      responsavel: defaultResponsavel,
      ferramenta: "outro",
      prompt_sugerido: "",
      dicas: "",
      recursos_url: "",
      ordem: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (instrucao) {
        form.reset({
          titulo: instrucao.titulo,
          descricao: instrucao.descricao || "",
          responsavel: instrucao.responsavel as 'voce' | 'mentor' | 'conjunto',
          ferramenta: (instrucao.ferramenta as 'claude' | 'lovable' | 'reuniao' | 'outro') || "outro",
          prompt_sugerido: instrucao.prompt_sugerido || "",
          dicas: instrucao.dicas || "",
          recursos_url: instrucao.recursos_url || "",
          ordem: instrucao.ordem || 0,
        });
      } else {
        form.reset({
          titulo: "",
          descricao: "",
          responsavel: defaultResponsavel,
          ferramenta: "outro",
          prompt_sugerido: "",
          dicas: "",
          recursos_url: "",
          ordem: 0,
        });
      }
    }
  }, [open, instrucao, defaultResponsavel, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && instrucao) {
        await updateInstrucao.mutateAsync({
          id: instrucao.id,
          etapaId: etapaId,
          titulo: data.titulo,
          descricao: data.descricao || null,
          responsavel: data.responsavel,
          ferramenta: data.ferramenta || null,
          prompt_sugerido: data.prompt_sugerido || null,
          dicas: data.dicas || null,
          recursos_url: data.recursos_url || null,
          ordem: data.ordem,
        });
        toast.success("Instrução atualizada com sucesso");
      } else {
        await createInstrucao.mutateAsync({
          etapa_id: etapaId,
          titulo: data.titulo,
          descricao: data.descricao || null,
          responsavel: data.responsavel,
          ferramenta: data.ferramenta || null,
          prompt_sugerido: data.prompt_sugerido || null,
          dicas: data.dicas || null,
          recursos_url: data.recursos_url || null,
          ordem: data.ordem || 0,
          status: 'pendente',
          gerado_por_ia: false,
        });
        toast.success("Instrução criada com sucesso");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar instrução:", error);
      toast.error("Erro ao salvar instrução");
    }
  };

  const isPending = createInstrucao.isPending || updateInstrucao.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Instrução" : "Nova Instrução"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mapear processos atuais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que deve ser feito..."
                      className="resize-none"
                      rows={3}
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
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="voce">Cliente</SelectItem>
                        <SelectItem value="mentor">Consultoria</SelectItem>
                        <SelectItem value="conjunto">Conjunto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ferramenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ferramenta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="lovable">Lovable</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prompt_sugerido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Sugerido</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole aqui um prompt que pode ajudar na execução..."
                      className="resize-none font-mono text-sm"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dicas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dicas úteis para completar esta instrução..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recursos_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Material de Apoio</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ordem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
