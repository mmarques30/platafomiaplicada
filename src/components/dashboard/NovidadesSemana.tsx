import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

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
    return <Skeleton className="w-full h-64" />;
  }

  if (!novidades) {
    return null;
  }

  return (
    <Card data-novidades className="card-interactive relative overflow-hidden card-primary p-3 sm:p-4 md:p-8 lg:p-12 border border-primary/20 sm:border-2 shadow-lg sm:shadow-xl">
      {/* Decorative circles - hidden on mobile */}
      <div className="hidden sm:block absolute top-4 right-4 w-20 md:w-32 h-20 md:h-32 opacity-20">
        <div className="absolute inset-0 rounded-full border-2 border-primary"></div>
        <div className="absolute inset-2 md:inset-4 rounded-full border-2 border-primary"></div>
        <div className="absolute inset-4 md:inset-8 rounded-full border-2 border-primary"></div>
      </div>

      {/* Large asterisk decoration - hidden on mobile */}
      <div className="hidden sm:block absolute top-4 md:top-8 left-4 md:left-8 text-primary/20">
        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Title section */}
        <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            NOVIDADES
          </h2>
          <p className="text-primary text-[10px] sm:text-xs md:text-base font-semibold tracking-wider uppercase">
            Produtividade Real. Sem Enrolação. Além do Óbvio
          </p>
        </div>

        {/* Content */}
        <div className="mt-2 sm:mt-4 md:mt-8 space-y-2 sm:space-y-3 md:space-y-4">
          <h3 className="text-base sm:text-lg md:text-2xl font-bold text-foreground">
            {novidades.titulo}
          </h3>
          <div className="text-xs sm:text-sm md:text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {novidades.mensagem}
          </div>
          {novidades.created_at && (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-2 sm:mt-3 md:mt-4 font-medium">
              Publicado em {new Date(novidades.created_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
