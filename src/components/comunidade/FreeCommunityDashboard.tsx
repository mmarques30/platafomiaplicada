import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FreeCentralConteudo } from "./FreeCentralConteudo";
import { FreeUsersTicker } from "./FreeUsersTicker";
import { FreeMateriaisDicas } from "./FreeMateriaisDicas";

export function FreeCommunityDashboard() {
  const { user } = useAuth();

  // Buscar nome do usuário
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });
  
  // Saudação dinâmica baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = profile?.nome_completo?.split(' ')[0] || user?.email?.split('@')[0] || 'Visitante';
  const today = new Date();
  const dayOfWeek = format(today, "EEEE", { locale: ptBR }).toUpperCase();
  const dayNumber = format(today, "dd");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header com Saudação e Data */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {getGreeting()}, <span className="text-primary">{firstName}</span>!
              </h1>
              <p className="text-muted-foreground mt-1">
                Aplique, replique e domine IA
              </p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2 border border-primary/20">
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{dayNumber}</span>
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                {dayOfWeek}
              </div>
            </div>
          </div>
        </section>

        {/* Central de Conteúdo */}
        <FreeCentralConteudo />

        {/* Materiais + Dicas - 2 colunas */}
        <FreeMateriaisDicas />

        {/* Ticker de Indicadores */}
        <FreeUsersTicker />
      </div>
    </div>
  );
}
