import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function NovidadesSemana() {
  const { data: novidades, isLoading } = useQuery({
    queryKey: ["novidades-semana"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("tipo", "novidades")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-48" />;
  }

  if (!novidades) {
    return null;
  }

  return (
    <article
      data-novidades
      className="rounded-xl border border-brand-hairline bg-card p-5 md:p-7"
    >
      <div className="space-y-3">
        <h3 className="font-serif-display text-xl leading-tight text-foreground md:text-2xl">
          {novidades.titulo}
        </h3>
        <div className="whitespace-pre-wrap text-sm font-light leading-relaxed text-foreground/85 md:text-base">
          {novidades.mensagem}
        </div>
        {novidades.created_at && (
          <p className="pt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Publicado em {new Date(novidades.created_at).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </article>
  );
}
