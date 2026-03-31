import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { Card } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { format, isAfter, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function InsightSemanalCard() {
  const userId = useBusinessUserId();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: formulario, isLoading } = useQuery({
    queryKey: ["formulario-diagnostico", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("id, insight_ia, insight_gerado_em")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;
  if (!formulario) return null;

  const insightGeradoEm = formulario.insight_gerado_em
    ? new Date(formulario.insight_gerado_em)
    : null;

  const isRecent =
    insightGeradoEm && isAfter(insightGeradoEm, subDays(new Date(), 7));

  const insightData = formulario.insight_ia as Record<string, unknown> | null;

  const insightText =
    insightData &&
    ((insightData.analise_perfil as string) ||
      (insightData.recomendacao_foco as string) ||
      (insightData.resumo as string) ||
      JSON.stringify(insightData));

  const handleGerar = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke(
        "gerar-insight-mentoria",
        { body: { formulario_id: formulario.id } }
      );
      if (error) throw error;
      queryClient.invalidateQueries({
        queryKey: ["formulario-diagnostico"],
      });
      toast({
        title: "Insight gerado com sucesso!",
        description: "Sua análise personalizada está pronta",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar insight",
        description: err.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <SkeletonCard variant="list" />;
  }

  if (isRecent && insightText) {
    return (
      <Card className="border-l-4 border-l-[#AFC040] p-4 flex flex-col gap-2">
        <span className="uppercase text-[11px] font-semibold tracking-wider text-muted-foreground">
          Insight da Semana
        </span>
        <p className="text-sm text-foreground leading-relaxed">{insightText}</p>
        <span className="text-[11px] text-muted-foreground mt-1">
          Gerado em{" "}
          {format(insightGeradoEm!, "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-border p-4 flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        Nenhuma análise esta semana
      </span>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 shrink-0"
        onClick={handleGerar}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Gerar análise
      </Button>
    </Card>
  );
}
