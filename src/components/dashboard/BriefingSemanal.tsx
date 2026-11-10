import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

function getWeekNumber(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const w1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

export function BriefingSemanal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<{ titulo: string; resumo: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const ehSegunda = new Date().getDay() === 1;
  const chave = `briefing_${user?.id}_semana_${getWeekNumber(new Date())}`;
  const jaViu = typeof window !== "undefined" ? localStorage.getItem(chave) : null;

  useEffect(() => {
    if (!user?.id || !ehSegunda || jaViu || dismissed) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("gerar-curadoria-semanal", {
          body: { tipos: ["noticia"] },
        });

        if (cancelled) return;

        if (error || !data?.curadoria?.noticia?.length) {
          setBriefing(null);
        } else {
          const first = data.curadoria.noticia[0];
          setBriefing({ titulo: first.titulo, resumo: first.resumo });
        }
      } catch {
        if (!cancelled) setBriefing(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id, ehSegunda, jaViu, dismissed]);

  if (!ehSegunda || jaViu || dismissed) return null;

  if (loading) {
    return (
      <section className="superficie space-y-3 p-4 md:p-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </section>
    );
  }

  if (!briefing) return null;

  const handleDismiss = () => {
    localStorage.setItem(chave, "true");
    setDismissed(true);
  };

  return (
    /*
     * O briefing da segunda.
     *
     * Era um cartão com uma tarja lime de 4px na borda esquerda, do tempo em
     * que todo aviso da plataforma se anunciava por uma barra colorida. A
     * tarja gritava sem dizer nada: a mesma borda servia para erro, aviso e
     * novidade. Aqui o que identifica o bloco é o rótulo em mono e o ponto
     * lime ao lado dele, que é a linguagem do resto do painel.
     */
    <section className="superficie space-y-3 p-4 md:p-5">
      <span className="rotulo-mono flex items-center gap-2">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
        Briefing da semana
      </span>
      <h3 className="text-base font-medium leading-snug text-foreground">{briefing.titulo}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{briefing.resumo}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="-ml-2 mt-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Check className="mr-1 h-3.5 w-3.5" />
        Entendido
      </Button>
    </section>
  );
}
