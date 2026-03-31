import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, BookOpen, PlayCircle, ChevronRight, Loader2 } from "lucide-react";

export function AcademyProximoPasso() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: diagnostico, isLoading: loadingDiag } = useQuery({
    queryKey: ["academy-diagnostico-status", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("formulario_diagnostico")
        .select("completado")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: trilhaEmAndamento, isLoading: loadingTrilha } = useQuery({
    queryKey: ["academy-trilha-andamento", user?.id],
    enabled: !!user?.id && diagnostico?.completado === true,
    queryFn: async () => {
      // Find most recent video progress to determine current trail
      const { data } = await supabase
        .from("progresso_videos")
        .select("video_id, videos(id, titulo, modulo_id, modulos(trilha_id, trilhas(id, titulo)))")
        .eq("user_id", user!.id)
        .eq("completado", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const isLoading = loadingDiag || loadingTrilha;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Level 1: Diagnostic not completed
  if (!diagnostico || diagnostico.completado !== true) {
    return (
      <Card className="h-full border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Próximo Passo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Complete seu diagnóstico para recebermos recomendações personalizadas de trilhas e conteúdos.
          </p>
          <Button
            onClick={() => navigate("/diagnostico/formulario")}
            className="w-full sm:w-auto gap-2"
          >
            Preencher diagnóstico
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Level 3: Trail in progress - continue where left off
  if (trilhaEmAndamento) {
    const video = trilhaEmAndamento.videos as any;
    const trilhaTitulo = video?.modulos?.trilhas?.titulo || "sua trilha";
    const videoTitulo = video?.titulo || "próxima aula";
    const trilhaId = video?.modulos?.trilhas?.id;

    return (
      <Card className="h-full border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            Continue de onde parou
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{trilhaTitulo}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Próxima aula: {videoTitulo}
            </p>
          </div>
          <Button
            onClick={() => navigate(trilhaId ? `/trilhas/${trilhaId}` : "/trilhas")}
            className="w-full sm:w-auto gap-2"
          >
            Continuar assistindo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Level 2: Diagnostic done, no trail started - recommend first trail
  return (
    <Card className="h-full border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Trilha Recomendada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Seu diagnóstico está completo! Explore as trilhas disponíveis e comece sua jornada de aprendizado.
        </p>
        <Button
          onClick={() => navigate("/trilhas")}
          className="w-full sm:w-auto gap-2"
        >
          Ver trilhas disponíveis
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
