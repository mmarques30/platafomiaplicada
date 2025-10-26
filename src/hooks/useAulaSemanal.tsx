import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AulaSemanal {
  id: string;
  tema: string;
  horario: string;
  dia_semana: string;
  ativo: boolean;
}

export function useAulaSemanal() {
  const queryClient = useQueryClient();

  const { data: aulaAtiva, isLoading } = useQuery({
    queryKey: ['aula-semanal-ativa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aulas_semanais')
        .select('*')
        .eq('ativo', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as AulaSemanal | null;
    },
  });

  const atualizarAula = useMutation({
    mutationFn: async (novaAula: Partial<AulaSemanal> & { id?: string }) => {
      // Desativar todas as aulas anteriores
      await supabase
        .from('aulas_semanais')
        .update({ ativo: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Se tem ID, atualiza; senão, insere
      if (novaAula.id) {
        const { data, error } = await supabase
          .from('aulas_semanais')
          .update({
            tema: novaAula.tema!,
            horario: novaAula.horario,
            dia_semana: novaAula.dia_semana,
            ativo: true,
          })
          .eq('id', novaAula.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('aulas_semanais')
          .insert({
            tema: novaAula.tema!,
            horario: novaAula.horario || '19:30',
            dia_semana: novaAula.dia_semana || 'Toda semana',
            ativo: true,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aula-semanal-ativa'] });
      toast.success('Tema da aula atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tema da aula');
      console.error(error);
    },
  });

  return { aulaAtiva, isLoading, atualizarAula };
}
