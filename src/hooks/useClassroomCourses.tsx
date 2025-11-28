import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ClassroomCourse {
  id: string;
  titulo: string;
  descricao: string | null;
  thumbnail_url: string | null;
  tipo: string;
  conteudo: any;
  gratuito: boolean;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  progresso?: number;
  completado?: boolean;
}

export function useClassroomCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["classroom-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classroom_courses")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;

      // Get user progress for each course
      if (user) {
        const { data: progressData } = await supabase
          .from("classroom_progress")
          .select("course_id, progresso, completado")
          .eq("user_id", user.id);

        const progressMap = new Map(
          progressData?.map((p) => [p.course_id, p]) || []
        );

        return data.map((course) => {
          const progress = progressMap.get(course.id);
          return {
            ...course,
            progresso: progress?.progresso || 0,
            completado: progress?.completado || false,
          };
        });
      }

      return data;
    },
    enabled: !!user,
  });

  const updateProgress = useMutation({
    mutationFn: async ({
      courseId,
      progresso,
      completado,
    }: {
      courseId: string;
      progresso: number;
      completado: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("classroom_progress")
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progresso,
          completado,
        })
        .select()
        .single();

      if (error) throw error;

      // Award points if completed
      if (completado) {
        await supabase.rpc("add_community_points" as any, {
          p_user_id: user.id,
          p_points: 50,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classroom-courses"] });
      toast.success("Progresso atualizado!");
    },
  });

  return {
    courses: courses || [],
    isLoading,
    updateProgress: updateProgress.mutate,
  };
}
