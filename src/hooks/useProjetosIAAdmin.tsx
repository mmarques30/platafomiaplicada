import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useProjetosIAAdmin = () => {
  const queryClient = useQueryClient();

  const salvarComentarioMutation = useMutation({
    mutationFn: async ({
      projetoId,
      userId,
      comentariosMentor,
      devolutivaMentor,
      projetoTitulo
    }: {
      projetoId: string;
      userId: string;
      comentariosMentor: string;
      devolutivaMentor: string;
      projetoTitulo: string;
    }) => {
      // Atualizar o projeto com os comentários
      const { error: updateError } = await supabase
        .from("projetos_mentoria")
        .update({
          comentarios_mentor: comentariosMentor,
          devolutiva_mentor: devolutivaMentor,
          updated_at: new Date().toISOString()
        })
        .eq("id", projetoId);

      if (updateError) throw updateError;

      // Criar notificação para o aluno
      const { error: notifError } = await supabase
        .from("notificacoes")
        .insert({
          user_id: userId,
          titulo: "Nova dica da mentora",
          mensagem: `Sua mentora comentou no projeto: ${projetoTitulo}`,
          tipo: "mentoria",
          link: "/meu-diagnostico"
        });

      if (notifError) throw notifError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria"] });
      toast({
        title: "Comentário salvo!",
        description: "O aluno foi notificado sobre seu feedback"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar comentário",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    salvarComentario: salvarComentarioMutation.mutate,
    isSaving: salvarComentarioMutation.isPending
  };
};
