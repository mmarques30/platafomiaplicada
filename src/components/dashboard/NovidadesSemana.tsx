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
    <Card className="relative overflow-hidden card-primary p-8 md:p-12 border-2 border-primary/20 shadow-xl">
      {/* Decorative circles */}
      <div className="absolute top-4 right-4 w-32 h-32 opacity-20">
        <div className="absolute inset-0 rounded-full border-2 border-primary"></div>
        <div className="absolute inset-4 rounded-full border-2 border-primary"></div>
        <div className="absolute inset-8 rounded-full border-2 border-primary"></div>
      </div>

      {/* Large asterisk decoration */}
      <div className="absolute top-8 left-8 text-primary/20">
        <Sparkles className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Title section */}
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            NOVIDADES
          </h2>
          <p className="text-primary text-sm md:text-base font-semibold tracking-wider uppercase">
            Produtividade Real. Sem Enrolação. Além do Óbvio
          </p>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-4">
          <h3 className="text-2xl font-bold text-foreground">
            {novidades.titulo}
          </h3>
          <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {novidades.mensagem}
          </div>
          {novidades.created_at && (
            <p className="text-sm text-muted-foreground mt-4 font-medium">
              Publicado em {new Date(novidades.created_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
