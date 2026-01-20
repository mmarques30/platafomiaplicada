import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCreateInstrucao, useUpdateInstrucao, type InstrucaoEtapa } from "@/hooks/useEtapasBusiness";
import { PassosInstrucaoEditor } from "./PassosInstrucaoEditor";
import { 
  PassoInstrucao, 
  RecursosInstrucao, 
  usePersonalizarInstrucaoIA 
} from "@/hooks/useInstrucaoRecursos";
import type { Json } from "@/integrations/supabase/types";

const formSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  responsavel: z.enum(["voce", "mentor", "conjunto"]),
  ferramenta: z.enum(["claude", "lovable", "reuniao", "outro"]).optional(),
  dicas: z.string().optional(),
  ordem: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InstrucaoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etapaId: string;
  instrucao?: InstrucaoEtapa | null;
  defaultResponsavel?: 'voce' | 'mentor' | 'conjunto';
  contexto?: {
    etapaTitulo?: string;
    contratoNomeEmpresa?: string;
  };
}

export function InstrucaoFormModal({
  open,
  onOpenChange,
  etapaId,
  instrucao,
  defaultResponsavel = 'voce',
  contexto,
}: InstrucaoFormModalProps) {
  const createInstrucao = useCreateInstrucao();
  const updateInstrucao = useUpdateInstrucao();
  const { personalizarInstrucao, isPersonalizing } = usePersonalizarInstrucaoIA();
  const isEditing = !!instrucao;

  // Estado para passos e texto orientativo
  const [passos, setPassos] = useState<PassoInstrucao[]>([]);
  const [textoOrientativo, setTextoOrientativo] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      responsavel: defaultResponsavel,
      ferramenta: "outro",
      dicas: "",
      ordem: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (instrucao) {
        // Carregar dados existentes
        const recursos = instrucao.recursos as RecursosInstrucao | null;
        setPassos(recursos?.passos || []);
        setTextoOrientativo(recursos?.texto_orientativo || '');
        
        form.reset({
          titulo: instrucao.titulo,
          descricao: instrucao.descricao || "",
          responsavel: instrucao.responsavel as 'voce' | 'mentor' | 'conjunto',
          ferramenta: (instrucao.ferramenta as 'claude' | 'lovable' | 'reuniao' | 'outro') || "outro",
          dicas: instrucao.dicas || "",
          ordem: instrucao.ordem || 0,
        });
      } else {
        // Limpar para nova instrução
        setPassos([]);
        setTextoOrientativo('');
        form.reset({
          titulo: "",
          descricao: "",
          responsavel: defaultResponsavel,
          ferramenta: "outro",
          dicas: "",
          ordem: 0,
        });
      }
    }
  }, [open, instrucao, defaultResponsavel, form]);

  const handlePersonalizar = async () => {
    if (!textoOrientativo.trim()) {
      toast.error("Digite um texto orientativo para personalizar");
      return;
    }

    const resultado = await personalizarInstrucao(
      textoOrientativo,
      passos,
      {
        ...contexto,
        instrucaoTitulo: form.getValues('titulo'),
      }
    );

    if (resultado) {
      form.setValue('descricao', resultado);
      toast.success("Descrição personalizada gerada!");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Montar objeto de recursos
      const recursosData: RecursosInstrucao = {
        passos,
        texto_orientativo: textoOrientativo || undefined,
        instrucao_personalizada: data.descricao || undefined,
      };

      if (isEditing && instrucao) {
        await updateInstrucao.mutateAsync({
          id: instrucao.id,
          etapaId: etapaId,
          titulo: data.titulo,
          descricao: data.descricao || null,
          responsavel: data.responsavel,
          ferramenta: data.ferramenta || null,
          dicas: data.dicas || null,
          recursos: recursosData as unknown as Json,
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
          dicas: data.dicas || null,
          recursos: recursosData as unknown as Json,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Instrução" : "Nova Instrução"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos básicos */}
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

            <Separator />

            {/* Editor de Passos */}
            <PassosInstrucaoEditor
              passos={passos}
              onChange={setPassos}
              etapaId={etapaId}
            />

            <Separator />

            {/* Seção de IA */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                ORIENTAÇÃO PARA IA (opcional)
              </h4>
              
              <Textarea
                placeholder="Cole aqui o texto orientativo. A IA irá usar este conteúdo para personalizar a descrição da instrução considerando o contexto do projeto e os recursos anexados..."
                value={textoOrientativo}
                onChange={(e) => setTextoOrientativo(e.target.value)}
                rows={4}
                className="resize-none"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handlePersonalizar}
                disabled={isPersonalizing || !textoOrientativo.trim()}
                className="w-full"
              >
                {isPersonalizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Personalizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Personalizar via IA
                  </>
                )}
              </Button>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (editável)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da instrução para o cliente..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Campos adicionais */}
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
