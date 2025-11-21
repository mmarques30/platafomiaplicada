import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaseProcesso } from "@/hooks/useFasesProcesso";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";

interface FaseEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fase: FaseProcesso | null;
  userId: string;
  onSubmit: (data: Partial<FaseProcesso> & { id: string }) => void;
  isLoading?: boolean;
}

export const FaseEditModal = ({ open, onOpenChange, fase, userId, onSubmit, isLoading }: FaseEditModalProps) => {
  const form = useForm<Partial<FaseProcesso>>();
  const { projetos } = useMentoriaProjetos(userId);
  const { sessoes } = useMentoriaSessoes(userId);

  useEffect(() => {
    if (fase) {
      form.reset({
        status: fase.status,
        data_inicio: fase.data_inicio ? new Date(fase.data_inicio).toISOString().split('T')[0] : undefined,
        data_conclusao: fase.data_conclusao ? new Date(fase.data_conclusao).toISOString().split('T')[0] : undefined,
        projeto_associado_id: fase.projeto_associado_id || undefined,
        sessao_associada_id: fase.sessao_associada_id || undefined,
        observacoes: fase.observacoes || "",
      });
    }
  }, [fase, form]);

  const handleSubmit = (data: Partial<FaseProcesso>) => {
    if (!fase) return;

    const updates: Partial<FaseProcesso> & { id: string } = {
      id: fase.id,
      ...data,
      data_inicio: data.data_inicio ? new Date(data.data_inicio).toISOString() : null,
      data_conclusao: data.data_conclusao ? new Date(data.data_conclusao).toISOString() : null,
    } as Partial<FaseProcesso> & { id: string };

    onSubmit(updates);
    onOpenChange(false);
  };

  if (!fase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Fase {fase.fase_numero} - {fase.nome_fase}</DialogTitle>
          <DialogDescription>
            Atualize o status, associações e observações da fase
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="bloqueada">Bloqueada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_conclusao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Conclusão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Projeto Associado */}
            {fase.fase_numero >= 3 && fase.fase_numero <= 8 && (
              <FormField
                control={form.control}
                name="projeto_associado_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto Associado</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Nenhum</SelectItem>
                        {projetos.map((projeto) => (
                          <SelectItem key={projeto.id} value={projeto.id}>
                            {projeto.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Sessão Associada */}
            <FormField
              control={form.control}
              name="sessao_associada_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sessão Associada</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma sessão (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhuma</SelectItem>
                      {sessoes.map((sessao) => (
                        <SelectItem key={sessao.id} value={sessao.id}>
                          {sessao.titulo} - {new Date(sessao.data_sessao).toLocaleDateString("pt-BR")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações do Mentor</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione observações sobre o progresso desta fase..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
