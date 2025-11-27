import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AulaSemanal {
  id: string;
  tema: string;
  horario: string | null;
  dia_semana: string | null;
  data_aula: string | null;
  descricao: string | null;
  ativo: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateAulaInput {
  tema: string;
  horario?: string | null;
  dia_semana?: string | null;
  data_aula?: string | null;
  descricao?: string | null;
  ativo?: boolean;
}

export function useAulasCalendario() {
  return useQuery({
    queryKey: ["aulas-calendario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aulas_semanais")
        .select("*")
        .eq("ativo", true)
        .order("data_aula", { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data as AulaSemanal[];
    },
  });
}

export function useProximaAula() {
  return useQuery({
    queryKey: ["proxima-aula"],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("aulas_semanais")
        .select("*")
        .eq("ativo", true)
        .gte("data_aula", hoje)
        .order("data_aula", { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AulaSemanal | null;
    },
  });
}

export function useCreateAula() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (aula: CreateAulaInput) => {
      const { data, error } = await supabase
        .from("aulas_semanais")
        .insert([aula])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas-calendario"] });
      queryClient.invalidateQueries({ queryKey: ["proxima-aula"] });
      queryClient.invalidateQueries({ queryKey: ["aula-ativa"] });
      toast.success("Aula criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar aula");
    },
  });
}

export function useUpdateAula() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AulaSemanal> & { id: string }) => {
      const { data, error } = await supabase
        .from("aulas_semanais")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas-calendario"] });
      queryClient.invalidateQueries({ queryKey: ["proxima-aula"] });
      queryClient.invalidateQueries({ queryKey: ["aula-ativa"] });
      toast.success("Aula atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar aula");
    },
  });
}

export function useDeleteAula() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("aulas_semanais")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas-calendario"] });
      queryClient.invalidateQueries({ queryKey: ["proxima-aula"] });
      queryClient.invalidateQueries({ queryKey: ["aula-ativa"] });
      toast.success("Aula removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover aula");
    },
  });
}
