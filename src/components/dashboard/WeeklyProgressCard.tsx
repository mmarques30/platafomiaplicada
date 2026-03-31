import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountUp } from "@/hooks/useCountUp";

const STORAGE_KEY = "last_weekly_card_shown";

function shouldShowCard(): boolean {
  const last = localStorage.getItem(STORAGE_KEY);
  if (!last) return true;
  const diff = Date.now() - parseInt(last, 10);
  return diff > 7 * 24 * 60 * 60 * 1000;
}

export function WeeklyProgressCard() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowCard());
  }, []);

  const { data } = useQuery({
    queryKey: ["weekly-progress", user?.id],
    enabled: !!user?.id && visible,
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [videosRes, trilhasRes] = await Promise.all([
        supabase
          .from("progresso_videos")
          .select("id")
          .eq("user_id", user!.id)
          .eq("completado", true)
          .gte("updated_at", oneWeekAgo.toISOString()),
        supabase
          .from("progresso_videos")
          .select("videos(modulo_id, modulos(trilha_id, trilhas(titulo)))")
          .eq("user_id", user!.id)
          .eq("completado", false)
          .limit(1),
      ]);

      const videoCount = videosRes.data?.length ?? 0;

      let trilhaEmAndamento: string | null = null;
      if (trilhasRes.data?.[0]) {
        const video = trilhasRes.data[0] as any;
        trilhaEmAndamento = video?.videos?.modulos?.trilhas?.titulo ?? null;
      }

      return { videoCount, trilhaEmAndamento };
    },
  });

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(false);
  };

  const animatedVideoCount = useCountUp(data?.videoCount ?? 0);

  if (!visible || !data || (data.videoCount === 0 && !data.trilhaEmAndamento)) {
    return null;
  }

  return (
    <div className="card-micro-hover relative bg-[#1a1c19]/80 border border-[#9EB038]/20 rounded-xl p-4 md:p-5">
      <Button
        variant="ghost"
        size="icon"
        onClick={dismiss}
        className="absolute top-2 right-2 h-7 w-7 text-white/40 hover:text-white/70 hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9EB038]/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#9EB038]" />
        </div>

        <div className="space-y-1 flex-1 pr-6">
          <p className="text-sm font-semibold text-[#9EB038] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Resumo da semana — MarIAna
          </p>

          <p className="text-sm text-white/80 leading-relaxed">
            {data.videoCount > 0 ? (
              <>
                Na última semana você concluiu{" "}
                <strong className="text-white">{data.videoCount} vídeo{data.videoCount > 1 ? "s" : ""}</strong>.{" "}
              </>
            ) : (
              <>Você não concluiu vídeos na última semana. </>
            )}
            {data.trilhaEmAndamento ? (
              <>
                Continue com a trilha{" "}
                <strong className="text-[#9EB038]">{data.trilhaEmAndamento}</strong>!
              </>
            ) : (
              <>Explore uma trilha nova para continuar evoluindo!</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
