import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - yearStart.getTime()) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

export function RitmoCard() {
  const { user } = useAuth();

  const { data: ritmo } = useQuery({
    queryKey: ["ritmo-semanal", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const oitoSemanasAtras = new Date();
      oitoSemanasAtras.setDate(oitoSemanasAtras.getDate() - 56);

      const { data } = await supabase
        .from("progresso_videos")
        .select("id, created_at")
        .eq("user_id", user!.id)
        .eq("completado", true)
        .gte("created_at", oitoSemanasAtras.toISOString())
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) return null;

      // Group by week
      const porSemana: Record<string, number> = {};
      for (const item of data) {
        const key = getWeekKey(new Date(item.created_at));
        porSemana[key] = (porSemana[key] || 0) + 1;
      }

      // Build ordered week keys for last 8 weeks
      const now = new Date();
      const semanas: string[] = [];
      for (let i = 0; i < 8; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const key = getWeekKey(d);
        if (!semanas.includes(key)) semanas.push(key);
      }

      // Need at least 3 weeks with data
      const semanasComDados = semanas.filter(s => (porSemana[s] || 0) > 0);
      if (semanasComDados.length < 3) return null;

      const recentes = semanas.slice(0, 2);
      const historico = semanas.slice(2);

      const atualMedia = recentes.reduce((sum, s) => sum + (porSemana[s] || 0), 0) / recentes.length;
      const baseMedia = historico.length > 0
        ? historico.reduce((sum, s) => sum + (porSemana[s] || 0), 0) / historico.length
        : 0;

      const variacaoPct = baseMedia > 0 ? Math.round(((atualMedia - baseMedia) / baseMedia) * 100) : 0;

      return { atualMedia: Math.round(atualMedia * 10) / 10, variacaoPct };
    },
  });

  if (!ritmo) return null;

  const { atualMedia, variacaoPct } = ritmo;

  const isUp = variacaoPct > 15;
  const isDown = variacaoPct < -15;

  const borderColor = isUp ? "border-[#AFC040]" : isDown ? "border-[#E8735A]" : "border-muted-foreground/30";
  const badgeColor = isUp
    ? "bg-[#AFC040]/15 text-[#AFC040]"
    : isDown
      ? "bg-[#E8735A]/15 text-[#E8735A]"
      : "bg-muted text-muted-foreground";

  const badgeText = isUp
    ? `↑ ${variacaoPct}% acima do seu ritmo médio`
    : isDown
      ? `↓ ${Math.abs(variacaoPct)}% abaixo do seu ritmo médio`
      : "→ Ritmo estável";

  return (
    <Card className={`border-t-[3px] ${borderColor}`}>
      <CardContent className="pt-5 pb-4 space-y-2">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          SEU RITMO
        </span>
        <p className="text-2xl font-bold text-foreground">
          {atualMedia} <span className="text-sm font-normal text-muted-foreground">módulos/semana</span>
        </p>
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}>
          {badgeText}
        </span>
      </CardContent>
    </Card>
  );
}
